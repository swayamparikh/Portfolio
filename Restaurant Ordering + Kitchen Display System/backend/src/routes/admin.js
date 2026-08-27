import { Router } from "express";
import { requireRole } from "./middleware.js";
import { generateBill, processPayment, getDailySales } from "../services/billing.js";
import { getFullMenu, updateMenuItem } from "../services/menu.js";
import { getTableQr, regenerateTableQr, listAllTableQrs } from "../services/qr.js";
import { pool } from "../db/pool.js";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";

const router = Router();

router.post("/orders/:id/bill", requireRole("cashier", "admin"), async (req, res) => {
  try {
    const bill = await generateBill(req.params.id);
    res.json(bill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/orders/:id/pay", requireRole("cashier", "admin"), async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const order = await processPayment(req.params.id, paymentMethod);
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/admin/menu", requireRole("admin", "cashier", "waiter"), async (req, res) => {
  try {
    const menu = await getFullMenu(req.staff.restaurantId);
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/admin/menu/:id", requireRole("admin"), async (req, res) => {
  try {
    const item = await updateMenuItem(req.params.id, req.body);
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/admin/sales/daily", requireRole("admin", "cashier"), async (req, res) => {
  try {
    const sales = await getDailySales(req.staff.restaurantId, req.query.date);
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/admin/tables/qr/:tableId", requireRole("admin", "cashier"), async (req, res) => {
  try {
    const qr = await getTableQr(req.params.tableId);
    res.json(qr);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/admin/tables/qr/:tableId/regenerate", requireRole("admin"), async (req, res) => {
  try {
    const qr = await regenerateTableQr(req.params.tableId);
    res.json(qr);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/admin/tables/qr", requireRole("admin", "cashier"), async (req, res) => {
  try {
    const qrs = await listAllTableQrs(req.staff.restaurantId);
    res.json(qrs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/admin/staff", requireRole("admin"), async (req, res) => {
  try {
    const { name, role, pin } = req.body;
    const hashedPin = await bcrypt.hash(pin, 10);
    const id = uuid();
    await pool.query(
      "INSERT INTO staff (id, restaurant_id, name, role, pin) VALUES ($1, $2, $3, $4, $5)",
      [id, req.staff.restaurantId, name, role, hashedPin]
    );
    res.status(201).json({ id, name, role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
