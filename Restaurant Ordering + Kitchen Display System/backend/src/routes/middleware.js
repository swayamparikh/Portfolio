import { verifyToken } from "../services/auth.js";

export function requireRole(...roles) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing token" });
    }
    try {
      const payload = verifyToken(header.slice(7));
      if (!roles.includes(payload.role)) {
        return res.status(403).json({ error: "Insufficient role" });
      }
      req.staff = payload;
      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}
