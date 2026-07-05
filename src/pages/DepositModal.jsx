import { useState } from "react";
import { X, ExternalLink, Info } from "lucide-react";


export default function DepositModal({
  open,
  onClose,
  currency = "$",
  supportUrl,
  onSubmit,
}) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const numericAmount = Number(amount);
  const isValid =
    amount !== "" &&
    !Number.isNaN(numericAmount) &&
    numericAmount > 0

  function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) {
      setError("Enter an amount to deposit.");
      return;
    }
    setError("");
    onSubmit?.(numericAmount);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deposit-modal-title"
    >
      <div className="w-full max-w-sm rounded-xl bg-panel p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <h2 id="deposit-modal-title" className="text-lg font-semibold text-ink">
            Deposit funds
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="focus-ring rounded-md p-1 text-ink/60 hover:bg-canvas hover:text-ink transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <label htmlFor="deposit-amount" className="block text-sm font-medium text-ink">
            Amount to deposit
          </label>
          <div className="mt-1 flex items-center rounded-lg border border-black/10 bg-white px-3 focus-within:ring-2 focus-within:ring-teal/40">
            <span className="text-ink/60 text-sm">{currency}</span>
            <input
              id="deposit-amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              className="w-full border-0 bg-transparent px-2 py-3 text-sm text-ink outline-none"
            />
          </div>

          {error && (
            <p className="mt-2 flex items-start gap-1.5 text-sm text-red-600">
              <Info size={14} className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}

          {supportUrl && (
          <a
            href={supportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring mt-4 w-full flex items-center rounded-lg bg-teal  px-4 py-3 justify-center gap-1.5 text-xs text-white hover:bg-teal-dark transition"
          >
            Contact support to proceed with deposit
            <ExternalLink size={12} />
          </a>
        )}
        </form>
      </div>
    </div>
  );
}