import { Router } from "express";
import {
  createMetric,
  getRecentMetrics,
  getRecentByNode,
  getAggregated,
  getNodeCriticalityDistribution,
} from "../controllers/metricasController.js";

const router = Router();

router.post("/", createMetric);
router.get("/recientes", getRecentMetrics);
router.get("/aggregated", getAggregated);
router.get("/:nodeId/distribution", getNodeCriticalityDistribution);
router.get("/:nodeId", getRecentByNode);

export default router;
