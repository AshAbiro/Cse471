import { useEffect, useState } from "react";
import api from "../api/client.js";
import FilterBar from "../components/FilterBar.jsx";
import TourCard from "../components/TourCard.jsx";

export default function Tours() {
  const [filters, setFilters] = useState({ category: "", minPrice: "", maxPrice: "", q: "" });
  const [tours, setTours] = useState([]);

  useEffect(() => {
    const params = {};
    if (filters.category) params.category = filters.category;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.q) params.q = filters.q;

    api.get("/tours", { params })
      .then(res => setTours(res.data || []))
      .catch(() => setTours([]));
  }, [filters]);

  return (
    <section className="section">
      <h2 className="font-display text-2xl font-semibold">Browse Tours</h2>
      <div className="mt-4">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {tours.length ? tours.map(tour => <TourCard key={tour._id} tour={tour} />) : (
          <div className="text-ink/70">No tours found. Try adjusting filters.</div>
        )}
      </div>
    </section>
  );
}
