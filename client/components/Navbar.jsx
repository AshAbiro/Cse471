"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    setLoggedIn(Boolean(token));
    setRole(storedRole);
  }, [pathname]);

  const links = useMemo(() => {
    const base = [
      { href: "/tours", label: "Tours" },
      { href: "/pricing", label: "Pricing" }
    ];

    if (!loggedIn) {
      return [...base, { href: "/login", label: "Login" }];
    }

    if (role === "admin") return [...base, { href: "/dashboard/admin", label: "Admin" }];
    if (role === "guide") return [...base, { href: "/dashboard/guide", label: "Guide" }];
    return [...base, { href: "/dashboard/user", label: "User" }];
  }, [loggedIn, role]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setLoggedIn(false);
    setRole(null);
    router.push("/");
  };

  return (
    <header className="bg-sand border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-bold">
          Dhaka Tours
        </Link>
        <nav className="flex items-center gap-2">
          {links.map(link => {
            const isActive = pathname === link.href;
            const className = `px-3 py-2 rounded-lg text-sm font-semibold ${
              isActive ? "bg-ink text-sand" : "text-ink hover:bg-ink/10"
            }`;
            return (
              <Link key={link.href} href={link.href} className={className}>
                {link.label}
              </Link>
            );
          })}
          {loggedIn && (
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-ink hover:bg-ink/10"
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
