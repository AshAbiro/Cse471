import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["tourist", "guide", "admin"], default: "tourist" },
    status: { type: String, enum: ["pending", "active", "suspended"], default: "active" },
    bio: { type: String, default: "" },
    phone: { type: String, default: "" },
    profilePhoto: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
