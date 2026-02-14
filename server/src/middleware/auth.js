import jwt from "jsonwebtoken";
import User from "../models/User.js";

export function auth(requiredRole = null) {
  return async (req, res, next) => {
    try {
      const header = req.headers.authorization || "";
      const token = header.startsWith("Bearer ") ? header.slice(7) : null;
      if (!token) return res.status(401).json({ message: "Unauthorized" });

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.id).select("_id role status name email");
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      if (user.status === "suspended") {
        return res.status(403).json({ message: "Account suspended" });
      }

      if (requiredRole && user.role !== requiredRole) {
        return res.status(403).json({ message: "Forbidden" });
      }

      req.user = { id: user._id.toString(), role: user.role, name: user.name, email: user.email };
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
}
