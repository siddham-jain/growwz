import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { useStore, starterPlan, type Profile, type Rhythm, type StarterStash, type Vibe } from "../lib/store";
import { templates, templateById } from "../data/templates";
import { bucketMeta } from "../data/funds";
import { futureValue, monthsToTarget, type Risk } from "../lib/plan";
import { addMonths, compactRupees, monthYear, ordinal, rupees } from "../lib/format";
import { Button, Chip, GrowwLogo } from "../components/ui";

const vibes: { id: Vibe; emoji: string; label: string; hint: string; rhythm: Rhythm; monthly: number }[] = [
  { id: "student", emoji: "🎓", label: "Student", hint: "Pocket money, maybe a side gig", rhythm: "allowance", monthly: 500 },
  { id: "intern", emoji: "🧑‍💻", label: "Intern / stipend", hint: "Money in, for now", rhythm: "monthly", monthly: 1500 },
  { id: "firstjob", emoji: "💼", label: "First job", hint: "Salary's new, so are the bills", rhythm: "monthly", monthly: 3000 },
  { id: "freelancer", emoji: "🎨", label: "Freelancer / creator", hint: "Great months, quiet months", rhythm: "irregular", monthly: 2000 },
];

const idleOptions = [
  { label: "Nope", amount: 0 },
  { label: "Under ₹10k", amount: 5000 },
  { label: "₹10k–50k", amount: 20000 },
  { label: "₹50k+", amount: 50000 },
];

const rhythms: { id: Rhythm; label: string; hint: string }[] = [
  { id: "monthly", label: "Same date every month", hint: "Salary or stipend" },
  { id: "irregular", label: "Whenever a client pays", hint: "Gigs, freelance, creator income" },
  { id: "allowance", label: "From home, now and then", hint: "Pocket money" },
];

const risks: { id: Risk; emoji: string; label: string }[] = [
  { id: "cautious", emoji: "😬", label: "Pull it out. Not for me." },
  { id: "steady", emoji: "🧘", label: "Wait it out." },
  { id: "bold", emoji: "🛒", label: "Add more — it's on sale." },
];

const relatable = (amount: number) =>
  amount <= 300 ? "about one Swiggy order" : amount <= 800 ? "about a movie night" : amount <= 2000 ? "about a month of OTT + a few coffees" : amount <= 5000 ? "about one weekend out" : "a solid chunk of future-you";

const steps = ["intro", "name", "vibe", "rhythm", "goals", "risk", "amount", "plan"] as const;
type Step = (typeof steps)[number];

export function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding, loadDemo, setName } = useStore();
  const storedName = useStore((state) => state.profile.name);
  const [step, setStep] = useState<Step>("intro");
  const [profile, setProfile] = useState<Profile>({ name: storedName, vibe: "firstjob", rhythm: "monthly", payday: 7, risk: "steady", monthly: 1500, idle: 0 });
  const [vibeChosen, setVibeChosen] = useState(false);
  const [goals, setGoals] = useState<string[]>([]);
  const index = steps.indexOf(step);
  const next = () => setStep(steps[Math.min(steps.length - 1, index + 1)]);
  const back = () => setStep(steps[Math.max(0, index - 1)]);
  const update = (patch: Partial<Profile>) => setProfile((current) => ({ ...current, ...patch }));

  const chosenGoals = useMemo(() => {
    // emergency comes first for anyone with a paycheck; it's the safety net under everything else
    const needsCushion = profile.vibe !== "student" && !goals.includes("emergency");
    return needsCushion ? ["emergency", ...goals] : goals;
  }, [goals, profile.vibe]);

  const { stashes: planPreview, spare } = starterPlan(profile, chosenGoals);
  const cushion = planPreview.find((stash) => stash.templateId === "emergency");

  const finish = () => {
    completeOnboarding(profile, chosenGoals);
    navigate("/", { replace: true });
  };

  if (step === "intro") {
    return (
      <div className="min-h-full flex flex-col bg-[#0b2a20] text-white relative overflow-hidden" data-testid="welcome">
        <motion.div
          className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-mint/40 blur-3xl"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div className="absolute top-60 -left-28 h-72 w-72 rounded-full bg-[#5367FF]/40 blur-3xl" animate={{ scale: [1.1, 1, 1.1] }} transition={{ duration: 7, repeat: Infinity }} />
        <div className="relative flex-1 flex flex-col px-7 pt-16">
          <div className="flex items-center gap-2.5">
            <GrowwLogo size={34} />
            <span className="text-[22px] font-bold tracking-tight">Groww</span>
          </div>
          <div className="mt-auto mb-8">
            <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[44px] leading-[1.02] font-extrabold tracking-tight">
              Your money,
              <br />
              <span className="text-mint">finally doing</span>
              <br />
              something.
            </motion.h1>
            <motion.p initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="mt-5 text-[17px] leading-relaxed text-white/75">
              Start with ₹100. Save for things you actually want. No jargon, no pressure, no lectures.
            </motion.p>
          </div>
        </div>
        <div className="relative px-6 pb-10 space-y-3">
          <Button className="w-full" onClick={next}>
            Set me up · 60 sec <ArrowRight size={18} />
          </Button>
          <button onClick={() => { loadDemo(); navigate("/", { replace: true }); }} className="w-full h-12 text-[15px] font-semibold text-white/80 hover:text-white">
            Skip to a demo account
          </button>
        </div>
      </div>
    );
  }

  const canContinue =
    (step === "name" && profile.name.trim().length > 0) || (step === "vibe" && vibeChosen) || step === "rhythm" || (step === "goals" && goals.length > 0) || step === "risk" || step === "amount";

  return (
    <div className="min-h-full flex flex-col bg-bg" data-testid={`onboarding-${step}`}>
      <div className="flex items-center gap-3 px-3 pt-3">
        <button aria-label="Back" onClick={back} className="h-11 w-11 grid place-items-center rounded-full hover:bg-surface-2">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 h-1.5 rounded-full bg-surface-3 overflow-hidden mr-4">
          <motion.div className="h-full bg-mint rounded-full" animate={{ width: `${(index / (steps.length - 1)) * 100}%` }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
          className="flex-1 px-6 pt-6"
        >
          {step === "name" && (
            <>
              <Question title="First up, what should we call you?" />
              <input
                autoFocus
                aria-label="Your name"
                placeholder="Your first name"
                value={profile.name}
                onChange={(event) => {
                  update({ name: event.target.value });
                  setName(event.target.value);
                }}
                onKeyDown={(event) => event.key === "Enter" && profile.name.trim() && next()}
                className="mt-6 w-full border-b-2 border-line focus:border-mint bg-transparent text-[28px] font-bold py-2 outline-none placeholder:text-ink-3"
              />
            </>
          )}

          {step === "vibe" && (
            <>
              <Question title={`Nice to meet you, ${profile.name.trim()}. What's life looking like?`} sub="This changes how we suggest things — not what you're allowed to do." />
              <div className="mt-6 space-y-3">
                {vibes.map((vibe) => (
                  <OptionCard
                    key={vibe.id}
                    active={vibeChosen && profile.vibe === vibe.id}
                    onClick={() => {
                      setVibeChosen(true);
                      update({ vibe: vibe.id, rhythm: vibe.rhythm, monthly: vibe.monthly });
                    }}
                  >
                    <span className="text-[28px]">{vibe.emoji}</span>
                    <span>
                      <span className="block text-[16px] font-semibold">{vibe.label}</span>
                      <span className="block text-[14px] text-ink-2">{vibe.hint}</span>
                    </span>
                  </OptionCard>
                ))}
              </div>
            </>
          )}

          {step === "rhythm" && (
            <>
              <Question title="How does money usually hit your account?" sub="Irregular is totally fine. We'll plan around it." />
              <div className="mt-6 space-y-3">
                {rhythms.map((rhythm) => (
                  <OptionCard key={rhythm.id} active={profile.rhythm === rhythm.id} onClick={() => update({ rhythm: rhythm.id })}>
                    <span>
                      <span className="block text-[16px] font-semibold">{rhythm.label}</span>
                      <span className="block text-[14px] text-ink-2">{rhythm.hint}</span>
                    </span>
                  </OptionCard>
                ))}
              </div>
              {profile.rhythm !== "monthly" && (
                <p className="mt-5 rounded-2xl bg-surface-2 p-3.5 text-[13px] leading-relaxed text-ink-2">
                  🔒 Want a heads-up when money lands? Link your bank via Account Aggregator later — we only see incoming amounts, and you can switch it off any time. Nothing is ever auto-debited without your tap.
                </p>
              )}
              {profile.rhythm === "monthly" && (
                <div className="mt-6">
                  <div className="text-[14px] font-semibold text-ink-2">Usually lands on the…</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[1, 5, 7, 10, 25, 30].map((day) => (
                      <Chip key={day} active={profile.payday === day} onClick={() => update({ payday: day })}>
                        {ordinal(day)}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {step === "goals" && (
            <>
              <Question title="What do you want money for?" sub="Pick any. Each one becomes a Stash — a pot with its own plan." />
              <div className="mt-6 grid grid-cols-2 gap-3">
                {templates.map((template) => {
                  const active = goals.includes(template.id);
                  return (
                    <motion.button
                      key={template.id}
                      whileTap={{ scale: 0.96 }}
                      aria-pressed={active}
                      onClick={() => setGoals((current) => (active ? current.filter((goal) => goal !== template.id) : [...current, template.id]))}
                      className={`text-left rounded-3xl border-2 p-4 min-h-[128px] transition ${active ? "border-mint bg-mint-soft" : "border-line bg-surface"}`}
                    >
                      <div className="text-[30px]">{template.emoji}</div>
                      <div className="mt-2 text-[15px] font-semibold leading-tight">{template.title}</div>
                      <div className="mt-1 text-[12px] text-ink-2 leading-snug">{template.hint}</div>
                    </motion.button>
                  );
                })}
              </div>
            </>
          )}

          {step === "risk" && (
            <>
              <Question title="Quick gut check." sub="You invest ₹1,000. A month later, the app shows ₹880. You…" />
              <div className="mt-6 rounded-3xl bg-surface-2 p-5 flex items-center justify-between">
                <div>
                  <div className="text-[13px] text-ink-2">Invested</div>
                  <div className="num text-[22px] font-bold">₹1,000</div>
                </div>
                <div className="text-[26px]">→</div>
                <div className="text-right">
                  <div className="text-[13px] text-ink-2">Now</div>
                  <div className="num text-[22px] font-bold text-neg">₹880</div>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {risks.map((risk) => (
                  <OptionCard key={risk.id} active={profile.risk === risk.id} onClick={() => update({ risk: risk.id })}>
                    <span className="text-[26px]">{risk.emoji}</span>
                    <span className="text-[16px] font-semibold">{risk.label}</span>
                  </OptionCard>
                ))}
              </div>
              <p className="mt-4 text-[13px] text-ink-2">No wrong answer. This only decides how bumpy your long-term stashes can be.</p>
            </>
          )}

          {step === "amount" && (
            <>
              <Question
                title={profile.rhythm === "irregular" ? "In a lean month, what could you put away?" : "What can you comfortably put away each month?"}
                sub={profile.rhythm === "irregular" ? "We plan on your lean months. In good months, you'll get a nudge to add more." : "Comfortable = you won't miss it. You can change this any time, or skip a month."}
              />
              <div className="mt-8 text-center">
                <div className="num text-[52px] font-extrabold tracking-tight">{rupees(profile.monthly)}</div>
                <div className="text-[15px] text-ink-2">≈ {relatable(profile.monthly)}</div>
              </div>
              <input
                type="range"
                aria-label="Monthly amount"
                min={100}
                max={10000}
                step={100}
                value={profile.monthly}
                onChange={(event) => update({ monthly: Number(event.target.value) })}
                className="mt-8 w-full accent-[#00D09C] h-2"
              />
              <div className="flex justify-between text-[12px] text-ink-2 mt-1">
                <span>₹100</span>
                <span>₹10,000</span>
              </div>
              <div className="mt-6 rounded-2xl bg-blue-soft p-4 text-[14px] leading-relaxed">
                💡 Illustration: {rupees(profile.monthly)}/month for 10 years, in a growth fund at an assumed {bucketMeta.growth.low}–{bucketMeta.growth.high}% a year, becomes roughly{" "}
                <b>
                  {compactRupees(futureValue(0, profile.monthly, 120, bucketMeta.growth.low))}–{compactRupees(futureValue(0, profile.monthly, 120, bucketMeta.growth.high))}
                </b>
                . You'd have put in {compactRupees(profile.monthly * 120)}. Not a promise — but time does the heavy lifting.
              </div>
              <div className="mt-6 text-[14px] font-semibold text-ink-2">Got savings sitting idle in your bank?</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {idleOptions.map((option) => (
                  <Chip key={option.label} active={profile.idle === option.amount} onClick={() => update({ idle: option.amount })}>
                    {option.label}
                  </Chip>
                ))}
              </div>
            </>
          )}

          {step === "plan" && (
            <div data-testid="starter-plan">
              <Question title={`${profile.name.trim()}, here's your starter plan.`} sub="Built from your answers. Every piece is editable." />
              <div className="mt-6 space-y-3">
                {planPreview.map((stash) => {
                  const template = templateById(stash.templateId);
                  const meta = bucketMeta[stash.bucket];
                  return (
                    <div key={stash.templateId} className="rounded-3xl border border-line bg-surface p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl grid place-items-center text-[24px]" style={{ background: `${template.color}22` }}>
                          {template.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[16px] font-semibold truncate">{stash.name}</div>
                          <div className="text-[13px] text-ink-2">
                            {compactRupees(stash.target)} by {monthYear(stash.deadline)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="num text-[16px] font-bold">{stash.plan.paused ? "—" : rupees(stash.plan.amount)}</div>
                          <div className="text-[12px] text-ink-2">{stash.plan.paused ? "later" : "/month"}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-[13px] text-ink-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: meta.dot }} />
                        {meta.label} · {meta.risk}
                        {stash.templateId === "emergency" && !goals.includes("emergency") && <span className="ml-auto rounded-full bg-amber-soft text-amber px-2 py-0.5 text-[11px] font-bold">ADDED FOR YOU</span>}
                      </div>
                      {stash.plan.paused ? (
                        <div className="mt-2 text-[12px] text-ink-2">Starts when you add a bit more each month.</div>
                      ) : (
                        stash.target < stash.fullTarget && (
                          <div className="mt-2 text-[12px] text-ink-2 leading-snug">
                            First milestone. Full {compactRupees(stash.fullTarget)}: {rupees(stash.fullMonthly)}/month, or around{" "}
                            {fullGoalYear(stash)} at this pace.
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex justify-between rounded-2xl bg-surface-2 px-4 py-3 text-[14px]">
                <span className="text-ink-2">Total {profile.rhythm === "irregular" ? "in a lean month" : "each month"}</span>
                <span className="num font-bold">
                  {rupees(planPreview.reduce((sum, stash) => sum + (stash.plan.paused ? 0 : stash.plan.amount), 0))}
                  {spare > 0 && <span className="font-medium text-ink-2"> · {rupees(spare)} spare</span>}
                </span>
              </div>
              {cushion && profile.idle > 0 && (
                <p className="mt-3 rounded-2xl bg-mint-soft p-3.5 text-[13px] leading-relaxed">
                  💡 You have idle savings. Moving {rupees(Math.min(profile.idle, cushion.fullTarget))} into your Emergency cushion once usually earns more than a savings account — and you can still withdraw by tomorrow.
                </p>
              )}
              {profile.risk === "bold" && (
                <p className="mt-3 rounded-2xl bg-amber-soft p-3.5 text-[13px] leading-relaxed">
                  🌶️ Like a bit of action? Add a capped Spice pot for single stocks from Invest — so a bad bet can't touch these goals.
                </p>
              )}
              {chosenGoals[0] === "emergency" && !goals.includes("emergency") && (
                <p className="mt-4 text-[13px] text-ink-2 leading-relaxed">
                  We added an emergency cushion because it stops you from selling investments when life happens. Remove it later if you already have one.
                </p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="px-6 pb-8 pt-4">
        {step === "plan" ? (
          <Button className="w-full" onClick={finish}>
            Looks good, let's go
          </Button>
        ) : (
          <Button className="w-full" disabled={!canContinue} onClick={next}>
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}

function fullGoalYear(stash: StarterStash): string {
  const months = monthsToTarget(stash.fullTarget, 0, stash.plan.amount, stash.bucket);
  return months === null ? "not reachable" : String(addMonths(new Date(), months).getFullYear());
}

function Question({ title, sub }: { title: string; sub?: string }) {
  return (
    <div>
      <h1 className="text-[28px] leading-[1.15] font-extrabold tracking-tight">{title}</h1>
      {sub && <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{sub}</p>}
    </div>
  );
}

function OptionCard({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      aria-pressed={active}
      onClick={onClick}
      className={`w-full flex items-center gap-4 text-left rounded-2xl border-2 px-4 py-3.5 min-h-[64px] transition ${active ? "border-mint bg-mint-soft" : "border-line bg-surface"}`}
    >
      {children}
    </motion.button>
  );
}
