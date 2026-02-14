import { Link } from "react-router-dom";

export default function TourCard({ tour }) {
  return (
    <div className="card overflow-hidden">
      <img
        src={tour.coverImage || "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&q=60"}
        alt={tour.title}
        className="h-44 w-full object-cover"
      />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="badge">{tour.category}</span>
          <span className="text-sm font-semibold">${tour.price}</span>
        </div>
        <h3 className="font-display text-lg font-semibold mt-2">{tour.title}</h3>
        <p className="text-sm text-ink/70 mt-1">{tour.description}</p>
        <Link to={`/tours/${tour._id}`} className="inline-block mt-3 text-sm font-semibold text-teal">
          View details ?
        </Link>
      </div>
    </div>
  );
}
