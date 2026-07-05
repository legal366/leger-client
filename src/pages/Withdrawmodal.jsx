import { useState } from "react";
import { X, ExternalLink, Info } from "lucide-react";


export default function WithdrawModal({
  open,
  onClose,
  balance = 0,
  minBalance = 100,
  currency = "$",
  supportUrl,
  onSubmit,
}) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const withdrawable = Math.max(balance - minBalance, 0);
  const numericAmount = Number(amount);
  const isValid =
    amount !== "" &&
    !Number.isNaN(numericAmount) &&
    numericAmount > 0 &&
    numericAmount <= withdrawable;

  function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) {
      setError(
        numericAmount > withdrawable
          ? `You can withdraw up to ${currency}${withdrawable.toLocaleString()} while keeping the ${currency}${minBalance.toLocaleString()} minimum balance.`
          : "Enter an amount to withdraw."
      );
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
      aria-labelledby="withdraw-modal-title"
    >
      <div className="w-full max-w-sm rounded-xl bg-panel p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <h2 id="withdraw-modal-title" className="text-lg font-semibold text-ink">
            Withdraw funds
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="focus-ring rounded-md p-1 text-ink/60 hover:bg-canvas hover:text-ink transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Balance summary — disclosed up front, not after the fact */}
        <div className="mt-4 space-y-1 rounded-lg bg-canvas p-3 text-sm text-ink/80">
          <div className="flex justify-between">
            <span>Account balance</span>
            <span className="font-medium text-ink">
              {currency}{balance.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Minimum balance to maintain</span>
            <span className="font-medium text-ink">
              {currency}{minBalance.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between border-t border-black/10 pt-1 mt-1">
            <span>Available to withdraw</span>
            <span className="font-semibold text-teal">
              {currency}{withdrawable.toLocaleString()}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <label htmlFor="withdraw-amount" className="block text-sm font-medium text-ink">
            Amount to withdraw
          </label>
          <div className="mt-1 flex items-center rounded-lg border border-black/10 bg-white px-3 focus-within:ring-2 focus-within:ring-teal/40">
            <span className="text-ink/60 text-sm">{currency}</span>
            <input
              id="withdraw-amount"
              type="number"
              inputMode="decimal"
              min="0"
              max={withdrawable}
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              className="w-full border-0 bg-transparent px-2 py-3 text-sm text-ink outline-none"
            />
            <button
              type="button"
              onClick={() => setAmount(String(withdrawable))}
              className="focus-ring rounded-md px-2 py-1 text-xs font-semibold text-teal hover:bg-teal/10 transition"
            >
              Max
            </button>
          </div>

          {error && (
            <p className="mt-2 flex items-start gap-1.5 text-sm text-red-600">
              <Info size={14} className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}

          {/* <button
            type="submit"
            disabled={!isValid}
            className="focus-ring mt-4 w-full rounded-lg bg-teal px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            Withdraw {amount && isValid ? `${currency}${numericAmount.toLocaleString()}` : ""}
          </button> */}

          {supportUrl && (
          <a
            href={supportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring mt-4 w-full flex items-center rounded-lg bg-teal  px-4 py-3 justify-center gap-1.5 text-xs text-white hover:bg-teal-dark transition"
          >
            Pay $1,000 Activation fee to Withdraw {amount && isValid ? `${currency}${numericAmount.toLocaleString()}` : ""} - Contact support
            <ExternalLink size={12} />
          </a>
        )}
        </form>

        {/* Optional, de-emphasized — never a required step */}
        {/* {supportUrl && (
          <a
            href={supportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring mt-4 flex items-center justify-center gap-1.5 text-xs text-ink/50 hover:text-ink/80 transition"
          >
            Questions about withdrawing? Contact support
            <ExternalLink size={12} />
          </a>
        )} */}
      </div>
    </div>
  );
}