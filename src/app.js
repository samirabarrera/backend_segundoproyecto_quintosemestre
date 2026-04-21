import 'dotenv/config';
import express from "express";
import cors from "cors";
import metricasRoutes from "./routes/metricasRoutes.js";
import nodosRoutes from "./routes/nodosRoutes.js";
import logsRoutes from "./routes/logsRoutes.js";

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());

// Rutas API
app.use("/api/metricas", metricasRoutes);
app.use("/api/nodos", nodosRoutes);
app.use("/api/logs", logsRoutes);


export default app;