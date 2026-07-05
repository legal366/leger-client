import React, { useEffect, useRef, useState } from "react";

/*
  Signature element: the balance figure counts up on load against a
  quiet topographic line texture. The lines are decorative only —
  they are generated from the account id, not from any performance
  data — so nothing here should read as a real market chart.
*/

const formatMoney = (value, currency) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2,
  }).format(value);

const useCountUp = (target, duration = 900) => {
  const [value, setValue] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    let frame;
    const step = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    startRef.current = null;
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
};

const seededPath = (seed) => {
  // deterministic decorative squiggle, purely visual texture
  let s = seed || 7;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  let d = "M0 40";
  for (let i = 1; i <= 10; i++) {
    const x = i * 40;
    const y = 20 + rand() * 40;
    d += ` L${x} ${y}`;
  }
  return d;
};

const BalanceCard = ({ mainBalance, withdrawableBalance, currency, planName, roiPercent, seed }) => {
  const animatedMain = useCountUp(mainBalance);
  const animatedWithdrawable = useCountUp(withdrawableBalance);
  const path = seededPath(seed);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-teal-dark text-white p-8">
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.12]"
        viewBox="0 0 400 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={path} fill="none" stroke="#F4ECD8" strokeWidth="1.5" />
      </svg>

      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-teal-light/70">
              {planName}
            </p>
            <p className="text-xs text-teal-light/60 mt-3">Main balance</p>
            <p className="mt-1 font-display text-4xl sm:text-5xl font-semibold tabular-nums">
              {formatMoney(animatedMain, currency)}
            </p>
          </div>
          {typeof roiPercent === "number" && (
            <div className="text-right shrink-0">
              <p className="font-mono text-xs uppercase tracking-widest text-teal-light/70">
                ROI
              </p>
              <p className="mt-3 font-display text-xl font-semibold text-gold">
                {roiPercent >= 0 ? "+" : ""}
                {roiPercent}%
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-5 border-t border-white/15 flex items-center justify-between">
          <p className="text-sm text-teal-light/80">Withdrawable</p>
          <p className="font-display text-lg font-semibold tabular-nums">
            {formatMoney(animatedWithdrawable, currency)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
