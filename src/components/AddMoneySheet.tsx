import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CircleCheck } from "lucide-react";
import { useStore, type Stash } from "../lib/store";
import { rupees } from "../lib/format";
import { Button, Chip, Sheet } from "./ui";

const quickAmounts = [100, 500, 1000, 2000];

export function AddMoneySheet({ stash, open, onClose, suggested }: { stash: Stash | undefined; open: boolean; onClose: () => void; suggested?: number }) {
  const invest = useStore((state) => state.invest);
  const dip = useStore((state) => state.dip);
  const [amount, setAmount] = useState(suggested ?? 500);
  const [stage, setStage] = useState<"amount" | "paying" | "done">("amount");

  useEffect(() => {
    if (open) {
      setAmount(suggested ?? 500);
      setStage("amount");
    }
  }, [open, suggested]);

  if (!stash) return null;

  const pay = () => {
    setStage("paying");
    setTimeout(() => {
      invest(stash.id, amount, "One-time top-up");
      setStage("done");
    }, 1100);
  };

  return (
    <Sheet open={open} onClose={onClose} title={stage === "done" ? "" : `Add to ${stash.emoji} ${stash.name}`}>
      {stage === "amount" && (
        <div>
          <label className="block mt-2 text-[13px] font-semibold text-ink-2" htmlFor="amount">
            Amount
          </label>
          <div className="mt-1 flex items-center border-b-2 border-mint pb-1">
            <span className="text-[40px] font-bold text-ink-3">₹</span>
            <input
              id="amount"
              inputMode="numeric"
              value={amount ? amount.toLocaleString("en-IN") : ""}
              onChange={(event) => setAmount(Number(event.target.value.replace(/\D/g, "")) || 0)}
              className="num w-full bg-transparent text-[44px] font-bold outline-none text-ink"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {quickAmounts.map((value) => (
              <Chip key={value} active={amount === value} onClick={() => setAmount(value)}>
                {rupees(value)}
              </Chip>
            ))}
          </div>
          {dip && stash.bucket !== "steady" && (
            <p className="mt-4 rounded-2xl bg-mint-soft p-3.5 text-[14px] text-ink leading-snug">
              🛒 Markets are down this week, so {rupees(amount || 0)} buys more units than usual.
            </p>
          )}
          {amount > 0 && amount < 100 && <p className="mt-3 text-[13px] text-neg">Minimum is ₹100.</p>}
          <Button className="mt-6 w-full" disabled={amount < 100} onClick={pay}>
            Pay {rupees(amount || 0)} via UPI
          </Button>
          <p className="mt-3 text-center text-[12px] text-ink-2">No fees from Groww. Money goes straight to the fund house.</p>
        </div>
      )}
      {stage === "paying" && (
        <div className="py-14 flex flex-col items-center gap-4" aria-live="polite">
          <motion.div className="h-14 w-14 rounded-full border-4 border-surface-3 border-t-mint" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} />
          <div className="text-[15px] font-semibold text-ink-2">Waiting for your UPI app…</div>
        </div>
      )}
      {stage === "done" && (
        <div className="py-6 flex flex-col items-center text-center" data-testid="payment-done">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}>
            <CircleCheck size={72} className="text-mint" />
          </motion.div>
          <div className="mt-3 text-[24px] font-bold">{rupees(amount)} added</div>
          <p className="mt-1 text-[15px] text-ink-2">To {stash.name}. Units arrive in 1–2 working days.</p>
          <Button className="mt-6 w-full" onClick={onClose}>
            Done
          </Button>
        </div>
      )}
    </Sheet>
  );
}
