import { pool } from "../db/pool.js";
import { v4 as uuid } from "uuid";
import { getIo } from "../sockets/io.js";

export async function getMenuForToken(qrToken) {
  const tableRes = await pool.query(
    "SELECT id, restaurant_id, table_number, status FROM tables WHERE qr_code_token = $1",
    [qrToken]
  );
  if (tableRes.rows.length === 0) return null;
  const table = tableRes.rows[0];

  const categoriesRes = await pool.query(
    "SELECT id, name, sort_order FROM menu_categories WHERE restaurant_id = $1 ORDER BY sort_order",
    [table.restaurant_id]
  );
  const itemsRes = await pool.query(
    `SELECT mi.id, mi.category_id, mi.name, mi.description, mi.price, mi.is_veg,
            mi.spice_level, mi.image_url, mi.avg_prep_time_minutes, mi.is_available
     FROM menu_items mi
     JOIN menu_categories mc ON mi.category_id = mc.id
     WHERE mc.restaurant_id = $1
     ORDER BY mi.name`,
    [table.restaurant_id]
  );

  const categoriesWithItems = categoriesRes.rows.map((c) => ({
    ...c,
    items: itemsRes.rows.filter((i) => i.category_id === c.id),
  }));

  return { table, categories: categoriesWithItems };
}

export async function placeOrder(qrToken, cartItems, existingOrderId) {
  const tableRes = await pool.query(
    "SELECT id, restaurant_id FROM tables WHERE qr_code_token = $1",
    [qrToken]
  );
  if (tableRes.rows.length === 0) throw new Error("Invalid table");
  const table = tableRes.rows[0];

  if (!cartItems || cartItems.length === 0) throw new Error("Cart is empty");

  const menuItemIds = cartItems.map((c) => c.menuItemId);
  const menuItemsRes = await pool.query(
    `SELECT id, price, is_available FROM menu_items WHERE id = ANY($1::uuid[])`,
    [menuItemIds]
  );
  const priceMap = new Map(menuItemsRes.rows.map((m) => [m.id, m]));

  for (const c of cartItems) {
    const mi = priceMap.get(c.menuItemId);
    if (!mi) throw new Error(`Menu item not found: ${c.menuItemId}`);
    if (!mi.is_available) throw new Error(`Item no longer available`);
  }

  const conn = await pool.connect();
  try {
    await conn.query("BEGIN");

    let orderId = existingOrderId;
    if (orderId) {
      const existing = await conn.query(
        "SELECT id, status FROM orders WHERE id = $1 AND table_id = $2",
        [orderId, table.id]
      );
      if (existing.rows.length === 0) throw new Error("Order not found for this table");
    } else {
      orderId = uuid();
      await conn.query(
        "INSERT INTO orders (id, table_id, status) VALUES ($1, $2, 'placed')",
        [orderId, table.id]
      );
      await conn.query("UPDATE tables SET status = 'occupied' WHERE id = $1", [table.id]);
    }

    for (const c of cartItems) {
      const mi = priceMap.get(c.menuItemId);
      await conn.query(
        `INSERT INTO order_items (id, order_id, menu_item_id, quantity, special_instructions, item_status, unit_price)
         VALUES ($1, $2, $3, $4, $5, 'received', $6)`,
        [uuid(), orderId, c.menuItemId, c.quantity || 1, c.specialInstructions || null, mi.price]
      );
    }

    await recalculateOrderTotal(conn, orderId);
    await conn.query("COMMIT");

    const fullOrder = await getOrderById(orderId);

    const io = getIo();
    io.to("kitchen").to("waiter").to(`table:${table.id}`).emit("order:new", fullOrder);
    if (!existingOrderId) {
      io.to("admin").to("waiter").emit("table:status_changed", { tableId: table.id, status: "occupied" });
    }

    return fullOrder;
  } catch (err) {
    await conn.query("ROLLBACK");
    throw err;
  } finally {
    conn.release();
  }
}

async function recalculateOrderTotal(conn, orderId) {
  const orderRes = await conn.query("SELECT table_id FROM orders WHERE id = $1", [orderId]);
  const order = orderRes.rows[0];
  const tableRes = await conn.query("SELECT restaurant_id FROM tables WHERE id = $1", [order.table_id]);
  const table = tableRes.rows[0];
  const restaurantRes = await conn.query("SELECT tax_rate FROM restaurants WHERE id = $1", [table.restaurant_id]);
  const restaurant = restaurantRes.rows[0];

  const itemsRes = await conn.query(
    "SELECT quantity, unit_price FROM order_items WHERE order_id = $1",
    [orderId]
  );
  const subtotal = itemsRes.rows.reduce((sum, i) => sum + i.quantity * Number(i.unit_price), 0);
  const taxAmount = Math.round(subtotal * (Number(restaurant.tax_rate) / 100) * 100) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;

  await conn.query("UPDATE orders SET total_amount = $1, tax_amount = $2 WHERE id = $3", [
    total,
    taxAmount,
    orderId,
  ]);
}

export async function getOrderById(orderId) {
  const orderRes = await pool.query(
    `SELECT o.*, t.table_number, t.qr_code_token
     FROM orders o JOIN tables t ON o.table_id = t.id
     WHERE o.id = $1`,
    [orderId]
  );
  const order = orderRes.rows[0];
  if (!order) return null;

  const itemsRes = await pool.query(
    `SELECT oi.id, oi.menu_item_id, oi.quantity, oi.special_instructions, oi.item_status, oi.unit_price, mi.name, mi.avg_prep_time_minutes
     FROM order_items oi JOIN menu_items mi ON oi.menu_item_id = mi.id
     WHERE oi.order_id = $1
     ORDER BY oi.id`,
    [orderId]
  );

  const items = itemsRes.rows;
  const targetPrepMinutes = items.length ? Math.max(...items.map((i) => i.avg_prep_time_minutes)) : 10;
  return { ...order, items, target_prep_minutes: targetPrepMinutes };
}

export async function getOrderForToken(qrToken, orderId) {
  const tableRes = await pool.query("SELECT id FROM tables WHERE qr_code_token = $1", [qrToken]);
  const table = tableRes.rows[0];
  if (!table) return null;
  const order = await getOrderById(orderId);
  if (!order || order.table_id !== table.id) return null;
  return order;
}

export async function getActiveKitchenOrders() {
  const ordersRes = await pool.query(
    `SELECT o.*, t.table_number
     FROM orders o JOIN tables t ON o.table_id = t.id
     WHERE o.status IN ('placed','confirmed','preparing','ready')
     ORDER BY o.placed_at ASC`
  );
  const orders = ordersRes.rows;

  for (const order of orders) {
    const itemsRes = await pool.query(
      `SELECT oi.id, oi.menu_item_id, oi.quantity, oi.special_instructions, oi.item_status, mi.name, mi.avg_prep_time_minutes
       FROM order_items oi JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE oi.order_id = $1
       ORDER BY oi.id`,
      [order.id]
    );
    order.items = itemsRes.rows;
    order.target_prep_minutes = Math.max(...itemsRes.rows.map((i) => i.avg_prep_time_minutes), 10);
  }

  return orders;
}

const NEXT_STATUS = {
  placed: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "served",
  served: "billed",
  billed: "closed",
};

const TIMESTAMP_COLUMN = {
  confirmed: "confirmed_at",
  ready: "ready_at",
  served: "served_at",
};

export async function updateOrderStatus(orderId, targetStatus) {
  const order = await getOrderById(orderId);
  if (!order) throw new Error("Order not found");

  const validStatuses = Object.keys(NEXT_STATUS).concat(["closed"]);
  if (!validStatuses.includes(targetStatus)) throw new Error("Invalid status");

  const tsColumn = TIMESTAMP_COLUMN[targetStatus];
  if (tsColumn) {
    await pool.query(`UPDATE orders SET status = $1, ${tsColumn} = NOW() WHERE id = $2`, [
      targetStatus,
      orderId,
    ]);
  } else {
    await pool.query("UPDATE orders SET status = $1 WHERE id = $2", [targetStatus, orderId]);
  }

  if (targetStatus === "preparing" || targetStatus === "ready") {
    const itemStatus = targetStatus === "ready" ? "ready" : "preparing";
    await pool.query("UPDATE order_items SET item_status = $1 WHERE order_id = $2", [
      itemStatus,
      orderId,
    ]);
  }
  if (targetStatus === "served") {
    await pool.query("UPDATE order_items SET item_status = 'served' WHERE order_id = $1", [orderId]);
    await pool.query("UPDATE tables SET status = 'needs_bill' WHERE id = $1", [order.table_id]);
  }

  const updated = await getOrderById(orderId);

  const io = getIo();
  io.to("kitchen")
    .to("waiter")
    .to("admin")
    .to(`table:${order.table_id}`)
    .emit("order:status_changed", updated);

  if (targetStatus === "served") {
    io.to("admin").to("waiter").emit("table:status_changed", {
      tableId: order.table_id,
      status: "needs_bill",
    });
  }

  return updated;
}

export async function updateItemStatus(orderId, itemId, itemStatus) {
  await pool.query("UPDATE order_items SET item_status = $1 WHERE id = $2 AND order_id = $3", [
    itemStatus,
    itemId,
    orderId,
  ]);

  const allItems = (await getOrderById(orderId)).items;
  const allSameStatus = allItems.every((i) => i.item_status === itemStatus);

  const io = getIo();
  const order = await getOrderById(orderId);
  io.to("kitchen").to(`table:${order.table_id}`).emit("item:status_changed", {
    orderId,
    itemId,
    itemStatus,
    order,
  });

  if (allSameStatus && ["preparing", "ready"].includes(itemStatus)) {
    return updateOrderStatus(orderId, itemStatus);
  }

  return order;
}

export async function getWaiterTables(restaurantId) {
  const tablesRes = await pool.query(
    `SELECT id, table_number, status, qr_code_token FROM tables WHERE restaurant_id = $1 ORDER BY table_number`,
    [restaurantId]
  );
  const tables = tablesRes.rows;

  for (const t of tables) {
    const ordersRes = await pool.query(
      `SELECT id, status, placed_at FROM orders
       WHERE table_id = $1 AND status NOT IN ('closed')
       ORDER BY placed_at DESC`,
      [t.id]
    );
    t.activeOrders = ordersRes.rows;
  }

  return tables;
}

export async function markOrderServedByWaiter(orderId) {
  return updateOrderStatus(orderId, "served");
}

export async function callWaiter(qrToken) {
  const tableRes = await pool.query("SELECT id FROM tables WHERE qr_code_token = $1", [qrToken]);
  const table = tableRes.rows[0];
  if (!table) throw new Error("Invalid table");

  const callId = uuid();
  await pool.query(
    "INSERT INTO waiter_calls (id, table_id, status) VALUES ($1, $2, 'pending')",
    [callId, table.id]
  );

  const tableInfoRes = await pool.query("SELECT table_number FROM tables WHERE id = $1", [table.id]);
  const tableInfo = tableInfoRes.rows[0];

  const io = getIo();
  io.to("waiter").emit("table:waiter_called", {
    id: callId,
    tableId: table.id,
    tableNumber: tableInfo.table_number,
    requestedAt: new Date().toISOString(),
  });

  return { id: callId, tableId: table.id };
}

export async function getPendingWaiterCalls(restaurantId) {
  const callsRes = await pool.query(
    `SELECT wc.id, wc.table_id, wc.status, wc.requested_at, t.table_number
     FROM waiter_calls wc
     JOIN tables t ON wc.table_id = t.id
     WHERE t.restaurant_id = $1 AND wc.status = 'pending'
     ORDER BY wc.requested_at ASC`,
    [restaurantId]
  );
  return callsRes.rows;
}

export async function acknowledgeWaiterCall(callId) {
  await pool.query("UPDATE waiter_calls SET status = 'acknowledged' WHERE id = $1", [callId]);
  const io = getIo();
  io.to("waiter").emit("table:waiter_call_acknowledged", { id: callId });
  return { id: callId, status: "acknowledged" };
}
