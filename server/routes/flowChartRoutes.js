import { Router } from "express";
const router = Router();
import {
  createFlowChart,
  getFlowCharts,
  getFlowChart,
  updateFlowChart,
  deleteFlowChart,
} from "../controllers/flowChartController.js";
import auth from "../middleware/auth.js";

// Apply auth middleware to all routes
router.use(auth);

// Create a new flowchart
router.post("/", createFlowChart);

// Get all flowcharts
router.get("/", getFlowCharts);

// Get a specific flowchart
router.get("/:id", getFlowChart);

// Update a flowchart
router.put("/:id", updateFlowChart);

// Delete a flowchart
router.delete("/:id", deleteFlowChart);

export default router;
