import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    start: { type: Date, required: true },
    capacity: { type: Number, required: true, min: 1 },
    booked: { type: Number, default: 0 }
  },
  { _id: false }
);

const tourSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    itinerary: { type: String, default: "" },
    category: {
      type: String,
      enum: ["Food", "Heritage", "Culture", "Eco", "Night", "Photography"],
      required: true
    },
    durationHours: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    meetingPoint: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    images: { type: [String], default: [] },
    slots: { type: [slotSchema], default: [] },
    guide: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    avgRating: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Tour", tourSchema);
