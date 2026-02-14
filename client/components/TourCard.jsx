import Link from "next/link";

const fallbackImages = {
  Food: "https://images.unsplash.com/flagged/photo-1573664217554-15b547ef9f8a?auto=format&fit=crop&w=900&q=60",
  Heritage: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=900&q=60",
  Culture: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=60",
  Night: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=60",
  Photography: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=60",
  Eco: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=60"
};

const categoryChips = {
  Food: ["🍛 Kacchi", "🌶 Spicy", "🕒 Late-night"],
  Heritage: ["🏛 Heritage", "📸 Photo", "🚶 Walk"],
  Culture: ["🧋 Lassi", "☕ Tea", "🌊 River"],
  Night: ["🌙 Night", "🔥 Grills", "🕒 Late-night"],
  Photography: ["📸 Photo", "🌆 Golden hour", "🧭 Scenic"],
  Eco: ["🌿 Fresh", "🚴 Easy", "🏞 Nature"]
};

export default function TourCard({ tour, index = 0 }) {
  const image = tour.coverImage || fallbackImages[tour.category] || fallbackImages.Culture;
  const chips = tour.chips || categoryChips[tour.category] || categoryChips.Culture;
  const delayClass = ["pop-delay-1", "pop-delay-2", "pop-delay-3"][index % 3];

  return (
    <div className={`card tour-card pop-in ${delayClass} overflow-hidden`}>
      <img
        src={image}
        alt={tour.title}
        className="h-44 w-full object-cover"
        loading="lazy"
      />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="badge">{tour.category}</span>
          <span className="text-sm font-semibold">${tour.price}</span>
        </div>
        <h3 className="font-display text-lg font-semibold mt-2">{tour.title}</h3>
        <p className="text-sm text-ink/70 mt-1">{tour.description}</p>
        <div className="chips">
          {chips.map((chip, idx) => (
            <span
              key={`${chip}-${idx}`}
              className={`chip ${idx === 0 ? "chip-mint" : ""} ${idx === 1 ? "chip-chili" : ""}`}
            >
              {chip}
            </span>
          ))}
        </div>
        <Link href={`/tours/${tour._id}`} className="inline-block mt-3 text-sm font-semibold text-teal">
          View details -{"\u003e"}
        </Link>
      </div>
    </div>
  );
}
