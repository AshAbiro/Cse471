"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api.js";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "tourist" });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setMessage("Name, email, and password are required.");
      setMessageType("error");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
      });
      setMessage("Registered successfully. Please login.");
      setMessageType("success");
      setTimeout(() => router.push("/login"), 800);
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section max-w-md">
      <h2 className="font-display text-2xl font-semibold">Create Account</h2>
      <p className="text-ink/70 text-sm mt-2">Join as a tourist or apply as a guide.</p>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <input
          className="w-full border border-ink/20 rounded-lg px-3 py-2"
          placeholder="Full name"
          autoComplete="name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
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
            autoComplete="new-password"
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
        <input
          className="w-full border border-ink/20 rounded-lg px-3 py-2"
          placeholder="Confirm password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
        />
        <select
          className="w-full border border-ink/20 rounded-lg px-3 py-2"
          value={form.role}
          onChange={e => setForm({ ...form, role: e.target.value })}
        >
          <option value="tourist">Tourist</option>
          <option value="guide">Guide</option>
        </select>
        <button className="btn-primary w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Register"}
        </button>
      </form>
      {message && (
        <p className={`text-sm mt-3 ${messageType === "error" ? "text-red-600" : "text-teal"}`}>
          {message}
        </p>
      )}
      <p className="text-sm text-ink/70 mt-4">
        Already have an account? <a className="text-teal font-semibold" href="/login">Login</a>
      </p>
    </section>
  );
}
