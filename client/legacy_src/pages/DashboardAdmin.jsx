import { useEffect, useState } from "react";
import api from "../api/client.js";

export default function DashboardAdmin() {
  const [guides, setGuides] = useState([]);
  const [tours, setTours] = useState([]);
  const [stats, setStats] = useState({ users: 0, tours: 0, guides: 0 });
  const [message, setMessage] = useState("");

  const load = () => {
    api.get("/admin/guides/pending").then(res => setGuides(res.data || [])).catch(() => setGuides([]));
    api.get("/admin/tours/pending").then(res => setTours(res.data || [])).catch(() => setTours([]));
    api.get("/admin/stats").then(res => setStats(res.data || stats)).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const updateGuide = async (id, status) => {
    try {
      await api.patch(`/admin/guides/${id}/status`, { status });
      setMessage("Guide status updated");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    }
  };

  const updateTour = async (id, status) => {
    try {
      await api.patch(`/tours/${id}/status`, { status });
      setMessage("Tour status updated");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <section className="section">
      <h2 className="font-display text-2xl font-semibold">Admin Dashboard</h2>
      {message && <p className="text-sm mt-2 text-teal">{message}</p>}

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="card p-4"><p className="text-sm">Users</p><p className="text-2xl font-bold">{stats.users}</p></div>
        <div className="card p-4"><p className="text-sm">Guides</p><p className="text-2xl font-bold">{stats.guides}</p></div>
        <div className="card p-4"><p className="text-sm">Tours</p><p className="text-2xl font-bold">{stats.tours}</p></div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <div className="card p-5">
          <h3 className="font-display text-lg font-semibold">Pending Guides</h3>
          <div className="mt-4 space-y-3">
            {guides.map(g => (
              <div key={g._id} className="border border-ink/10 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{g.name}</p>
                  <p className="text-xs text-ink/60">{g.email}</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-primary" onClick={() => updateGuide(g._id, "active")}>Approve</button>
                  <button className="btn-ghost" onClick={() => updateGuide(g._id, "suspended")}>Reject</button>
                </div>
              </div>
            ))}
            {!guides.length && <p className="text-ink/70">No pending guides.</p>}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-display text-lg font-semibold">Pending Tours</h3>
          <div className="mt-4 space-y-3">
            {tours.map(t => (
              <div key={t._id} className="border border-ink/10 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{t.title}</p>
                  <p className="text-xs text-ink/60">Guide: {t.guide?.name}</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-primary" onClick={() => updateTour(t._id, "approved")}>Approve</button>
                  <button className="btn-ghost" onClick={() => updateTour(t._id, "rejected")}>Reject</button>
                </div>
              </div>
            ))}
            {!tours.length && <p className="text-ink/70">No pending tours.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
