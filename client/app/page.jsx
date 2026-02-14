"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../lib/api.js";
import TourCard from "../components/TourCard.jsx";
import Link from "next/link";

const sampleTours = [
  {
    _id: "1",
    title: "Old Dhaka Food Trail 🍛",
    description: "Chowk Bazar bites, bakarkhani, and Shakhari Bazar lanes.",
    category: "Food",
    price: 18,
    coverImage: "https://images.unsplash.com/flagged/photo-1573664217554-15b547ef9f8a?auto=format&fit=crop&w=900&q=60"
  },
  {
    _id: "2",
    title: "Street Snacks Night Walk 🌙",
    description: "Late-night fuchka, kebabs, and halim around Gulshan lanes.",
    category: "Night",
    price: 20,
    coverImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=60"
  },
  {
    _id: "3",
    title: "Sadarghat Tea + Snacks ☕",
    description: "Tea stops and riverfront snacks by the Buriganga.",
    category: "Culture",
    price: 12,
    coverImage: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=900&q=60"
  },
  {
    _id: "4",
    title: "University Area Fuchka Hunt 🥟",
    description: "Campus-side fuchka, chanachur, and quick bites around TSC.",
    category: "Food",
    price: 10,
    coverImage: "https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?auto=format&fit=crop&w=900&q=60"
  }
];

export default function HomePage() {
  const router = useRouter();
  const [tours, setTours] = useState(sampleTours);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.get("/tours")
      .then(res => {
        if (res.data?.length) setTours(res.data.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/tours?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-6">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start py-10">
        <div className="pop-in">
          <p className="text-sm uppercase tracking-widest text-teal font-semibold">Dhaka City Tours</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-3">
            Explore Dhaka through local stories and hidden routes
          </h1>
          <p className="text-ink/70 mt-4">
            Book Old Dhaka food trails, heritage walks, riverfront routes, and night tours led by verified locals.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/tours" className="btn-primary">Browse Tours</Link>
            <Link href="/register" className="btn-ghost">Become a Guide</Link>
          </div>
          <form onSubmit={handleSearch} className="mt-6 flex gap-2">
            <input
              className="flex-1 border border-ink/10 rounded-lg px-3 py-2 bg-white"
              placeholder="Search by dish (kacchi, fuchka, haleem...)"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button className="btn-primary" type="submit">Search</button>
          </form>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sand/60 pop-in pop-delay-1">
          <h3 className="font-display text-xl font-semibold">Foodie Promise</h3>
          <ul className="mt-4 space-y-2 text-sm text-ink/70">
            <li>✅ Verified local food guides</li>
            <li>🌶 Spice-level & hygiene hints</li>
            <li>🧾 Transparent prices (no tourist traps)</li>
            <li>🕒 Best time to go (late-night / sehri / weekend)</li>
          </ul>
        </div>
      </section>

      <section className="py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold">Featured Food Trails</h2>
          <Link href="/tours" className="text-sm font-semibold text-teal">View all</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {tours.map((tour, index) => (
            <TourCard key={tour._id} tour={tour} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
