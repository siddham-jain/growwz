import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStore, monthlyEquivalent, type PlanMode } from "../lib/store";
import { templates, templateById } from "../data/templates";
import { bucketMeta, fundById, bucketFund } from "../data/funds";
import { monthsToTarget, recommendBucket, requiredMonthly, roundUpTo } from "../lib/plan";
import { addMonths, compactRupees, monthYear, rupees } from "../lib/format";
import { Button, Chip, Page, RiskDots, TopBar } from "../components/ui";

const horizons = [
  { label: "6 months", months: 6 },
  { label: "1 year", months: 12 },
  { label: "2 years", months: 24 },
  { label: "3 years", months: 36 },
  { label: "5 years", months: 60 },
  { label: "10 years", months: 120 },
];

type Step = "template" | "target" | "when" | "plan";

export function NewStash() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { profile, stashes, addStash, showToast } = useStore();
  const committed = stashes.reduce((sum, stash) => sum + monthlyEquivalent(stash.plan), 0);
  const initial = params.get("template");
  const [step, setStep] = useState<Step>(initial ? "target" : "template");
  const [templateId, setTemplateId] = useState(initial ?? "trip");
  const template = templateById(templateId);
  const [name, setName] = useState(template.defaultName);
  const [target, setTarget] = useState(template.defaultTarget);
  const [months, setMonths] = useState(template.defaultMonths);
  const recommendation = recommendBucket(months, profile.risk, templateId === "emergency");
  const meta = bucketMeta[recommendation.bucket];
  const fund = fundById(bucketFund[recommendation.bucket]);
  const needed = Math.max(100, roundUpTo(requiredMonthly(target, 0, months, meta.rate), 100));
  const [amount, setAmount] = useState<number | null>(null);
  const [mode, setMode] = useState<PlanMode>(profile.rhythm === "monthly" ? "payday" : "weekly");
  const monthly = amount ?? needed;
  const eta = monthsToTarget(target, 0, monthly, recommendation.bucket);

  const pickTemplate = (id: string) => {
    const picked = templateById(id);
    setTemplateId(id);
    setName(picked.defaultName);
    setTarget(picked.defaultTarget);
    setMonths(picked.defaultMonths);
    setAmount(null);
    setStep("target");
  };

  const back = () => {
    if (step === "template" || (step === "target" && initial)) navigate(-1);
    else setStep(step === "plan" ? "when" : step === "when" ? "target" : "template");
  };

  const create = () => {
    const planAmount = mode === "weekly" ? roundUpTo(monthly / 4.33, 50) : monthly;
    const stashId = addStash({
      templateId,
      name: name.trim() || template.defaultName,
      target,
      deadline: addMonths(new Date(), months).toISOString(),
      bucket: recommendation.bucket,
      plan: { mode, amount: planAmount, paused: false, skipNext: false, stepUp: 0 },
    });
    showToast(`${template.emoji} ${name} is live. First auto-invest is on its way.`);
    navigate(`/stash/${stashId}`, { replace: true });
  };

  return (
    <Page className="min-h-full flex flex-col">
      <TopBar title="New stash" onBack={back} />
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.18 }} className="flex-1 px-5 pb-6">
          {step === "template" && (
            <>
              <h1 className="text-[26px] font-extrabold tracking-tight leading-tight">What are you saving for?</h1>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {templates.map((item) => (
                  <motion.button key={item.id} whileTap={{ scale: 0.96 }} onClick={() => pickTemplate(item.id)} className="text-left rounded-3xl border border-line bg-surface p-4 min-h-[128px] hover:border-mint">
                    <div className="text-[30px]">{item.emoji}</div>
                    <div className="mt-2 text-[15px] font-semibold">{item.title}</div>
                    <div className="mt-1 text-[12px] text-ink-2 leading-snug">{item.hint}</div>
                  </motion.button>
                ))}
              </div>
            </>
          )}

          {step === "target" && (
            <>
              <div className="text-[40px]">{template.emoji}</div>
              <label className="block mt-2 text-[13px] font-semibold text-ink-2" htmlFor="stash-name">
                Name it
              </label>
              <input id="stash-name" value={name} onChange={(event) => setName(event.target.value)} className="w-full bg-transparent text-[26px] font-extrabold tracking-tight outline-none border-b-2 border-line focus:border-mint py-1" />
              <div className="mt-6 text-[13px] font-semibold text-ink-2">How much do you need?</div>
              <div className="num mt-1 text-[40px] font-extrabold tracking-tight">{rupees(target)}</div>
              <div className="mt-3 space-y-2">
                {template.presets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setTarget(preset.amount)}
                    aria-pressed={target === preset.amount}
                    className={`w-full flex items-center justify-between rounded-2xl border-2 px-4 min-h-[56px] text-left ${target === preset.amount ? "border-mint bg-mint-soft" : "border-line"}`}
                  >
                    <span className="text-[15px] font-semibold">{preset.label}</span>
                    <span className="num text-[15px] text-ink-2">{compactRupees(preset.amount)}</span>
                  </button>
                ))}
              </div>
              <input type="range" aria-label="Target amount" min={5000} max={Math.max(500000, template.defaultTarget * 2)} step={1000} value={target} onChange={(event) => setTarget(Number(event.target.value))} className="mt-5 w-full accent-[#00D09C]" />
            </>
          )}

          {step === "when" && (
            <>
              <h1 className="text-[26px] font-extrabold tracking-tight leading-tight">When do you need it?</h1>
              <p className="mt-2 text-[15px] text-ink-2 leading-relaxed">This decides where we invest it. Sooner = calmer funds. Later = more room to grow.</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {horizons.map((horizon) => (
                  <Chip key={horizon.months} active={months === horizon.months} onClick={() => setMonths(horizon.months)}>
                    {horizon.label}
                  </Chip>
                ))}
              </div>
              <div className="mt-6 rounded-3xl bg-surface-2 p-4">
                <div className="text-[13px] text-ink-2">Target date</div>
                <div className="text-[20px] font-bold">{monthYear(addMonths(new Date(), months).toISOString())}</div>
              </div>
            </>
          )}

          {step === "plan" && (
            <div data-testid="new-stash-plan">
              <h1 className="text-[26px] font-extrabold tracking-tight leading-tight">Here's how we'd do it</h1>
              <div className="mt-5 rounded-3xl border border-line bg-surface p-4">
                <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-ink-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: meta.dot }} /> {meta.label} · {meta.risk}
                </div>
                <div className="mt-1 text-[18px] font-bold">{fund.plainName}</div>
                <div className="text-[13px] text-ink-2">{fund.name}</div>
                <div className="mt-2">
                  <RiskDots level={fund.riskLevel} />
                </div>
                <p className="mt-3 text-[14px] leading-relaxed">{recommendation.reason}</p>
              </div>

              <div className="mt-5 text-[13px] font-semibold text-ink-2">Monthly amount</div>
              <div className="flex items-baseline justify-between">
                <div className="num text-[36px] font-extrabold tracking-tight">{rupees(monthly)}</div>
                {amount !== null && amount !== needed && (
                  <button className="text-[13px] font-semibold text-pos min-h-11" onClick={() => setAmount(null)}>
                    Reset to {rupees(needed)}
                  </button>
                )}
              </div>
              <input type="range" aria-label="Monthly amount" min={100} max={Math.max(needed * 2, 2000)} step={100} value={monthly} onChange={(event) => setAmount(Number(event.target.value))} className="w-full accent-[#00D09C]" />
              <p className="mt-2 text-[14px] leading-relaxed" data-testid="eta">
                {eta === null ? (
                  <span className="text-amber font-semibold">Too small to get there. Even ₹100 more helps.</span>
                ) : eta <= months ? (
                  <span>
                    <b className="text-pos">On time</b> in a typical market — around {addMonths(new Date(), eta).getFullYear()}. Not a promise.
                  </span>
                ) : (
                  <span>
                    <b className="text-amber">A bit later</b> — likely {monthYear(addMonths(new Date(), eta).toISOString())}. That's okay; starting matters more than the date.
                  </span>
                )}
              </p>
              {committed > 0 && (
                <p className={`mt-2 rounded-2xl p-3 text-[13px] leading-snug ${committed + monthly > profile.monthly * 1.2 ? "bg-amber-soft" : "bg-surface-2"}`} data-testid="commitment">
                  You already put away {rupees(committed)}/month. With this, it's {rupees(committed + monthly)} — {committed + monthly > profile.monthly * 1.2 ? `well above the ${rupees(profile.monthly)} you said is comfortable. Try a later date?` : "within what you said is comfortable."}
                </p>
              )}
              {committed === 0 && monthly > profile.monthly * 1.5 && (
                <p className="mt-2 rounded-2xl bg-amber-soft p-3 text-[13px] leading-snug">
                  Heads up: that's more than the {rupees(profile.monthly)}/month you said is comfortable. Try a later date instead?
                </p>
              )}

              <div className="mt-5 text-[13px] font-semibold text-ink-2">How should it go in?</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(["payday", "monthly", "weekly"] as const).map((option) => (
                  <button
                    key={option}
                    aria-pressed={mode === option}
                    onClick={() => setMode(option)}
                    className={`min-h-[60px] rounded-2xl border-2 px-2 text-[13px] font-semibold leading-tight ${mode === option ? "border-mint bg-mint-soft" : "border-line"}`}
                  >
                    {option === "payday" ? (profile.rhythm === "monthly" ? "💸 On payday" : "💸 When money lands") : option === "monthly" ? "📅 Fixed date" : `🗓 Weekly · ${rupees(roundUpTo(monthly / 4.33, 50))}`}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[12px] text-ink-2">Skip, pause or change any time. No fees, no penalties.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      {step !== "template" && (
        <div className="sticky bottom-0 px-5 pb-6 pt-3 bg-bg">
          {step === "plan" ? (
            <Button className="w-full" onClick={create} data-testid="create-stash">
              Start this stash
            </Button>
          ) : (
            <Button className="w-full" disabled={step === "target" && target <= 0} onClick={() => setStep(step === "target" ? "when" : "plan")}>
              Continue
            </Button>
          )}
        </div>
      )}
    </Page>
  );
}
