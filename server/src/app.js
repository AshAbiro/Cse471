import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import tourRoutes from "./routes/tours.js";
import bookingRoutes from "./routes/bookings.js";
import reviewRoutes from "./routes/reviews.js";
import adminRoutes from "./routes/admin.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

export default app;
