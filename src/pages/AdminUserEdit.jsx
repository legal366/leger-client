import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios.js";
import BalanceCard from "../components/BalanceCard.jsx";

const emptyField = () => ({ label: "", value: "" });

const emptyTx = () => ({
  type: "deposit",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  status: "completed",
  note: "",
});

const AdminUserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [form, setForm] = useState(null);
  const [linkResult, setLinkResult] = useState(null);
  const [pinResult, setPinResult] = useState(null);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [newTx, setNewTx] = useState(emptyTx());
  const [txError, setTxError] = useState("");
  const [addingTx, setAddingTx] = useState(false);

  useEffect(() => {
    api.get(`/admin/users/${id}`).then((res) => {
      setUserInfo(res.data);
      setForm(res.data.dashboard);
      setTransactions(res.data.dashboard?.transactions || []);
      setPhone(res.data.phone || "");
      setLoading(false);
    });
  }, [id]);

  const addTransaction = async (e) => {
    e.preventDefault();
    setTxError("");
    if (!newTx.amount || Number(newTx.amount) <= 0) {
      setTxError("Enter an amount greater than 0.");
      return;
    }
    setAddingTx(true);
    try {
      const res = await api.post(`/admin/users/${id}/transactions`, newTx);
      setTransactions(res.data.dashboard.transactions);
      setNewTx(emptyTx());
    } catch (err) {
      setTxError(err?.response?.data?.message || "Couldn't add that transaction.");
    } finally {
      setAddingTx(false);
    }
  };

  const deleteTransaction = async (txId) => {
    const res = await api.delete(`/admin/users/${id}/transactions/${txId}`);
    setTransactions(res.data.dashboard.transactions);
  };

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const updateField = (idx, key, value) => {
    const next = [...form.customFields];
    next[idx] = { ...next[idx], [key]: value };
    update("customFields", next);
  };

  const addField = () => update("customFields", [...(form.customFields || []), emptyField()]);
  const removeField = (idx) =>
    update("customFields", form.customFields.filter((_, i) => i !== idx));

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    setSaved(false);
    try {
      await api.put(`/admin/users/${id}/dashboard`, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't save changes.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async () => {
    const nextStatus = userInfo.status === "active" ? "suspended" : "active";
    const res = await api.put(`/admin/users/${id}`, { status: nextStatus });
    setUserInfo(res.data);
  };

  const resendLink = async () => {
    const res = await api.post(`/admin/users/${id}/reset-link`);
    setLinkResult(res.data);
  };

  const savePhone = async (e) => {
    e.preventDefault();
    setSavingPhone(true);
    setPhoneSaved(false);
    try {
      const res = await api.put(`/admin/users/${id}`, { phone });
      setUserInfo(res.data);
      setPhoneSaved(true);
      setTimeout(() => setPhoneSaved(false), 2000);
    } finally {
      setSavingPhone(false);
    }
  };

  const resetPin = async () => {
    const res = await api.post(`/admin/users/${id}/reset-pin`);
    setPinResult(res.data);
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete(`/admin/users/${id}`);
      navigate("/geee");
    } finally {
      setDeleting(false);
    }
  };

  if (loading || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <span className="font-mono text-sm text-slate-muted">Loading…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-black/5 bg-panel">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Link to="/geee" className="font-display text-base sm:text-lg font-semibold text-ink">
            ← Ref/recovery — Admin
          </Link>
          <button
            onClick={toggleStatus}
            className={`focus-ring w-full sm:w-auto text-center text-sm font-medium rounded-full px-3 py-1.5 sm:py-1 ${
              userInfo.status === "active"
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-teal-light text-teal-dark hover:bg-teal-light/70"
            }`}
          >
            {userInfo.status === "active" ? "Suspend account" : "Reactivate account"}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-semibold text-ink break-all">{userInfo.name}</h1>
            <p className="text-sm text-slate-muted break-all">{userInfo.email}</p>
          </div>

          <BalanceCard
            mainBalance={Number(form.mainBalance) || 0}
            withdrawableBalance={Number(form.withdrawableBalance) || 0}
            currency={form.currency}
            planName={form.planName}
            roiPercent={Number(form.roiPercent) || 0}
            seed={id.length}
          />

          <div className="rounded-2xl border border-black/5 bg-panel p-4 sm:p-5">
            <p className="text-sm font-medium text-ink mb-3">Contact details</p>
            <form onSubmit={savePhone} className="flex flex-col sm:flex-row gap-2">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 801 234 5678"
                className="focus-ring flex-1 rounded-lg border border-black/10 px-3 py-2.5 text-sm"
              />
              <button
                type="submit"
                disabled={savingPhone}
                className="focus-ring rounded-lg border border-black/10 px-4 py-2.5 text-sm font-medium text-ink hover:bg-canvas disabled:opacity-60"
              >
                {savingPhone ? "Saving…" : "Save"}
              </button>
            </form>
            {phoneSaved && <p className="text-xs text-teal-dark mt-2">Saved</p>}
            <p className="text-xs text-slate-muted mt-2">
              Shown to the client on their dashboard.
            </p>
          </div>

          <div className="rounded-2xl border border-black/5 bg-panel p-4 sm:p-5">
            <p className="text-sm font-medium text-ink mb-3">Client access</p>
            <div className="space-y-2">
              <button
                onClick={resendLink}
                className="focus-ring w-full text-left sm:text-center rounded-lg border border-black/10 px-4 py-2.5 text-sm font-medium text-ink hover:bg-canvas"
              >
                Reset password & new login link
              </button>
              <button
                onClick={resetPin}
                className="focus-ring w-full text-left sm:text-center rounded-lg border border-black/10 px-4 py-2.5 text-sm font-medium text-ink hover:bg-canvas"
              >
                Reset transaction PIN
              </button>
            </div>
            {linkResult && (
              <div className="mt-4 space-y-2 font-mono text-xs max-h-[40vh] overflow-y-auto">
                <p className="text-slate-muted">{linkResult.note}</p>
                <div className="rounded-lg bg-canvas p-3">
                  <p className="text-slate-muted uppercase tracking-wide">Temp password</p>
                  <p className="text-ink break-all">{linkResult.credentials?.tempPassword}</p>
                </div>
                <div className="rounded-lg bg-canvas p-3 break-all">
                  <p className="text-slate-muted uppercase tracking-wide">Login link</p>
                  <p className="text-ink text-xs">{linkResult.simulatedLoginLink}</p>
                </div>
              </div>
            )}
            {pinResult && (
              <div className="mt-4 font-mono text-xs">
                <p className="text-slate-muted">{pinResult.note}</p>
                <div className="rounded-lg bg-canvas p-3 mt-2">
                  <p className="text-slate-muted uppercase tracking-wide">New PIN</p>
                  <p className="text-ink">{pinResult.pin}</p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50/40 p-4 sm:p-5">
            <p className="text-sm font-medium text-red-700 mb-1">Danger zone</p>
            <p className="text-xs text-red-700/70 mb-3">
              Permanently deletes this account, its dashboard settings, and transaction history.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="focus-ring w-full rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 text-center"
            >
              Delete this account
            </button>
          </div>
        </div>

        {/* Right Column Form */}
        <form onSubmit={handleSave} className="lg:col-span-3 space-y-6">
          <div className="rounded-2xl border border-black/5 bg-panel p-4 sm:p-6 space-y-4">
            <h2 className="font-display text-base font-semibold text-ink">Portfolio figures</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Main balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.mainBalance}
                  onChange={(e) => update("mainBalance", e.target.value)}
                  className="focus-ring w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Withdrawable balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.withdrawableBalance}
                  onChange={(e) => update("withdrawableBalance", e.target.value)}
                  className="focus-ring w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Currency</label>
                <select
                  value={form.currency}
                  onChange={(e) => update("currency", e.target.value)}
                  className="focus-ring w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm bg-white"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="NGN">NGN</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Plan name</label>
                <input
                  value={form.planName}
                  onChange={(e) => update("planName", e.target.value)}
                  className="focus-ring w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-ink mb-1">ROI (%) — display only</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.roiPercent}
                  onChange={(e) => update("roiPercent", e.target.value)}
                  className="focus-ring w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm font-mono"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-panel p-4 sm:p-6 space-y-4">
            <h2 className="font-display text-base font-semibold text-ink">Dashboard content</h2>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Headline</label>
              <input
                value={form.headline}
                onChange={(e) => update("headline", e.target.value)}
                className="focus-ring w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Message to client</label>
              <textarea
                rows={3}
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                className="focus-ring w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm"
                placeholder="Any note you want the client to see on their dashboard…"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-ink">Custom fields</label>
                <button
                  type="button"
                  onClick={addField}
                  className="focus-ring text-sm font-medium text-teal hover:text-teal-dark"
                >
                  + Add field
                </button>
              </div>
              <div className="space-y-2">
                {(form.customFields || []).map((f, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      value={f.label}
                      onChange={(e) => updateField(idx, "label", e.target.value)}
                      placeholder="Label (e.g. Maturity)"
                      className="focus-ring flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm min-w-0"
                    />
                    <input
                      value={f.value}
                      onChange={(e) => updateField(idx, "value", e.target.value)}
                      placeholder="Value"
                      className="focus-ring flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm min-w-0"
                    />
                    <button
                      type="button"
                      onClick={() => removeField(idx)}
                      className="focus-ring p-2 text-slate-muted hover:text-red-600 flex-shrink-0"
                      aria-label="Remove field"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-panel p-4 sm:p-6 space-y-4">
            <h2 className="font-display text-base font-semibold text-ink">Transaction history</h2>
            <p className="text-sm text-slate-muted -mt-2">
              Entries you add here appear on the client's dashboard. This doesn't move any
              money or change the balance above.
            </p>

            {transactions.length > 0 && (
              <div className="rounded-lg border border-black/5 overflow-hidden">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-sm min-w-[500px] md:min-w-0">
                    <thead>
                      <tr className="border-b border-black/5 text-left text-xs uppercase tracking-wide text-slate-muted">
                        <th className="px-3 py-2 font-medium">Date</th>
                        <th className="px-3 py-2 font-medium">Type</th>
                        <th className="px-3 py-2 font-medium">Amount</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium">Note</th>
                        <th className="px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...transactions]
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((tx) => (
                          <tr key={tx._id} className="border-b border-black/5 last:border-0">
                            <td className="px-3 py-2 font-mono text-xs text-slate-muted whitespace-nowrap">
                              {new Date(tx.date).toLocaleDateString()}
                            </td>
                            <td className="px-3 py-2 capitalize">{tx.type}</td>
                            <td className="px-3 py-2 font-mono whitespace-nowrap">
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: form.currency || "USD",
                              }).format(tx.amount)}
                            </td>
                            <td className="px-3 py-2 capitalize text-xs">{tx.status}</td>
                            <td className="px-3 py-2 text-slate-muted max-w-[150px] truncate">{tx.note}</td>
                            <td className="px-3 py-2 text-right">
                              <button
                                type="button"
                                onClick={() => deleteTransaction(tx._id)}
                                className="focus-ring text-slate-muted hover:text-red-600"
                                aria-label="Delete transaction"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Added container layout configuration fix here */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium text-ink mb-1">Type</label>
                  <select
                    value={newTx.type}
                    onChange={(e) => setNewTx({ ...newTx, type: e.target.value })}
                    className="focus-ring w-full rounded-lg border border-black/10 px-2 py-2.5 text-sm bg-white"
                  >
                    <option value="deposit">Deposit</option>
                    <option value="withdrawal">Withdrawal</option>
                    <option value="profit">Profit</option>
                    <option value="fee">Fee</option>
                    <option value="adjustment">Adjustment</option>
                  </select>
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium text-ink mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newTx.amount}
                    onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                    className="focus-ring w-full rounded-lg border border-black/10 px-2 py-2.5 text-sm font-mono"
                    placeholder="0.00"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium text-ink mb-1">Date</label>
                  <input
                    type="date"
                    value={newTx.date}
                    onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                    className="focus-ring w-full rounded-lg border border-black/10 px-2 py-2.5 text-sm font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-ink mb-1">Status</label>
                  <select
                    value={newTx.status}
                    onChange={(e) => setNewTx({ ...newTx, status: e.target.value })}
                    className="focus-ring w-full rounded-lg border border-black/10 px-2 py-2.5 text-sm bg-white"
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="w-full">
                  <label className="block text-xs font-medium text-ink mb-1">Memo/Note</label>
                  <input
                    value={newTx.note}
                    onChange={(e) => setNewTx({ ...newTx, note: e.target.value })}
                    className="focus-ring w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
                    placeholder="E.g. Wire transfer assignment"
                  />
                </div>
                <button
                  type="button"
                  onClick={addTransaction}
                  disabled={addingTx}
                  className="focus-ring w-full sm:w-auto flex-shrink-0 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/80 disabled:opacity-60"
                >
                  Add
                </button>
              </div>
              {txError && <p className="text-xs text-red-600 mt-1">{txError}</p>}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="focus-ring w-full sm:w-auto rounded-lg bg-teal px-6 py-3 text-sm font-semibold text-white hover:bg-teal-dark transition disabled:opacity-60 text-center"
            >
              {saving ? "Saving alterations..." : saved ? "Changes Saved ✓" : "Save changes"}
            </button>
          </div>
          {error && <p className="text-sm text-red-600 text-right">{error}</p>}
        </form>
      </main>

      {/* Delete Dialog Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm rounded-2xl bg-panel p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-ink">Delete this account?</h2>
            <p className="text-sm text-slate-muted mt-2">
              This permanently removes <span className="font-medium text-ink">{userInfo.name}</span>'s configuration profile. This cannot be undone.
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-5">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="focus-ring text-sm font-medium text-ink/70 hover:text-ink px-4 py-2.5 rounded-lg text-center"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
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

export default AdminUserEdit;