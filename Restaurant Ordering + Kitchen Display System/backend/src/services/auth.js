import { pool } from "../db/pool.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function staffLogin(pin) {
  const { rows: staff } = await pool.query("SELECT id, name, role, pin, restaurant_id FROM staff");

  for (const s of staff) {
    const matches = await bcrypt.compare(pin, s.pin);
    if (matches) {
      const token = jwt.sign(
        { staffId: s.id, role: s.role, restaurantId: s.restaurant_id },
        process.env.JWT_SECRET,
        { expiresIn: "12h" }
      );
      return { token, staff: { id: s.id, name: s.name, role: s.role, restaurantId: s.restaurant_id } };
    }
  }

  return null;
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
