"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "../../../lib/api.js";

export default function TourDetailPage() {
  const params = useParams();
  const { id } = params || {};
  const [tour, setTour] = useState(null);
  const [slotStart, setSlotStart] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    api.get(`/tours/${id}`)
      .then(res => setTour(res.data))
      .catch(() => setTour(null));
  }, [id]);

  const handleBook = async () => {
    try {
      await api.post("/bookings", { tourId: id, slotStart });
      setMessage("Booking confirmed!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Booking failed");
    }
  };

  if (!tour) {
    return (
      <section className="section">
        <p className="text-ink/70">Tour not found or not approved.</p>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="grid md:grid-cols-2 gap-8">
        <img
          src={tour.coverImage || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=60"}
          alt={tour.title}
          className="w-full rounded-3xl object-cover"
        />
        <div>
          <span className="badge">{tour.category}</span>
          <h2 className="font-display text-3xl font-semibold mt-3">{tour.title}</h2>
          <p className="text-ink/70 mt-3">{tour.description}</p>
          <div className="mt-4 text-sm">
            <p><strong>Duration:</strong> {tour.durationHours} hours</p>
            <p><strong>Price:</strong> ${tour.price}</p>
            <p><strong>Guide:</strong> {tour.guide?.name}</p>
            {tour.meetingPoint && <p><strong>Meeting point:</strong> {tour.meetingPoint}</p>}
          </div>
          {tour.itinerary && (
            <div className="mt-3 text-sm text-ink/70">
              <p><strong>Itinerary:</strong> {tour.itinerary}</p>
            </div>
          )}

          <div className="mt-6 p-4 border border-ink/10 rounded-2xl bg-white">
            <label className="block text-sm font-semibold">Select a slot</label>
            <select
              value={slotStart}
              onChange={e => setSlotStart(e.target.value)}
              className="w-full border border-ink/20 rounded-lg px-3 py-2 mt-2"
            >
              <option value="">Choose time</option>
              {tour.slots?.map(s => (
                <option key={s.start} value={s.start}>
                  {new Date(s.start).toLocaleString()} (Remaining {s.capacity - s.booked})
                </option>
              ))}
            </select>
            <div className="mt-3 text-sm text-ink/70 space-y-1">
              <p><strong>Base price:</strong> ${tour.price}</p>
              <p><strong>Platform fee (12%):</strong> ${(tour.price * 0.12).toFixed(2)}</p>
              <p><strong>Total:</strong> ${(tour.price * 1.12).toFixed(2)}</p>
            </div>
            <button onClick={handleBook} className="btn-primary mt-3">Book Now</button>
            {message && <p className="text-sm mt-2 text-teal">{message}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
