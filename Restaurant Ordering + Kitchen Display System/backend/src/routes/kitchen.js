import { Router } from "express";
import { requireRole } from "./middleware.js";
import { getActiveKitchenOrders, updateOrderStatus, updateItemStatus } from "../services/orders.js";

const router = Router();

router.get("/kitchen/orders/active", requireRole("kitchen", "admin"), async (req, res) => {
  try {
    const orders = await getActiveKitchenOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/kitchen/orders/:id/status", requireRole("kitchen", "admin"), async (req, res) => {
  try {
    const { status } = req.body;
    const order = await updateOrderStatus(req.params.id, status);
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put(
  "/kitchen/orders/:id/items/:itemId/status",
  requireRole("kitchen", "admin"),
  async (req, res) => {
    try {
      const { status } = req.body;
      const order = await updateItemStatus(req.params.id, req.params.itemId, status);
      res.json(order);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;
