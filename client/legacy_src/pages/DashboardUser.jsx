import { useEffect, useState } from "react";
import api from "../api/client.js";

export default function DashboardUser() {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");

  const load = () => {
    api.get("/bookings/my")
      .then(res => setBookings(res.data || []))
      .catch(() => setBookings([]));
  };

  useEffect(() => {
    load();
  }, []);

  const cancelBooking = async (id) => {
    try {
      await api.patch(`/bookings/${id}/cancel`);
      setMessage("Booking cancelled");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Cancel failed");
    }
  };

  return (
    <section className="section">
      <h2 className="font-display text-2xl font-semibold">My Bookings</h2>
      {message && <p className="text-sm mt-2 text-teal">{message}</p>}
      <div className="mt-6 space-y-3">
        {bookings.map(b => (
          <div key={b._id} className="card p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">{b.tour?.title}</p>
              <p className="text-sm text-ink/70">{new Date(b.slotStart).toLocaleString()}</p>
              <p className="text-xs text-ink/60">Status: {b.status}</p>
            </div>
            {b.status === "confirmed" && (
              <button className="btn-ghost" onClick={() => cancelBooking(b._id)}>Cancel</button>
            )}
          </div>
        ))}
        {!bookings.length && <p className="text-ink/70">No bookings yet.</p>}
      </div>
    </section>
  );
}
