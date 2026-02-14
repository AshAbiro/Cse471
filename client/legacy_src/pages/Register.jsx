import { useState } from "react";
import api from "../api/client.js";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "tourist" });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", form);
      setMessage("Registered successfully. Please login.");
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <section className="section max-w-md">
      <h2 className="font-display text-2xl font-semibold">Create Account</h2>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <input
          className="w-full border border-ink/20 rounded-lg px-3 py-2"
          placeholder="Full name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="w-full border border-ink/20 rounded-lg px-3 py-2"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="w-full border border-ink/20 rounded-lg px-3 py-2"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />
        <select
          className="w-full border border-ink/20 rounded-lg px-3 py-2"
          value={form.role}
          onChange={e => setForm({ ...form, role: e.target.value })}
        >
          <option value="tourist">Tourist</option>
          <option value="guide">Guide</option>
        </select>
        <button className="btn-primary w-full" type="submit">Register</button>
      </form>
      {message && <p className="text-sm mt-3 text-teal">{message}</p>}
    </section>
  );
}
