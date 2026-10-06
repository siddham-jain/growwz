import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Snowflake } from "lucide-react";
import { incomeMoment, useStore } from "../lib/store";
import { rupees } from "../lib/format";
import { Button, Chip, Page, TopBar } from "../components/ui";

const percentages = [5, 10, 15, 20];

export function Payday() {
  const navigate = useNavigate();
  const { profile, stashes, freezes, splitPayday, dismissPayday, spendFreeze, showToast } = useStore();
  const moment = incomeMoment[profile.vibe];
  const income = moment.amount;
  const active = stashes.filter((stash) => !stash.plan.paused);
  // salaried users get their usual plan; irregular income gets a % of this specific payment
  const fixedPlan = profile.rhythm === "monthly";
  const planTotal = active.reduce((sum, stash) => sum + stash.plan.amount, 0) || 1;
  const [percentage, setPercentage] = useState(10);
  const [taxFirst, setTaxFirst] = useState(profile.vibe === "freelancer");
  const taxSlice = !fixedPlan && taxFirst ? Math.round((income * 0.1) / 100) * 100 : 0;
  const spread = (total: number) => Object.fromEntries(active.map((stash) => [stash.id, Math.round((total * stash.plan.amount) / planTotal / 100) * 100]));
  const [allocations, setAllocations] = useState<Record<string, number>>(() =>
    fixedPlan ? Object.fromEntries(active.map((stash) => [stash.id, stash.plan.amount])) : spread((income * 10) / 100),
  );
  const total = Object.values(allocations).reduce((sum, value) => sum + value, 0);
  const share = income ? total / income : 0;
  const nudge = (stashId: string, delta: number) => setAllocations((current) => ({ ...current, [stashId]: Math.max(0, (current[stashId] ?? 0) + delta) }));
  const step = income >= 20000 ? 500 : 100;

  return (
    <Page className="min-h-full flex flex-col">
      <TopBar title={fixedPlan ? "Payday split" : "Money just landed"} />
      <div className="flex-1 px-5" data-testid="payday">
        <div className="rounded-[28px] bg-[#0b2a20] text-white p-5">
          <div className="text-[14px] text-white/70">{moment.source} · just landed</div>
          <div className="num text-[36px] font-extrabold tracking-tight">{rupees(income)}</div>
          <div className="mt-4 flex h-3 rounded-full overflow-hidden bg-white/10">
            <div className="bg-white/30" style={{ width: `${Math.max(0, 100 - share * 100)}%` }} />
            <div className="bg-mint" style={{ width: `${Math.min(100, share * 100)}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-[12px] text-white/75">
            <span>Left for rent, bills & fun · {rupees(income - total - taxSlice)}</span>
            <span className="text-mint font-semibold">Future-you · {Math.round(share * 100)}%</span>
          </div>
        </div>

        <h1 className="mt-6 text-[22px] font-extrabold tracking-tight">Pay future-you first</h1>
        <p className="mt-1 text-[14px] text-ink-2 leading-relaxed">
          {fixedPlan
            ? "Moving it now, before the month happens, is the habit that works best. These are your usual amounts — change anything."
            : "No fixed amount, ever. Pick a slice of this payment and we'll spread it across your stashes."}
        </p>

        {!fixedPlan && (
          <>
            <label className="mt-4 flex items-center gap-3 rounded-2xl border border-line p-3.5">
              <input type="checkbox" checked={taxFirst} onChange={(event) => setTaxFirst(event.target.checked)} className="h-5 w-5 accent-[#00D09C]" />
              <span className="text-[14px] leading-snug">
                <b>Set aside tax first</b> · {rupees(Math.round((income * 0.1) / 100) * 100)} (10%) for advance tax/GST stays in your bank
              </span>
            </label>
            <p className="mt-2 text-[13px] text-ink-2">
              Lean-month plan: {rupees(profile.monthly)} · this payment covers {Math.min(100, Math.round((total / Math.max(1, profile.monthly)) * 100))}% of it. No separate auto-debit — nothing moves until you tap.
            </p>
          </>
        )}
        {!fixedPlan && (
          <div className="mt-4 flex gap-2" role="group" aria-label="Share of this payment">
            {percentages.map((value) => (
              <Chip
                key={value}
                active={percentage === value}
                onClick={() => {
                  setPercentage(value);
                  setAllocations(spread((income * value) / 100));
                }}
              >
                {value}%
              </Chip>
            ))}
          </div>
        )}

        <ul className="mt-4 space-y-2.5">
          {active.map((stash) => (
            <li key={stash.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3">
              <span className="h-11 w-11 rounded-xl grid place-items-center text-[22px]" style={{ background: `${stash.color}22` }}>
                {stash.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-semibold truncate">{stash.name}</div>
                <div className="num text-[15px] font-bold">{rupees(allocations[stash.id] ?? 0)}</div>
              </div>
              <button aria-label={`Less for ${stash.name}`} onClick={() => nudge(stash.id, -step)} className="h-11 w-11 grid place-items-center rounded-full bg-surface-2">
                <Minus size={18} />
              </button>
              <button aria-label={`More for ${stash.name}`} onClick={() => nudge(stash.id, step)} className="h-11 w-11 grid place-items-center rounded-full bg-surface-2">
                <Plus size={18} />
              </button>
            </li>
          ))}
        </ul>
        {share > 0.4 && <p className="mt-3 rounded-2xl bg-amber-soft p-3 text-[13px]">That's over 40% of this payment. Make sure rent and food are covered first.</p>}
      </div>

      <div className="sticky bottom-0 bg-bg px-5 pt-4 pb-6">
        <div className="grid grid-cols-[1fr_1.6fr] gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              dismissPayday();
              navigate("/", { replace: true });
            }}
          >
            Not now
          </Button>
          <Button
            disabled={total < 100}
            data-testid="confirm-split"
            onClick={() => {
              splitPayday(allocations);
              showToast(`${rupees(total)} invested across ${Object.values(allocations).filter(Boolean).length} stashes. Streak +1 🔥`);
              navigate("/", { replace: true });
            }}
          >
            Invest {rupees(total)}
          </Button>
        </div>
        <button
          disabled={freezes === 0}
          className="mt-2 w-full min-h-11 inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold text-ink-2 disabled:opacity-40"
          onClick={() => {
            spendFreeze();
            showToast("Tight month? Happens. Streak frozen ❄️ — see you next time.");
            navigate("/", { replace: true });
          }}
        >
          <Snowflake size={16} /> Tight month? Freeze my streak ({freezes} left)
        </button>
      </div>
    </Page>
  );
}
