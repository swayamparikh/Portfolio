import "dotenv/config";
import express from "express";
import cors from "cors";
import { documentsRouter } from "./routes/documents.js";
import { queryRouter } from "./routes/query.js";
import { evalRouter } from "./routes/eval.js";
import { settingsRouter } from "./routes/settings.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/documents", documentsRouter);
app.use("/api/query", queryRouter);
app.use("/api", evalRouter);
app.use("/api/settings", settingsRouter);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`DocMind backend listening on http://localhost:${port}`);
});
