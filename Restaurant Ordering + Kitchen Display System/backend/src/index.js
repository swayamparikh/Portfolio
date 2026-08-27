import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

import { setIo } from "./sockets/io.js";
import { registerSocketHandlers } from "./sockets/orderEvents.js";

import customerRoutes from "./routes/customer.js";
import staffRoutes from "./routes/staff.js";
import kitchenRoutes from "./routes/kitchen.js";
import waiterRoutes from "./routes/waiter.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: process.env.CORS_ORIGIN || "*", methods: ["GET", "POST", "PUT"] },
});
setIo(io);
registerSocketHandlers(io);

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api", customerRoutes);
app.use("/api", staffRoutes);
app.use("/api", kitchenRoutes);
app.use("/api", waiterRoutes);
app.use("/api", adminRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Kaveri Kitchen backend running on http://localhost:${PORT}`);
});
