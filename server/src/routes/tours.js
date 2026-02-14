import express from "express";
import Tour from "../models/Tour.js";
import { auth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { category, minPrice, maxPrice, rating, q, status } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    } else {
      query.status = "approved";
    }

    if (category) query.category = category;
    if (q) query.title = { $regex: q, $options: "i" };
    if (minPrice || maxPrice) {
      query.price = { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) };
    }
    if (rating) query.avgRating = { $gte: Number(rating) };

    const tours = await Tour.find(query)
      .populate("guide", "name profilePhoto")
      .sort({ createdAt: -1 });

    return res.json(tours);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id).populate("guide", "name bio profilePhoto");
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    if (tour.status !== "approved") {
      return res.status(403).json({ message: "Tour not approved" });
    }
    return res.json(tour);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/", auth(), allowRoles("guide", "admin"), async (req, res) => {
  try {
    const payload = { ...req.body, guide: req.user.id };
    if (req.user.role === "admin") {
      payload.status = "approved";
    } else {
      payload.status = "pending";
    }

    const tour = await Tour.create(payload);
    return res.status(201).json({ message: "Tour submitted", id: tour._id });
  } catch (err) {
    return res.status(400).json({ message: "Invalid data" });
  }
});

router.put("/:id", auth(), allowRoles("guide", "admin"), async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) return res.status(404).json({ message: "Tour not found" });

    if (req.user.role === "guide" && tour.guide.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updates = { ...req.body };
    if (req.user.role === "guide") {
      updates.status = "pending";
    }

    Object.assign(tour, updates);
    await tour.save();
    return res.json({ message: "Updated" });
  } catch (err) {
    return res.status(400).json({ message: "Invalid data" });
  }
});

router.delete("/:id", auth(), allowRoles("guide", "admin"), async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) return res.status(404).json({ message: "Tour not found" });

    if (req.user.role === "guide" && tour.guide.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await tour.deleteOne();
    return res.json({ message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:id/status", auth(), allowRoles("admin"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!tour) return res.status(404).json({ message: "Tour not found" });

    return res.json({ message: "Status updated" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
