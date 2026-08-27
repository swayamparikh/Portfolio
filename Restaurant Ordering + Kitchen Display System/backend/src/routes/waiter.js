import { Router } from "express";
import { requireRole } from "./middleware.js";
import {
  getWaiterTables,
  markOrderServedByWaiter,
  getPendingWaiterCalls,
  acknowledgeWaiterCall,
  placeOrder,
} from "../services/orders.js";
import { pool } from "../db/pool.js";

const router = Router();

router.get("/waiter/tables", requireRole("waiter", "admin"), async (req, res) => {
  try {
    const tables = await getWaiterTables(req.staff.restaurantId);
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/waiter/orders/:id/served", requireRole("waiter", "admin"), async (req, res) => {
  try {
    const order = await markOrderServedByWaiter(req.params.id);
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/waiter/calls", requireRole("waiter", "admin"), async (req, res) => {
  try {
    const calls = await getPendingWaiterCalls(req.staff.restaurantId);
    res.json(calls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/waiter/calls/:id/acknowledge", requireRole("waiter", "admin"), async (req, res) => {
  try {
    const call = await acknowledgeWaiterCall(req.params.id);
    res.json(call);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Waiter takes a manual order on behalf of a table (walk-ins / assisted ordering)
router.post("/waiter/tables/:tableId/order", requireRole("waiter", "admin"), async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT qr_code_token FROM tables WHERE id = $1", [
      req.params.tableId,
    ]);
    const table = rows[0];
    if (!table) return res.status(404).json({ error: "Table not found" });
    const order = await placeOrder(table.qr_code_token, req.body.items, req.body.existingOrderId);
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
