import express from "express";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import { auth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";

const router = express.Router();

router.post("/", auth(), allowRoles("tourist"), async (req, res) => {
  try {
    const { tourId, slotStart } = req.body;
    const tour = await Tour.findById(tourId);
    if (!tour || tour.status !== "approved") {
      return res.status(404).json({ message: "Tour not found" });
    }

    const slot = tour.slots.find(s => new Date(s.start).getTime() === new Date(slotStart).getTime());
    if (!slot) return res.status(400).json({ message: "Slot not found" });
    if (slot.booked >= slot.capacity) {
      return res.status(409).json({ message: "Slot full" });
    }

    slot.booked += 1;
    await tour.save();

    const platformFee = Number((tour.price * 0.12).toFixed(2));
    const totalPrice = Number((tour.price + platformFee).toFixed(2));

    const booking = await Booking.create({
      tour: tour._id,
      user: req.user.id,
      slotStart: slot.start,
      priceAtBooking: tour.price,
      platformFee,
      totalPrice,
      status: "confirmed"
    });

    return res.status(201).json({ message: "Booked", id: booking._id });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/my", auth(), allowRoles("tourist"), async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id })
    .populate("tour", "title category coverImage")
    .sort({ createdAt: -1 });
  return res.json(bookings);
});

router.get("/guide", auth(), allowRoles("guide"), async (req, res) => {
  const bookings = await Booking.find()
    .populate({ path: "tour", match: { guide: req.user.id }, select: "title" })
    .populate("user", "name")
    .sort({ createdAt: -1 });

  const filtered = bookings.filter(b => b.tour);
  return res.json(filtered);
});

router.patch("/:id/cancel", auth(), allowRoles("tourist"), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("tour");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({ message: "Cannot cancel" });
    }

    booking.status = "cancelled";
    await booking.save();

    const tour = await Tour.findById(booking.tour._id);
    if (tour) {
      const slot = tour.slots.find(s => new Date(s.start).getTime() === new Date(booking.slotStart).getTime());
      if (slot && slot.booked > 0) {
        slot.booked -= 1;
        await tour.save();
      }
    }

    return res.json({ message: "Cancelled" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
