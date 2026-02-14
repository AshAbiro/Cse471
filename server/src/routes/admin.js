import express from "express";
import User from "../models/User.js";
import Tour from "../models/Tour.js";
import { auth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";

const router = express.Router();

router.get("/guides/pending", auth(), allowRoles("admin"), async (req, res) => {
  const guides = await User.find({ role: "guide", status: "pending" }).select("name email status");
  return res.json(guides);
});

router.patch("/guides/:id/status", auth(), allowRoles("admin"), async (req, res) => {
  const { status } = req.body;
  if (!status || !["active", "suspended", "pending"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const guide = await User.findOneAndUpdate(
    { _id: req.params.id, role: "guide" },
    { status },
    { new: true }
  );

  if (!guide) return res.status(404).json({ message: "Guide not found" });
  return res.json({ message: "Updated" });
});

router.get("/tours/pending", auth(), allowRoles("admin"), async (req, res) => {
  const tours = await Tour.find({ status: "pending" }).populate("guide", "name");
  return res.json(tours);
});

router.get("/users", auth(), allowRoles("admin"), async (req, res) => {
  const users = await User.find().select("name email role status createdAt");
  return res.json(users);
});

router.get("/users/:id", auth(), allowRoles("admin"), async (req, res) => {
  const user = await User.findById(req.params.id).select("name email role status bio phone createdAt");
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json(user);
});

router.get("/stats", auth(), allowRoles("admin"), async (req, res) => {
  const [users, tours, guides] = await Promise.all([
    User.countDocuments(),
    Tour.countDocuments(),
    User.countDocuments({ role: "guide" })
  ]);

  return res.json({ users, tours, guides });
});

export default router;
