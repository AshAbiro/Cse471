import { useEffect, useState } from "react";
import api from "../api/client.js";
import TourCard from "../components/TourCard.jsx";

const sampleTours = [
  {
    _id: "1",
    title: "Old Town Street Food Walk",
    description: "Taste hidden street food gems and local history.",
    category: "Food",
    price: 25,
    coverImage: "https://images.unsplash.com/flagged/photo-1573664217554-15b547ef9f8a?auto=format&fit=crop&w=900&q=60"
  },
  {
    _id: "2",
    title: "Night Photography Route",
    description: "Capture neon reflections with a local photographer.",
    category: "Photography",
    price: 35,
    coverImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=60"
  },
  {
    _id: "3",
    title: "Heritage Alley Walk",
    description: "Walk through heritage lanes and artisan workshops.",
    category: "Heritage",
    price: 20,
    coverImage: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=900&q=60"
  }
];

export default function Home() {
  const [tours, setTours] = useState(sampleTours);

  useEffect(() => {
    api.get("/tours")
      .then(res => {
        if (res.data?.length) setTours(res.data.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <section className="section grid md:grid-cols-2 gap-8 items-center">
        <div>
          <p className="text-sm uppercase tracking-widest text-teal font-semibold">Niche City Tours</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-3">
            Explore cities through local stories and hidden routes
          </h1>
          <p className="text-ink/70 mt-4">
            Book curated food trails, heritage walks, eco tours, and night routes led by verified guides.
          </p>
          <div className="mt-6 flex gap-3">
            <a href="/tours" className="btn-primary">Browse Tours</a>
            <a href="/register" className="btn-ghost">Become a Guide</a>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-sand/60">
          <h3 className="font-display text-xl font-semibold">Why NicheCity?</h3>
          <ul className="mt-4 space-y-2 text-sm text-ink/70">
            <li>? Verified local guides and transparent reviews</li>
            <li>? Flexible booking with curated time slots</li>
            <li>? Experiences tailored to your interests</li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">Featured Tours</h2>
          <a href="/tours" className="text-sm font-semibold text-teal">View all</a>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {tours.map(tour => <TourCard key={tour._id} tour={tour} />)}
        </div>
      </section>
    </>
  );
}
