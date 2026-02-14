import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    slotStart: { type: Date, required: true },
    priceAtBooking: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ["confirmed", "cancelled", "completed"], default: "confirmed" }
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
