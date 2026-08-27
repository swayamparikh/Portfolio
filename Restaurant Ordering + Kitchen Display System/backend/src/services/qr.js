import QRCode from "qrcode";
import { pool } from "../db/pool.js";
import { v4 as uuid } from "uuid";

const CUSTOMER_APP_URL = process.env.CUSTOMER_APP_URL || "http://localhost:3000";

export async function getTableQr(tableId) {
  const tableRes = await pool.query("SELECT id, table_number, qr_code_token FROM tables WHERE id = $1", [
    tableId,
  ]);
  const table = tableRes.rows[0];
  if (!table) throw new Error("Table not found");

  const url = `${CUSTOMER_APP_URL}/table/${table.qr_code_token}`;
  const dataUrl = await QRCode.toDataURL(url, { margin: 2, width: 400 });

  return { tableId: table.id, tableNumber: table.table_number, url, qrDataUrl: dataUrl };
}

export async function regenerateTableQr(tableId) {
  const newToken = uuid().replace(/-/g, "").slice(0, 12);
  await pool.query("UPDATE tables SET qr_code_token = $1 WHERE id = $2", [newToken, tableId]);
  return getTableQr(tableId);
}

export async function listAllTableQrs(restaurantId) {
  const tablesRes = await pool.query(
    "SELECT id FROM tables WHERE restaurant_id = $1 ORDER BY table_number",
    [restaurantId]
  );
  return Promise.all(tablesRes.rows.map((t) => getTableQr(t.id)));
}
