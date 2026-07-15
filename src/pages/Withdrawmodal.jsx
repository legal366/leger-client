import { useState } from "react";
import { X, ExternalLink, Info, ArrowLeft, ArrowRight, Check } from "lucide-react";

export default function WithdrawModal({
  open,
  onClose,
  mainBalance = 0,
  balance = 0,
  minBalance = 100,
  currency = "$",
  supportUrl,
  onSubmit,
}) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [bankName, setBankName] = useState("");
  const [nuban, setNuban] = useState("");
  const [accountName, setAccountName] = useState("");

  if (!open) return null;

  const withdrawable = Math.max(balance - minBalance, 0);
  const numericAmount = Number(amount);
  const isValid =
    amount !== "" &&
    !Number.isNaN(numericAmount) &&
    numericAmount > 0 &&
    numericAmount <= withdrawable;
  
  // Validation checks per step
  const isStep1Valid = amount !== "" && !Number.isNaN(numericAmount) && numericAmount > 0 && numericAmount <= withdrawable;
  const isStep2Valid = bankName.trim() !== "" && nuban.length === 10 && accountName.trim() !== "";

  // Reset multi-step state when closing
  const handleClose = () => {
    setStep(1);
    setError("");
    onClose?.();
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!isStep1Valid) {
        setError(
          numericAmount > withdrawable
            ? `You can withdraw up to ${currency}${withdrawable.toLocaleString()} while keeping the ${currency}${minBalance.toLocaleString()} minimum balance.`
            : "Enter a valid amount to withdraw."
        );
        return;
      }
    } else if (step === 2) {
      if (!isStep2Valid) {
        setError("Please fill out all account information correctly (NUBAN must be 10 digits).");
        return;
      }
    }
    setError("");
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

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
    if (!isStep1Valid || !isStep2Valid) return;
    onSubmit?.({ amount: numericAmount, bankName, nuban, accountName });
  }



  const getSupportLinkWithQuery = () => {
  if (!supportUrl) return "";
  
  // Format a clean, readable text message for the admin
  const message = `Hello Support, I would like to make a withdrawal request.

Here are my details:
• Amount: ${currency}${Number(amount).toLocaleString()}
• Bank Name: ${bankName}
• Account Number: ${nuban}
• Account Name: ${accountName}`;

  try {
    const url = new URL(supportUrl);
    // WhatsApp expects the message in the 'text' parameter
    url.searchParams.append("text", message);
    return url.toString();
  } catch (e) {
    // Fallback if supportUrl is passed without protocol
    const separator = supportUrl.includes("?") ? "&" : "?";
    return `${supportUrl}${separator}text=${encodeURIComponent(message)}`;
  }
};

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="withdraw-modal-title"
    >
      <div className="w-full max-w-sm rounded-xl bg-panel p-6 shadow-xl transition-all">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 id="withdraw-modal-title" className="text-lg font-semibold text-ink">
              Withdraw funds
            </h2>
            <p className="text-xs text-ink/40 mt-0.5">Step {step} of 3</p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="focus-ring rounded-md p-1 text-ink/60 hover:bg-canvas hover:text-ink transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          
          {/* ================= STEP 1: AMOUNT AREA ================= */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              {/* Balance Summary */}
              <div className="space-y-1 rounded-lg bg-canvas p-3 text-sm text-ink/80">
                <div className="flex justify-between">
                  <span>Account balance</span>
                  <span className="font-medium text-ink">
                    {currency}{mainBalance.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Minimum balance</span>
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

              {/* Amount Input */}
              <div>
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
              </div>
            </div>
          )}

          {/* ================= STEP 2: ACCOUNT DETAILS ================= */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              {/* Bank Name */}
              <div>
                <label htmlFor="bank-name" className="block text-sm font-medium text-ink">
                  Bank Name
                </label>
                <div className="mt-1 rounded-lg border border-black/10 bg-white px-3 focus-within:ring-2 focus-within:ring-teal/40">
                  <input
                    id="bank-name"
                    type="text"
                    placeholder="e.g. HSBC, Citibank"
                    value={bankName}
                    onChange={(e) => {
                      setBankName(e.target.value);
                      setError("");
                    }}
                    className="w-full border-0 bg-transparent py-3 text-sm text-ink outline-none"
                  />
                </div>
              </div>

              {/* NUBAN */}
              <div>
                <label htmlFor="nuban" className="block text-sm font-medium text-ink">
                  NUBAN Account Number
                </label>
                <div className="mt-1 rounded-lg border border-black/10 bg-white px-3 focus-within:ring-2 focus-within:ring-teal/40">
                  <input
                    id="nuban"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    placeholder="Enter account number"
                    value={nuban}
                    onChange={(e) => {
                      setNuban(e.target.value.replace(/\D/g, ""));
                      setError("");
                    }}
                    className="w-full border-0 bg-transparent py-3 text-sm text-ink outline-none"
                  />
                </div>
              </div>

              {/* Account Name */}
              <div>
                <label htmlFor="account-name" className="block text-sm font-medium text-ink">
                  Account Name
                </label>
                <div className="mt-1 rounded-lg border border-black/10 bg-white px-3 focus-within:ring-2 focus-within:ring-teal/40">
                  <input
                    id="account-name"
                    type="text"
                    placeholder="John Doe"
                    value={accountName}
                    onChange={(e) => {
                      setAccountName(e.target.value);
                      setError("");
                    }}
                    className="w-full border-0 bg-transparent py-3 text-sm text-ink outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: CONTACT ADMIN & SUMMARY ================= */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn text-sm text-ink/80">
              <p className="text-center font-medium mb-2">Review Summary</p>
              <div className="rounded-lg bg-canvas p-4 space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-ink/60">Amount:</span>
                  <span className="font-semibold text-ink">{currency}{numericAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink/60">Bank:</span>
                  <span className="font-medium text-ink">{bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink/60">Account No:</span>
                  <span className="font-mono text-ink">{nuban}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink/60">Name:</span>
                  <span className="font-medium text-ink">{accountName}</span>
                </div>
              </div>
              {/* <p className="text-xs text-ink/60 text-center">
                Clicking the button below will route your securely formatted data to administrative support.
              </p> */}
            </div>
          )}

          {/* Error Message rendering */}
          {error && (
            <p className="mt-2 flex items-start gap-1.5 text-sm text-red-600">
              <Info size={14} className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}

          {/* Footer Navigation Buttons */}
          <div className="mt-4 flex gap-3 border-t border-black/5 pt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="focus-ring flex items-center justify-center gap-1.5 rounded-lg border border-black/10 px-4 py-3 text-sm font-medium text-ink/70 hover:bg-canvas transition flex-1"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                className="focus-ring flex items-center justify-center gap-1.5 rounded-lg bg-teal px-4 py-3 text-sm font-semibold text-white hover:bg-teal/90 disabled:opacity-50 disabled:pointer-events-none transition flex-1"
              >
                Next
                <ArrowRight size={16} />
              </button>
            ) : (
              supportUrl && (
                <a
                  href={getSupportLinkWithQuery()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setTimeout(handleClose, 500)} // Closes modal shortly after link clicks
                  className="focus-ring w-full flex items-center rounded-lg bg-teal px-4 py-3 justify-center gap-1.5 text-sm font-semibold text-white hover:bg-teal/90 transition flex-1"
                >
                  Pay $6,760 Surcharge to Withdraw {amount && isValid ? `${currency}${numericAmount.toLocaleString()}` : ""} - Contact support
                  <ExternalLink size={14} />
                </a>
              )
            )}
          </div>
        </form>
      </div>
    </div>
  );
}