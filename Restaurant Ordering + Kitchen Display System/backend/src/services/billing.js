import { pool } from "../db/pool.js";
import { getOrderById } from "./orders.js";
import { getIo } from "../sockets/io.js";

export async function generateBill(orderId) {
  const order = await getOrderById(orderId);
  if (!order) throw new Error("Order not found");

  const subtotal = order.items.reduce((sum, i) => sum + i.quantity * Number(i.unit_price), 0);

  return {
    orderId: order.id,
    tableNumber: order.table_number,
    items: order.items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      unitPrice: Number(i.unit_price),
      lineTotal: i.quantity * Number(i.unit_price),
    })),
    subtotal,
    taxAmount: Number(order.tax_amount),
    totalAmount: Number(order.total_amount),
    paymentStatus: order.payment_status,
  };
}

export async function processPayment(orderId, paymentMethod) {
  await pool.query(
    "UPDATE orders SET payment_status = 'paid', payment_method = $1, status = 'billed' WHERE id = $2",
    [paymentMethod, orderId]
  );
  const order = await getOrderById(orderId);
  await pool.query("UPDATE tables SET status = 'empty' WHERE id = $1", [order.table_id]);
  await pool.query("UPDATE orders SET status = 'closed' WHERE id = $1", [orderId]);

  const finalOrder = await getOrderById(orderId);

  const io = getIo();
  io.to("admin").to("waiter").to(`table:${order.table_id}`).emit("order:status_changed", finalOrder);
  io.to("admin").to("waiter").emit("table:status_changed", { tableId: order.table_id, status: "empty" });

  return finalOrder;
}

export async function getDailySales(restaurantId, date) {
  const targetDate = date || new Date().toISOString().slice(0, 10);

  const totalsRes = await pool.query(
    `SELECT COUNT(*) AS total_orders, COALESCE(SUM(o.total_amount), 0) AS total_revenue,
            COALESCE(AVG(EXTRACT(EPOCH FROM (o.ready_at - o.placed_at)) / 60), 0) AS avg_prep_time_minutes
     FROM orders o
     JOIN tables t ON o.table_id = t.id
     WHERE t.restaurant_id = $1 AND o.placed_at::date = $2 AND o.status != 'placed'`,
    [restaurantId, targetDate]
  );
  const totals = totalsRes.rows[0];

  const topItemsRes = await pool.query(
    `SELECT mi.name, SUM(oi.quantity) AS total_qty
     FROM order_items oi
     JOIN orders o ON oi.order_id = o.id
     JOIN tables t ON o.table_id = t.id
     JOIN menu_items mi ON oi.menu_item_id = mi.id
     WHERE t.restaurant_id = $1 AND o.placed_at::date = $2
     GROUP BY mi.id, mi.name
     ORDER BY total_qty DESC
     LIMIT 5`,
    [restaurantId, targetDate]
  );

  const tableTurnoverRes = await pool.query(
    `SELECT t.table_number, COUNT(DISTINCT o.id) AS order_count
     FROM orders o
     JOIN tables t ON o.table_id = t.id
     WHERE t.restaurant_id = $1 AND o.placed_at::date = $2
     GROUP BY t.id, t.table_number
     ORDER BY t.table_number`,
    [restaurantId, targetDate]
  );

  return {
    date: targetDate,
    totalOrders: Number(totals.total_orders),
    totalRevenue: Number(totals.total_revenue),
    avgPrepTimeMinutes: Number(totals.avg_prep_time_minutes),
    topItems: topItemsRes.rows,
    tableTurnover: tableTurnoverRes.rows,
  };
}
