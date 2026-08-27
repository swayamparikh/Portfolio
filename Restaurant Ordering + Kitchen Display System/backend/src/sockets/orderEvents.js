import { pool } from "../db/pool.js";

export function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    socket.on("join", async ({ role, tableId, qrToken }) => {
      if (role === "kitchen") socket.join("kitchen");
      if (role === "waiter") socket.join("waiter");
      if (role === "admin") socket.join("admin");
      if (tableId) socket.join(`table:${tableId}`);
      if (qrToken) {
        const { rows } = await pool.query("SELECT id FROM tables WHERE qr_code_token = $1", [qrToken]);
        if (rows[0]) socket.join(`table:${rows[0].id}`);
      }
    });

    socket.on("disconnect", () => {
      // no-op — rooms are cleaned up automatically by socket.io
    });
  });
}
