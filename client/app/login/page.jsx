"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api.js";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setMessage("Email and password are required.");
      setMessageType("error");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      setMessage("Logged in");
      setMessageType("success");
      if (res.data.user.role === "admin") router.push("/dashboard/admin");
      else if (res.data.user.role === "guide") router.push("/dashboard/guide");
      else router.push("/dashboard/user");
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section max-w-md">
      <h2 className="font-display text-2xl font-semibold">Login</h2>
      <p className="text-ink/70 text-sm mt-2">Use your email and password to continue.</p>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <input
          className="w-full border border-ink/20 rounded-lg px-3 py-2"
          placeholder="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
        <div>
          <input
            className="w-full border border-ink/20 rounded-lg px-3 py-2"
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
          <label className="text-xs text-ink/70 flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={e => setShowPassword(e.target.checked)}
            />
            Show password
          </label>
        </div>
        <button className="btn-primary w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
      </form>
      {message && (
        <p className={`text-sm mt-3 ${messageType === "error" ? "text-red-600" : "text-teal"}`}>
          {message}
        </p>
      )}
      <p className="text-sm text-ink/70 mt-4">
        No account? <a className="text-teal font-semibold" href="/register">Create one</a>
      </p>
    </section>
  );
}
