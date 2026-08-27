import { pool } from "../db/pool.js";
import { getIo } from "../sockets/io.js";

export async function getFullMenu(restaurantId) {
  const categoriesRes = await pool.query(
    "SELECT id, name, sort_order FROM menu_categories WHERE restaurant_id = $1 ORDER BY sort_order",
    [restaurantId]
  );
  const itemsRes = await pool.query(
    `SELECT mi.* FROM menu_items mi
     JOIN menu_categories mc ON mi.category_id = mc.id
     WHERE mc.restaurant_id = $1
     ORDER BY mi.name`,
    [restaurantId]
  );

  return categoriesRes.rows.map((c) => ({
    ...c,
    items: itemsRes.rows.filter((i) => i.category_id === c.id),
  }));
}

export async function updateMenuItem(itemId, updates) {
  const allowedFields = [
    "name",
    "description",
    "price",
    "is_veg",
    "spice_level",
    "image_url",
    "avg_prep_time_minutes",
    "is_available",
  ];
  const fields = Object.keys(updates).filter((k) => allowedFields.includes(k));
  if (fields.length === 0) throw new Error("No valid fields to update");

  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
  const values = fields.map((f) => updates[f]);
  await pool.query(`UPDATE menu_items SET ${setClause} WHERE id = $${fields.length + 1}`, [
    ...values,
    itemId,
  ]);

  const itemRes = await pool.query("SELECT * FROM menu_items WHERE id = $1", [itemId]);
  const item = itemRes.rows[0];

  if (fields.includes("is_available")) {
    const io = getIo();
    io.emit("menu:item_availability_changed", { itemId, isAvailable: !!item.is_available });
  }

  return item;
}
