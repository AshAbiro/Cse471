import { useState } from "react";
import api from "../api/client.js";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      setMessage("Logged in");
      if (res.data.user.role === "admin") navigate("/dashboard/admin");
      else if (res.data.user.role === "guide") navigate("/dashboard/guide");
      else navigate("/dashboard/user");
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <section className="section max-w-md">
      <h2 className="font-display text-2xl font-semibold">Login</h2>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
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
        <button className="btn-primary w-full" type="submit">Login</button>
      </form>
      {message && <p className="text-sm mt-3 text-teal">{message}</p>}
    </section>
  );
}
