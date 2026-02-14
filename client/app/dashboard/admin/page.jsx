"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api.js";

export default function DashboardAdminPage() {
  const router = useRouter();
  const [guides, setGuides] = useState([]);
  const [tours, setTours] = useState([]);
  const [users, setUsers] = useState([]);
  const [userDetail, setUserDetail] = useState(null);
  const [stats, setStats] = useState({ users: 0, tours: 0, guides: 0 });
  const [message, setMessage] = useState("");
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  const load = () => {
    api.get("/admin/guides/pending").then(res => setGuides(res.data || [])).catch(() => setGuides([]));
    api.get("/admin/tours/pending").then(res => setTours(res.data || [])).catch(() => setTours([]));
    api.get("/admin/stats").then(res => setStats(res.data || stats)).catch(() => {});
    api.get("/admin/users").then(res => setUsers(res.data || [])).catch(() => setUsers([]));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const ok = Boolean(token) && role === "admin";
    setHasAccess(ok);
    setAccessChecked(true);
    if (ok) load();
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

  const viewUser = async (id) => {
    try {
      const res = await api.get(`/admin/users/${id}`);
      setUserDetail(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to load user");
    }
  };

  return (
    <section className="section">
      {!accessChecked ? null : !hasAccess ? (
        <div className="card p-6 max-w-lg">
          <h2 className="font-display text-2xl font-semibold">Admin Access Required</h2>
          <p className="text-ink/70 mt-2">
            Please log in with an admin account to view this dashboard.
          </p>
          <button className="btn-primary mt-4" onClick={() => router.push("/login")}>
            Go to Login
          </button>
        </div>
      ) : (
        <>
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

      <div className="card p-5 mt-8">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Users</h3>
          <span className="text-sm text-ink/60">Total: {users.length}</span>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink/70">
                <th className="pb-2">Name</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Role</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Created</th>
                <th className="pb-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-t border-ink/10">
                  <td className="py-2 font-semibold">{u.name}</td>
                  <td className="py-2 text-ink/70">{u.email}</td>
                  <td className="py-2 text-ink/70">{u.role}</td>
                  <td className="py-2 text-ink/70">{u.status}</td>
                  <td className="py-2 text-ink/70">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-2">
                    <button className="btn-ghost" onClick={() => viewUser(u._id)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {!users.length && (
                <tr>
                  <td className="py-3 text-ink/70" colSpan="6">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {userDetail && (
          <div className="mt-5 border-t border-ink/10 pt-4">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-base font-semibold">User Details</h4>
              <button className="btn-ghost" onClick={() => setUserDetail(null)}>Close</button>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-3 text-sm text-ink/70">
              <p><strong>Name:</strong> {userDetail.name}</p>
              <p><strong>Email:</strong> {userDetail.email}</p>
              <p><strong>Role:</strong> {userDetail.role}</p>
              <p><strong>Status:</strong> {userDetail.status}</p>
              <p><strong>Phone:</strong> {userDetail.phone || "—"}</p>
              <p><strong>Bio:</strong> {userDetail.bio || "—"}</p>
            </div>
          </div>
        )}
      </div>
        </>
      )}
    </section>
  );
}
