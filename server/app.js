import express, { json } from "express";
import { connect } from "mongoose";
import cors from "cors";
import { mongoURI, port } from "./config/config.js";
import authRoutes from "./routes/authRoutes.js";
import flowChartRoutes from "./routes/flowChartRoutes.js";
import emailRouter from "./routes/emailRoutes.js";

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(json());

// Connect to MongoDB
connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/flowcharts", flowChartRoutes)
app.use("/api/emails", emailRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start server
const PORT = port;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
