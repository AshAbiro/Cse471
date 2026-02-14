"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api.js";
import FilterBar from "../../components/FilterBar.jsx";
import TourCard from "../../components/TourCard.jsx";

const dhakaHighlights = [
  {
    name: "Ahsan Manzil Museum",
    area: "Kumartoli, Old Dhaka",
    fact: "Former residence of the Nawab of Dhaka, now a museum.",
    image: "/ahsan-manzil.webp"
  },
  {
    name: "Lalbagh Fort",
    area: "Lalbagh, Old Dhaka",
    fact: "17th-century Mughal fort begun in 1678 and left incomplete.",
    image: "/lalbagh-fort.avif"
  },
  {
    name: "Sadarghat Launch Terminal",
    area: "Buriganga Riverfront",
    fact: "Major river wharf and launch hub on the Buriganga.",
    image: "/sadarghat.jpg"
  },
  {
    name: "Curzon Hall (University of Dhaka)",
    area: "Shahbagh",
    fact: "British Raj-era building; foundation stone laid in 1904.",
    image: "/curzon-hall.jpg"
  },
  {
    name: "Jatiya Sangsad Bhaban",
    area: "Sher-e-Bangla Nagar",
    fact: "National Parliament complex designed by Louis Kahn.",
    image: "/jatiya-sangsad.jpg"
  },
  {
    name: "Hatirjheel Lakefront",
    area: "Hatirjheel",
    fact: "Lakefront project with a 16 km road and multiple bridges.",
    image: "/hatirjheel.jpg"
  }
];

const dhakaFoodIcons = [
  {
    name: "Haji Biryani",
    area: "Nazira Bazar, Old Dhaka",
    fact: "Established in 1939; known for chevon biryani.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Haji_Biryani,_Old_Dhaka,_Bangladesh.jpg"
  },
  {
    name: "Beauty Lassi",
    area: "Johnson Road, Old Dhaka",
    fact: "Original branch at 30/A Johnson Road; a century-old institution.",
    image: "/beauty-lacchi.jpg"
  },
  {
    name: "Star Kabab",
    area: "Thatari Bazar + multiple Dhaka branches",
    fact: "Established in 1965; well-known kabab chain in Dhaka.",
    image: "/star-kabab.webp"
  },
  {
    name: "Izumi",
    area: "Gulshan-2",
    fact: "Japanese restaurant located in Gulshan-2.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Colorful_Sushi.jpg",
    note: "Representative photo"
  }
];

const topTen = [
  { rank: 1, item: "Kacchi biryani", area: "Old Dhaka & Dhanmondi", note: "Heritage biryani houses and modern chains stay in heavy demand." },
  { rank: 2, item: "Morog polao & soups", area: "Mohammadpur/Mirpur", note: "Thick soups and polao are praised for value and flavor." },
  { rank: 3, item: "Fuchka & chotpoti", area: "Gulshan, Mohammadpur, city-wide", note: "Night lanes serve crisp fuchka until late." },
  { rank: 4, item: "Kebabs & chaap", area: "Mohammadpur & Gulshan", note: "Bihari-run kebab stalls anchor night food culture." },
  { rank: 5, item: "Bhuna khichuri & halim", area: "Gulshan & Old Dhaka", note: "Winter favorites and Ramadan classics." },
  { rank: 6, item: "Bhorta & home-style rice", area: "Mirpur", note: "Homestyle bhorta with fried fish draws families." },
  { rank: 7, item: "Sweets & bakarkhani", area: "Old Dhaka", note: "Historic bakeries and sweet shops define the area." },
  { rank: 8, item: "Pitha & winter snacks", area: "City-wide", note: "Seasonal carts serve chitoi with many sides." },
  { rank: 9, item: "Specialty teas & drinks", area: "Mohammadpur/Old Dhaka", note: "Motka tea and lassi spots stay busy." },
  { rank: 10, item: "Modern hotpot & fusion", area: "Uttara & Mirpur DOHS", note: "Hotpot and Pan-Asian spots growing fast." }
];

const areaCards = [
  {
    area: "Gulshan 2 / Banani / Baridhara",
    dishes: "Fuchka & chotpoti; Kebabs; Halim & khichuri",
    restaurants: "Gulshan Baking Company; The Flair",
    street: "Gulshan-2 night lane; Shahjadpur Jheel Par cart"
  },
  {
    area: "Dhanmondi / Mohammadpur",
    dishes: "Haleem & soups; Chaap & kebabs; Chitoi pitha & raj kachori",
    restaurants: "Sultan's Dine; Appayon",
    street: "Salimullah Road trail; Nurjahan Road stalls"
  },
  {
    area: "Uttara (Sectors 1-11)",
    dishes: "Hotpot & grill; Authentic Chinese; Coffee & bubble tea",
    restaurants: "Yama Hotpot & Grill; Huaxing Chinese",
    street: "Sector 7/9 lanes; Mascot Plaza carts"
  },
  {
    area: "Mirpur (1, 2, 10, 11 & DOHS)",
    dishes: "Bhorta with fish fry; Clay-pot khichuri; Pan-Asian dim sum",
    restaurants: "Rofik Miyar; Appayon",
    street: "Beribadh corn soup stalls; Geneva Camp kabab"
  },
  {
    area: "Old Dhaka (Nazira Bazar, Chawkbazar, Lalbagh)",
    dishes: "Kacchi biryani; Kebabs & chap; Bakarkhani & sweets",
    restaurants: "Haji Biryani; Hanif Biryani",
    street: "Nazira Bazar lanes; Chawkbazar Ramadan market"
  },
  {
    area: "Motijheel / Paltan",
    dishes: "Biriyani & morog polao; Nehari & paratha; Phuchka & chotpoti",
    restaurants: "Star Kabab & Restaurant (Paltan); Al Razzaque Hotel",
    street: "Kamala carts (BRAC Bank area); Nazirabazar lanes",
    budget: "Budget"
  },
  {
    area: "Shahbagh / TSC / Segun Bagicha",
    dishes: "Afghani momo & grilled sandwiches; Jhuri chanachur; Tea & chatpati",
    restaurants: "TSC cafeteria; nearby cafes",
    street: "Shilpakala Academy vendors; TSC/DCC chanachur & corn stalls",
    budget: "Budget"
  },
  {
    area: "Mirpur (Beribadh / Mirpur 1)",
    dishes: "Bhorta with fish fry; Corn soup; Nihari",
    restaurants: "Rofik Miyar; Appayon",
    street: "Beribadh corn soup stalls; Mirpur 1 roadside carts",
    budget: "Budget"
  },
  {
    area: "Mirpur DOHS",
    dishes: "Pan-Asian dumplings; 12-treasure soup; Naga prawns",
    restaurants: "Lambert Lounge; nearby cafes",
    street: "Limited street stalls; nearby Mirpur 10 vendors",
    budget: "Mid to Premium"
  },
  {
    area: "Badda / Bashundhara",
    dishes: "Shawarma & fried snacks; Pani fuchka; Specialty coffee",
    restaurants: "Cafeista; Chillhouse",
    street: "BRAC University lanes; Badda street carts",
    budget: "Budget to Mid"
  }
];

const routes = [
  {
    name: "Classic Dhaka Heritage",
    steps: [
      "Breakfast: Beauty Lassi + bakarkhani in Nazira Bazar",
      "Morning: Haji or Hanif biryani tasting (avoid peak lines)",
      "Lunch: Rofik Miyar bhorta rice with fish fry (Mirpur)",
      "Afternoon: Durbin Bangla or Tiffin Box for tea/snacks",
      "Evening: Gulshan-2 night lane (fuchka, kebabs, halim)",
      "Dinner: Sultan's Dine in Dhanmondi",
      "Late night: Old Dhaka sehri at Chawkbazar"
    ]
  },
  {
    name: "Modern Cafe & Global Eats",
    steps: [
      "Breakfast: North End Coffee Roasters (Uttara) or Gulshan Baking Company",
      "Lunch: Yama Hotpot & Grill (Uttara)",
      "Afternoon: Lambert Lounge (Mirpur DOHS)",
      "Snack: Salimullah Road chitoi pitha + motka tea",
      "Dinner: Durbin Bangla (Mohakhali) for paya/rumali roti",
      "Dessert: Secret Recipe (Elephant Road)"
    ]
  }
];

const safetyTips = [
  "Choose vendors who cook in front of you; prefer covered carts.",
  "Avoid cross-contamination: separate utensils for money and food.",
  "Skip untreated water or ice; choose sealed bottles or boiled tea.",
  "Visit busy stalls for higher turnover and fresher food.",
  "If sensitive, introduce street foods gradually."
];

export default function ToursPage() {
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
      <h2 className="font-display text-2xl font-semibold">Browse Dhaka Tours</h2>
      <div className="mt-4">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      <div className="mt-8">
        <h3 className="font-display text-xl font-semibold">Dhaka Highlights</h3>
        <p className="text-sm text-ink/70 mt-2">
          Key landmarks and districts to anchor your itinerary.
        </p>
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          {dhakaHighlights.map(item => (
            <div key={item.name} className="card p-4">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-36 w-full object-cover rounded-lg"
                  loading="lazy"
                />
              )}
              <p className="text-xs uppercase tracking-widest text-teal font-semibold">{item.area}</p>
              <h4 className="font-display text-lg font-semibold mt-2">{item.name}</h4>
              <p className="text-sm text-ink/70 mt-2">{item.fact}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <h3 className="font-display text-xl font-semibold">Dhaka Food Icons</h3>
        <p className="text-sm text-ink/70 mt-2">
          Famous restaurants tied to specific areas and tour routes.
        </p>
        <div className="grid md:grid-cols-4 gap-4 mt-4">
          {dhakaFoodIcons.map(item => (
            <div key={item.name} className="card p-4">
              <img
                src={item.image}
                alt={item.name}
                className="h-36 w-full object-cover rounded-lg"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <p className="text-xs uppercase tracking-widest text-teal font-semibold">{item.area}</p>
              <h4 className="font-display text-lg font-semibold mt-2">{item.name}</h4>
              <p className="text-sm text-ink/70 mt-2">{item.fact}</p>
              {item.note && <p className="text-xs text-ink/50 mt-1">{item.note}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <h3 className="font-display text-xl font-semibold">Top 10 Must-Try Foods</h3>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {topTen.map(item => (
            <div key={item.rank} className="card p-4">
              <p className="text-xs uppercase tracking-widest text-teal font-semibold">Rank {item.rank}</p>
              <h4 className="font-display text-lg font-semibold mt-1">{item.item}</h4>
              <p className="text-sm text-ink/70">{item.area}</p>
              <p className="text-sm text-ink/70 mt-2">{item.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <h3 className="font-display text-xl font-semibold">Area Food Map</h3>
        <p className="text-sm text-ink/70 mt-2">Each area includes top dishes, restaurants, and street stalls.</p>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {areaCards.map(area => (
            <div key={area.area} className="card p-4">
              <p className="text-xs uppercase tracking-widest text-teal font-semibold">{area.area}</p>
              <div className="mt-2 text-sm text-ink/70">
                <p><strong>Top dishes:</strong> {area.dishes}</p>
                <p><strong>Restaurants:</strong> {area.restaurants}</p>
                <p><strong>Street stalls:</strong> {area.street}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 grid md:grid-cols-3 gap-6">
        <div className="card p-5 md:col-span-2">
          <h3 className="font-display text-xl font-semibold">One-Day Routes</h3>
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            {routes.map(route => (
              <div key={route.name} className="border border-ink/10 rounded-xl p-4 bg-sand/40">
                <h4 className="font-display text-lg font-semibold">{route.name}</h4>
                <ol className="mt-3 text-sm text-ink/70 space-y-2">
                  {route.steps.map((step, idx) => (
                    <li key={step} className="flex gap-3">
                      <span className="h-6 w-6 rounded-full bg-teal/10 text-teal flex items-center justify-center text-xs font-semibold">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-display text-xl font-semibold">Street Food Safety</h3>
          <ul className="mt-4 text-sm text-ink/70 space-y-2">
            {safetyTips.map(tip => (
              <li key={tip}>- {tip}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {tours.length ? tours.map((tour, index) => (
          <TourCard key={tour._id} tour={tour} index={index} />
        )) : (
          <div className="text-ink/70">No tours found. Try adjusting filters.</div>
        )}
      </div>
    </section>
  );
}
