import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Pause, Play, SkipForward, SlidersHorizontal, TrendingUp, Trash2 } from "lucide-react";
import { useStore, monthsLeft, monthlyEquivalent, stashValue, type Stash } from "../lib/store";
import { bucketMeta, fundById } from "../data/funds";
import { monthsToTarget, project, recommendBucket } from "../lib/plan";
import { addMonths, compactRupees, monthYear, ordinal, rupees, shortDate, signedRupees } from "../lib/format";
import { AddMoneySheet } from "../components/AddMoneySheet";
import { FanChart } from "../components/FanChart";
import { Button, Page, ProgressRing, RiskDots, SectionTitle, Sheet, Term, Toggle, TopBar } from "../components/ui";

export function StashDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { stashes, txns, dip, profile, updatePlan, deleteStash, showToast } = useStore();
  const stash = stashes.find((item) => item.id === id);
  const [adding, setAdding] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [editing, setEditing] = useState(false);
  if (!stash) return <Navigate to="/" replace />;

  const value = stashValue(stash, dip);
  const gain = value - stash.invested;
  const fund = fundById(stash.fundId);
  const meta = bucketMeta[stash.bucket];
  const months = Math.max(1, monthsLeft(stash));
  const monthly = monthlyEquivalent(stash.plan);
  const projection = project(value, monthly, months, stash.bucket, stash.plan.stepUp);
  const eta = monthsToTarget(stash.target, value, monthly, stash.bucket, stash.plan.stepUp);
  const reason = recommendBucket(months, profile.risk, stash.templateId === "emergency").reason;
  const history = txns.filter((txn) => txn.stashId === stash.id).slice(0, 6);
  const nextDate = stash.plan.mode === "weekly" ? "every Monday" : `on the ${ordinal(profile.payday)}`;
  const confirmOnly = stash.plan.mode === "payday" && profile.rhythm !== "monthly";

  return (
    <Page className="pb-28">
      <div style={{ background: `linear-gradient(180deg, ${stash.color}2e, transparent)` }}>
        <TopBar
          transparent
          title=""
          right={
            <button
              aria-label="Delete stash"
              className="h-11 w-11 grid place-items-center rounded-full hover:bg-surface-2 text-ink-2"
              onClick={() => {
                if (stash.invested > 0) {
                  showToast("Withdraw the money first, then you can delete this stash.");
                  return;
                }
                deleteStash(stash.id);
                navigate("/");
              }}
            >
              <Trash2 size={20} />
            </button>
          }
        />
        <div className="px-5 pb-6 flex items-center gap-5">
          <ProgressRing value={value / stash.target} size={124} stroke={12} color={stash.color}>
            <div>
              <div className="text-[32px] leading-none">{stash.emoji}</div>
              <div className="mt-1 text-[13px] font-bold">{Math.round((value / stash.target) * 100)}%</div>
            </div>
          </ProgressRing>
          <div className="min-w-0">
            <h1 className="text-[22px] font-extrabold leading-tight tracking-tight">{stash.name}</h1>
            <div className="num mt-1 text-[30px] font-extrabold tracking-tight">{rupees(value)}</div>
            <div className="text-[13px] text-ink-2">
              of {rupees(stash.target)} · <span className={gain >= 0 ? "text-pos font-semibold" : "text-neg font-semibold"}>{signedRupees(gain)}</span> grown
            </div>
          </div>
        </div>
      </div>

      <div className="mx-5 rounded-3xl border border-line bg-surface p-4">
        <h2 className="text-[16px] font-bold">Where this could be by {monthYear(stash.deadline)}</h2>
        <div className="num mt-1 text-[26px] font-extrabold" data-testid="projection-range">
          {compactRupees(projection.low)} – {compactRupees(projection.high)}
        </div>
        <div className="text-[13px] text-ink-2">Illustration at an assumed {meta.low}–{meta.high}% a year</div>
        <div className="mt-2">
          <FanChart projection={projection} target={stash.target} color={stash.color} />
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          <Scenario label="Weak years" value={projection.low} />
          <Scenario label="Typical" value={projection.typical} />
          <Scenario label="Strong years" value={projection.high} />
        </div>
        <p className="mt-3 text-[13px] text-ink-2 leading-relaxed">
          {eta === null
            ? "At this pace you won't reach the goal. Try a bigger amount or a later date."
            : eta <= months
              ? `In a typical market, ${compactRupees(stash.target)} arrives around ${addMonths(new Date(), eta).getFullYear()}.`
              : `In a typical market, ${compactRupees(stash.target)} arrives around ${addMonths(new Date(), eta).getFullYear()} — add a little more to land on time.`}{" "}
          Assumed ranges for {meta.label.toLowerCase()} funds, not any one scheme. Past performance may or may not be sustained.
        </p>
      </div>

      <SectionTitle>Your plan</SectionTitle>
      <div className="mx-5 rounded-3xl border border-line bg-surface">
        <div className="p-4 flex items-center gap-3">
          <div className="flex-1">
            <div className="num text-[22px] font-extrabold">
              {rupees(stash.plan.amount)}
              <span className="text-[14px] font-semibold text-ink-2"> /{stash.plan.mode === "weekly" ? "week" : "month"}</span>
            </div>
            <div className="text-[13px] text-ink-2">
              {stash.plan.paused ? "Paused — nothing will be deducted" : stash.plan.skipNext ? "Skipping the next one, then back to normal" : confirmOnly ? "Invests only when you confirm a payment — no auto-debit" : `Auto-invests ${nextDate} via UPI AutoPay`}
            </div>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)} aria-label="Change amount">
            <SlidersHorizontal size={16} /> Edit
          </Button>
        </div>
        <div className="grid grid-cols-2 border-t border-line">
          <button
            className="flex items-center justify-center gap-2 h-14 text-[14px] font-semibold border-r border-line hover:bg-surface-2 disabled:opacity-40"
            disabled={stash.plan.paused}
            onClick={() => {
              updatePlan(stash.id, { skipNext: !stash.plan.skipNext });
              showToast(stash.plan.skipNext ? "Back on — next one goes through." : "Next one skipped. Your streak is safe.");
            }}
          >
            <SkipForward size={18} /> {stash.plan.skipNext ? "Undo skip" : "Skip next"}
          </button>
          <button
            className="flex items-center justify-center gap-2 h-14 text-[14px] font-semibold hover:bg-surface-2"
            onClick={() => {
              updatePlan(stash.id, { paused: !stash.plan.paused, skipNext: false });
              showToast(stash.plan.paused ? "Resumed. Welcome back 🙌" : "Paused. Resume whenever — no fees, no penalty.");
            }}
          >
            {stash.plan.paused ? <Play size={18} /> : <Pause size={18} />} {stash.plan.paused ? "Resume" : "Pause"}
          </button>
        </div>
        {stash.bucket !== "steady" && (
          <div className="flex items-center gap-3 border-t border-line p-4">
            <TrendingUp size={20} className="text-pos shrink-0" />
            <div className="flex-1">
              <div className="text-[15px] font-semibold">
                <Term id="stepup">Step-up</Term> 10% every year
              </div>
              <div className="text-[13px] text-ink-2">
                {stash.plan.stepUp > 0
                  ? `From ${monthYear(addMonths(new Date(), 12).toISOString())}: ${rupees(stash.plan.amount * 1.1)}. We ask before every increase.`
                  : "Off. Turn on if your income grows — we'll always ask before raising it."}
              </div>
            </div>
            <Toggle
              label="Step-up 10% every year"
              checked={stash.plan.stepUp > 0}
              onChange={(on) => {
                updatePlan(stash.id, { stepUp: on ? 10 : 0 });
                if (on) showToast(`Step-up on. We'll check with you before it becomes ${rupees(stash.plan.amount * 1.1)}.`);
              }}
            />
          </div>
        )}
      </div>

      <SectionTitle>Where your money sits</SectionTitle>
      <div className="mx-5 rounded-3xl border border-line bg-surface p-4" data-testid="fund-card">
        <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-ink-2">
          <span className="h-2 w-2 rounded-full" style={{ background: meta.dot }} /> {meta.label}
        </div>
        <div className="mt-1 text-[18px] font-bold">{fund.plainName}</div>
        <div className="text-[13px] text-ink-2">{fund.name}</div>
        <p className="mt-2 text-[14px] leading-relaxed">{fund.oneLiner}</p>
        <div className="mt-3 rounded-2xl bg-surface-2 p-3.5">
          <div className="text-[12px] font-bold text-ink-2">WHY THIS ONE FOR YOU</div>
          <p className="mt-1 text-[14px] leading-relaxed">{reason}</p>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-y-3 gap-x-4 text-[14px]">
          <div>
            <dt className="text-ink-2 text-[12px]">Riskometer</dt>
            <dd className="mt-1 flex items-center gap-2">
              <RiskDots level={fund.riskLevel} />
              <span className="font-semibold">{fund.riskometer}</span>
            </dd>
          </div>
          <div>
            <dt className="text-ink-2 text-[12px]">
              <Term id="expense-ratio">Expense ratio</Term>
            </dt>
            <dd className="font-semibold">
              {fund.expenseRatio}% · ₹{Math.round(value * fund.expenseRatio / 100)}/yr for you
            </dd>
          </div>
          <div>
            <dt className="text-ink-2 text-[12px]">
              <Term id="exit-load">Exit load</Term>
            </dt>
            <dd className="font-semibold">{fund.exitLoad}</dd>
          </div>
          <div>
            <dt className="text-ink-2 text-[12px]">
              <Term id="direct">Direct plan</Term>
            </dt>
            <dd className="font-semibold">Yes, lowest fee</dd>
          </div>
        </dl>
      </div>

      {history.length > 0 && (
        <>
          <SectionTitle>Activity</SectionTitle>
          <ul className="mx-5 rounded-3xl border border-line bg-surface divide-y divide-line">
            {history.map((txn) => (
              <li key={txn.id} className="flex items-center justify-between px-4 py-3.5">
                <div>
                  <div className="text-[15px] font-semibold">{txn.note}</div>
                  <div className="text-[12px] text-ink-2">{shortDate(txn.date)}</div>
                </div>
                <div className={`num text-[15px] font-bold ${txn.kind === "in" ? "text-pos" : "text-ink"}`}>
                  {txn.kind === "in" ? "+" : "−"}
                  {rupees(txn.amount)}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="sticky bottom-0 mt-6 px-5 pt-3 pb-5 bg-gradient-to-t from-bg via-bg to-transparent flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={() => setWithdrawing(true)} disabled={value <= 0}>
          Withdraw
        </Button>
        <Button className="flex-[1.6]" onClick={() => setAdding(true)} data-testid="add-money">
          Add money
        </Button>
      </div>

      <AddMoneySheet stash={stash} open={adding} onClose={() => setAdding(false)} />
      <EditPlanSheet stash={stash} open={editing} onClose={() => setEditing(false)} />
      <WithdrawSheet stash={stash} value={value} open={withdrawing} onClose={() => setWithdrawing(false)} />
    </Page>
  );
}

function Scenario({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl p-2.5 bg-surface-2">
      <div className="text-[11px] text-ink-2">{label}</div>
      <div className="num text-[14px] font-semibold">{compactRupees(value)}</div>
    </div>
  );
}

function EditPlanSheet({ stash, open, onClose }: { stash: Stash; open: boolean; onClose: () => void }) {
  const updatePlan = useStore((state) => state.updatePlan);
  const rhythm = useStore((state) => state.profile.rhythm);
  const [amount, setAmount] = useState(stash.plan.amount);
  const [mode, setMode] = useState(stash.plan.mode);
  return (
    <Sheet open={open} onClose={onClose} title="Change your plan">
      <div className="num text-center text-[44px] font-extrabold mt-2">{rupees(amount)}</div>
      <input type="range" aria-label="Amount" min={100} max={20000} step={100} value={amount} onChange={(event) => setAmount(Number(event.target.value))} className="w-full accent-[#00D09C]" />
      <div className="mt-5 grid grid-cols-3 gap-2">
        {(["payday", "monthly", "weekly"] as const).map((option) => (
          <button
            key={option}
            aria-pressed={mode === option}
            onClick={() => setMode(option)}
            className={`min-h-12 rounded-xl border-2 text-[14px] font-semibold ${mode === option ? "border-mint bg-mint-soft" : "border-line"}`}
          >
            {option === "payday" ? (rhythm === "monthly" ? "On payday" : "When money lands") : option === "monthly" ? "Monthly" : "Weekly"}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[13px] text-ink-2">Weekly works well if your income is irregular — smaller amounts, more often.</p>
      <Button
        className="mt-6 w-full"
        onClick={() => {
          updatePlan(stash.id, { amount, mode });
          onClose();
        }}
      >
        Save
      </Button>
    </Sheet>
  );
}

function WithdrawSheet({ stash, value, open, onClose }: { stash: Stash; value: number; open: boolean; onClose: () => void }) {
  const { dip, withdraw, showToast } = useStore();
  const intercept = dip && stash.bucket !== "steady";
  const [stage, setStage] = useState<"check" | "amount">(intercept ? "check" : "amount");
  const [amount, setAmount] = useState(Math.floor(value));
  useEffect(() => {
    if (open) {
      setStage(intercept ? "check" : "amount");
      setAmount(Math.floor(value));
    }
  }, [open, intercept, value]);
  const close = onClose;
  return (
    <Sheet open={open} onClose={close} title={stage === "check" ? "Quick pause before you sell" : "Withdraw to bank"}>
      {stage === "check" ? (
        <div data-testid="panic-check">
          <p className="text-[15px] leading-relaxed">
            Markets are down this week, so this stash is about <b className="text-neg">{rupees(Math.abs(stashValue(stash, true) - stashValue(stash, false)))}</b> below last week. Selling now locks in today's price.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
            Markets have often recovered from falls like this, but it isn't guaranteed. This stash has {Math.round(monthsLeft(stash) / 12)} years to go. Need the cash? Totally valid — you can also take out just part of it.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <Button variant="secondary" onClick={() => setStage("amount")}>
              Withdraw
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                showToast("Nothing changed. Your auto-invest keeps buying at today's lower prices.");
                close();
              }}
            >
              Keep it invested
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <label htmlFor="withdraw" className="text-[13px] font-semibold text-ink-2">
            Amount (up to {rupees(value)})
          </label>
          <div className="mt-1 flex items-center border-b-2 border-mint pb-1">
            <span className="text-[36px] font-bold text-ink-3">₹</span>
            <input
              id="withdraw"
              inputMode="numeric"
              value={amount ? amount.toLocaleString("en-IN") : ""}
              onChange={(event) => setAmount(Math.min(Math.floor(value), Number(event.target.value.replace(/\D/g, "")) || 0))}
              className="num w-full bg-transparent text-[40px] font-bold outline-none"
            />
          </div>
          <p className="mt-3 text-[13px] text-ink-2">
            {stash.bucket === "steady" ? "Usually reaches your bank by tomorrow." : "Usually reaches your bank in 2–3 working days."} {fundById(stash.fundId).exitLoad}.
          </p>
          <Button
            className="mt-6 w-full"
            variant="dark"
            disabled={amount <= 0}
            onClick={() => {
              withdraw(stash.id, amount);
              showToast(`${rupees(amount)} is on its way to your bank.`);
              close();
            }}
          >
            Withdraw {rupees(amount)}
          </Button>
        </div>
      )}
    </Sheet>
  );
}
