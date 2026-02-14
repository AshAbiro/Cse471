import { Link, NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-semibold ${
    isActive ? "bg-ink text-sand" : "text-ink hover:bg-ink/10"
  }`;

export default function Navbar() {
  return (
    <header className="bg-sand border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-xl font-bold">
          NicheCity
        </Link>
        <nav className="flex items-center gap-2">
          <NavLink to="/tours" className={linkClass}>Tours</NavLink>
          <NavLink to="/dashboard/user" className={linkClass}>User</NavLink>
          <NavLink to="/dashboard/guide" className={linkClass}>Guide</NavLink>
          <NavLink to="/dashboard/admin" className={linkClass}>Admin</NavLink>
          <NavLink to="/login" className={linkClass}>Login</NavLink>
        </nav>
      </div>
    </header>
  );
}
