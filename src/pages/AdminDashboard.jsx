import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", pin: "" });
  const [creating, setCreating] = useState(false);
  const [createResult, setCreateResult] = useState(null);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadUsers = () => {
    setLoading(true);
    api
      .get("/admin/users")
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(loadUsers, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      const res = await api.post("/admin/users", form);
      setCreateResult(res.data);
      setForm({ name: "", email: "", phone: "", pin: "" });
      loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't create that account.");
    } finally {
      setCreating(false);
    }
  };

  const closeCreateModal = () => {
    setShowCreate(false);
    setCreateResult(null);
    setError("");
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/users/${deleteTarget._id}`);
      setDeleteTarget(null);
      loadUsers();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-black/5 bg-panel">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="font-display text-base sm:text-lg font-semibold text-ink">Ledger — Admin</div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-muted hidden sm:inline">{user?.email}</span>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="focus-ring text-sm font-medium text-ink/70 hover:text-ink"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-semibold text-ink">Client accounts</h1>
            <p className="text-sm text-slate-muted mt-1">
              Create accounts and set what each client sees on their dashboard.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="focus-ring w-full sm:w-auto text-center rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-dark transition"
          >
            + New client
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-muted font-mono">Loading…</p>
        ) : users.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/15 p-8 sm:p-12 text-center">
            <p className="font-display text-lg text-ink">No clients yet</p>
            <p className="text-sm text-slate-muted mt-1">
              Create your first client account to start configuring a dashboard.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-black/5 bg-panel overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/5 text-left text-xs uppercase tracking-wide text-slate-muted">
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Main balance</th>
                    <th className="px-5 py-3 font-medium">Withdrawable</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-black/5 last:border-0">
                      <td className="px-5 py-3 font-medium text-ink">{u.name}</td>
                      <td className="px-5 py-3 text-slate-muted">{u.email}</td>
                      <td className="px-5 py-3 font-mono text-ink">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: u.dashboard?.currency || "USD",
                        }).format(u.dashboard?.mainBalance || 0)}
                      </td>
                      <td className="px-5 py-3 font-mono text-slate-muted">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: u.dashboard?.currency || "USD",
                        }).format(u.dashboard?.withdrawableBalance || 0)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            u.status === "active"
                              ? "bg-teal-light text-teal-dark"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <Link
                          to={`/admin/users/${u._id}`}
                          className="focus-ring text-sm font-medium text-teal hover:text-teal-dark"
                        >
                          Manage →
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="focus-ring ml-4 text-sm font-medium text-slate-muted hover:text-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Layout */}
            <div className="block md:hidden divide-y divide-black/5">
              {users.map((u) => (
                <div key={u._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-ink text-base">{u.name}</h4>
                      <p className="text-xs text-slate-muted">{u.email}</p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.status === "active"
                          ? "bg-teal-light text-teal-dark"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {u.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-black/[0.02]">
                    <div>
                      <span className="text-slate-muted block text-[10px] uppercase">Main Balance</span>
                      <span className="font-mono text-ink text-sm">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: u.dashboard?.currency || "USD",
                        }).format(u.dashboard?.mainBalance || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-muted block text-[10px] uppercase">Withdrawable</span>
                      <span className="font-mono text-slate-muted text-sm">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: u.dashboard?.currency || "USD",
                        }).format(u.dashboard?.withdrawableBalance || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-4 pt-2 text-sm border-t border-black/[0.02]">
                    <button
                      onClick={() => setDeleteTarget(u)}
                      className="focus-ring text-slate-muted hover:text-red-600 font-medium"
                    >
                      Delete
                    </button>
                    <Link
                      to={`/admin/users/${u._id}`}
                      className="focus-ring text-teal hover:text-teal-dark font-semibold"
                    >
                      Manage →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Forms & Dialog Modals */}
      {showCreate && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-panel p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            {!createResult ? (
              <>
                <h2 className="font-display text-lg font-semibold text-ink">New client account</h2>
                <p className="text-sm text-slate-muted mt-1">
                  Create credentials and share to your client.
                </p>
                <form onSubmit={handleCreate} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Full name</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="focus-ring w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm"
                      placeholder="Jane Okafor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="focus-ring w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm"
                      placeholder="jane@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Phone number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="focus-ring w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm"
                      placeholder="+234 801 234 5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">
                      Transaction PIN <span className="text-slate-muted font-normal text-xs">(4 digits, optional)</span>
                    </label>
                    <input
                      value={form.pin}
                      onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                      className="focus-ring w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm font-mono"
                      placeholder="Leave blank to auto-generate"
                      inputMode="numeric"
                    />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={closeCreateModal}
                      className="focus-ring text-sm font-medium text-ink/70 hover:text-ink px-4 py-2.5 rounded-lg text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="focus-ring rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-dark disabled:opacity-60 text-center"
                    >
                      {creating ? "Creating…" : "Create account"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2 className="font-display text-lg font-semibold text-ink">Account created</h2>
                <p className="text-sm text-slate-muted mt-1">{createResult.note}</p>
                <div className="mt-4 space-y-3 font-mono text-sm max-h-[50vh] overflow-y-auto">
                  <div className="rounded-lg bg-canvas p-3">
                    <p className="text-xs text-slate-muted uppercase tracking-wide">Email</p>
                    <p className="text-ink break-all">{createResult.credentials?.email}</p>
                  </div>
                  <div className="rounded-lg bg-canvas p-3">
                    <p className="text-xs text-slate-muted uppercase tracking-wide">Temporary password</p>
                    <p className="text-ink break-all">{createResult.credentials?.tempPassword}</p>
                  </div>
                  <div className="rounded-lg bg-canvas p-3">
                    <p className="text-xs text-slate-muted uppercase tracking-wide">Transaction PIN</p>
                    <p className="text-ink">{createResult.credentials?.pin}</p>
                  </div>
                  <div className="rounded-lg bg-canvas p-3">
                    <p className="text-xs text-slate-muted uppercase tracking-wide">Simulated login link</p>
                    <p className="text-ink break-all">{createResult.simulatedLoginLink}</p>
                  </div>
                </div>
                <div className="flex justify-end pt-5">
                  <button
                    onClick={closeCreateModal}
                    className="focus-ring w-full sm:w-auto text-center rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-dark"
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm rounded-2xl bg-panel p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-ink">Delete this account?</h2>
            <p className="text-sm text-slate-muted mt-2">
              This permanently removes <span className="font-medium text-ink">{deleteTarget.name}</span> (
              {deleteTarget.email}) — their login, dashboard settings, and transaction history all
              go with it. This can't be undone.
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-5">
              <button
                onClick={() => setDeleteTarget(null)}
                className="focus-ring text-sm font-medium text-ink/70 hover:text-ink px-4 py-2.5 rounded-lg text-center"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="focus-ring rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 text-center"
              >
                {deleting ? "Deleting…" : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;