import { Router } from "express";
import { staffLogin } from "../services/auth.js";

const router = Router();

router.post("/staff/login", async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) return res.status(400).json({ error: "PIN required" });
    const result = await staffLogin(pin);
    if (!result) return res.status(401).json({ error: "Invalid PIN" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
