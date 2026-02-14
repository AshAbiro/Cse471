import express from "express";
import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import { auth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";

const router = express.Router();

router.post("/", auth(), allowRoles("tourist"), async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const booking = await Booking.findById(bookingId).populate("tour");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const existing = await Review.findOne({ booking: bookingId });
    if (existing) return res.status(409).json({ message: "Already reviewed" });

    const review = await Review.create({
      booking: booking._id,
      tour: booking.tour._id,
      user: req.user.id,
      rating,
      comment
    });

    const tour = await Tour.findById(booking.tour._id);
    if (tour) {
      const total = tour.avgRating * tour.ratingsCount + Number(rating);
      tour.ratingsCount += 1;
      tour.avgRating = Number((total / tour.ratingsCount).toFixed(2));
      await tour.save();
    }

    return res.status(201).json({ message: "Review submitted", id: review._id });
  } catch (err) {
    return res.status(400).json({ message: "Invalid data" });
  }
});

router.get("/tour/:tourId", async (req, res) => {
  const reviews = await Review.find({ tour: req.params.tourId })
    .populate("user", "name")
    .sort({ createdAt: -1 });
  return res.json(reviews);
});

export default router;
