import { Router } from "express";
import { getMenuForToken, placeOrder, getOrderForToken, callWaiter } from "../services/orders.js";

const router = Router();

router.get("/table/:qrToken/menu", async (req, res) => {
  try {
    const menu = await getMenuForToken(req.params.qrToken);
    if (!menu) return res.status(404).json({ error: "Table not found" });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/table/:qrToken/order", async (req, res) => {
  try {
    const { items, existingOrderId } = req.body;
    const order = await placeOrder(req.params.qrToken, items, existingOrderId);
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/table/:qrToken/order/:orderId", async (req, res) => {
  try {
    const order = await getOrderForToken(req.params.qrToken, req.params.orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/table/:qrToken/call-waiter", async (req, res) => {
  try {
    const call = await callWaiter(req.params.qrToken);
    res.status(201).json(call);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
