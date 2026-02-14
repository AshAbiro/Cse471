"use client";

import Link from "next/link";

const plans = [
  {
    name: "Basic Guide",
    price: "৳0 / month",
    fee: "12% platform commission",
    features: [
      "Create and manage tours",
      "Standard search visibility",
      "Basic booking analytics"
    ]
  },
  {
    name: "Pro Guide",
    price: "৳999 / month",
    fee: "12% platform commission",
    features: [
      "Priority placement in search",
      "Featured badge on profile",
      "Detailed performance analytics",
      "Early access to new features"
    ]
  }
];

export default function PricingPage() {
  return (
    <section className="section">
      <h2 className="font-display text-2xl font-semibold">Guide Pricing</h2>
      <p className="text-ink/70 mt-2">
        Local guides can start for free and upgrade for higher visibility and analytics.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {plans.map(plan => (
          <div key={plan.name} className="card p-6">
            <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
            <p className="text-2xl font-bold mt-2">{plan.price}</p>
            <p className="text-sm text-ink/70 mt-1">{plan.fee}</p>
            <ul className="mt-4 text-sm text-ink/70 space-y-2">
              {plan.features.map(item => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
            <Link href="/register" className="btn-primary inline-block mt-5">
              Become a Guide
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
