import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "Email already used" });

    const safeRole = role === "guide" ? "guide" : "tourist";
    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: safeRole,
      status: safeRole === "guide" ? "pending" : "active"
    });

    return res.status(201).json({ message: "Registered", id: user._id });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password || "", user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    if (user.role === "guide" && user.status !== "active") {
      return res.status(403).json({ message: "Guide pending approval" });
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: { id: user._id, name: user.name, role: user.role }
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
