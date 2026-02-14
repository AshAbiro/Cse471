import { useEffect, useState } from "react";
import api from "../api/client.js";

export default function DashboardGuide() {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Food",
    durationHours: 2,
    price: 20,
    capacity: 8,
    meetingPoint: "",
    coverImage: ""
  });

  const load = () => {
    api.get("/bookings/guide")
      .then(res => setBookings(res.data || []))
      .catch(() => setBookings([]));
  };

  useEffect(() => {
    load();
  }, []);

  const submitTour = async (e) => {
    e.preventDefault();
    try {
      await api.post("/tours", {
        ...form,
        slots: []
      });
      setMessage("Tour submitted for approval");
    } catch (err) {
      setMessage(err.response?.data?.message || "Submit failed");
    }
  };

  return (
    <section className="section">
      <h2 className="font-display text-2xl font-semibold">Guide Dashboard</h2>
      {message && <p className="text-sm mt-2 text-teal">{message}</p>}

      <div className="grid md:grid-cols-2 gap-8 mt-6">
        <div className="card p-5">
          <h3 className="font-display text-lg font-semibold">Create a Tour</h3>
          <form className="mt-4 space-y-3" onSubmit={submitTour}>
            <input className="w-full border border-ink/20 rounded-lg px-3 py-2" placeholder="Title"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <textarea className="w-full border border-ink/20 rounded-lg px-3 py-2" placeholder="Description"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <select className="w-full border border-ink/20 rounded-lg px-3 py-2"
              value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option>Food</option>
              <option>Heritage</option>
              <option>Culture</option>
              <option>Eco</option>
              <option>Night</option>
              <option>Photography</option>
            </select>
            <input className="w-full border border-ink/20 rounded-lg px-3 py-2" placeholder="Duration (hours)"
              value={form.durationHours} onChange={e => setForm({ ...form, durationHours: e.target.value })} />
            <input className="w-full border border-ink/20 rounded-lg px-3 py-2" placeholder="Price"
              value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            <input className="w-full border border-ink/20 rounded-lg px-3 py-2" placeholder="Capacity"
              value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} />
            <input className="w-full border border-ink/20 rounded-lg px-3 py-2" placeholder="Meeting point"
              value={form.meetingPoint} onChange={e => setForm({ ...form, meetingPoint: e.target.value })} />
            <input className="w-full border border-ink/20 rounded-lg px-3 py-2" placeholder="Cover image URL"
              value={form.coverImage} onChange={e => setForm({ ...form, coverImage: e.target.value })} />
            <button className="btn-primary w-full" type="submit">Submit Tour</button>
          </form>
        </div>

        <div className="card p-5">
          <h3 className="font-display text-lg font-semibold">Recent Bookings</h3>
          <div className="mt-4 space-y-3">
            {bookings.map(b => (
              <div key={b._id} className="border border-ink/10 rounded-lg p-3">
                <p className="font-semibold">{b.tour?.title}</p>
                <p className="text-sm text-ink/70">{new Date(b.slotStart).toLocaleString()}</p>
                <p className="text-xs text-ink/60">By: {b.user?.name}</p>
              </div>
            ))}
            {!bookings.length && <p className="text-ink/70">No bookings yet.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
