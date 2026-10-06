import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronRight, Eye, EyeOff, Flame, Plus, Snowflake } from "lucide-react";
import { useStore, monthlyEquivalent, monthsLeft, portfolio, stashValue, type Stash } from "../lib/store";
import { bytes } from "../data/bytes";
import { bucketMeta } from "../data/funds";
import { monthsToTarget } from "../lib/plan";
import { addMonths, monthYear, percent, rupees, signedRupees } from "../lib/format";
import { AddMoneySheet } from "../components/AddMoneySheet";
import { Button, Card, Page, ProgressBar, SectionTitle } from "../components/ui";

export function Home() {
  const navigate = useNavigate();
  const { profile, stashes, txns, dip, settings, paydayPending, streakWeeks, freezes, bytesDone, setSetting } = useStore();
  const [peek, setPeek] = useState(false);
  const [coachDismissed, setCoachDismissed] = useState(false);
  const [addTo, setAddTo] = useState<Stash | undefined>();
  const totals = portfolio(stashes, dip);
  const showDaily = !settings.calm || peek;
  const hasInvested = txns.length > 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Hey" : "Good evening";

  return (
    <Page className="pb-6">
      <header className="flex items-center justify-between px-5 pt-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-mint-soft grid place-items-center text-[18px] font-bold text-pos">{profile.name.slice(0, 1).toUpperCase()}</div>
          <div>
            <div className="text-[13px] text-ink-2">{greeting},</div>
            <div className="text-[19px] font-extrabold leading-tight">{profile.name} 👋</div>
          </div>
        </div>
        <button aria-label="Notifications" className="h-11 w-11 grid place-items-center rounded-full hover:bg-surface-2">
          <Bell size={22} />
        </button>
      </header>

      <div className="mt-4 flex gap-3.5 overflow-x-auto no-scrollbar px-5 pb-1" aria-label="Bytes: 60-second lessons">
        {bytes.map((byte) => {
          const seen = bytesDone.includes(byte.id);
          return (
            <button key={byte.id} onClick={() => navigate(`/learn/${byte.id}`)} className="shrink-0 w-[68px] flex flex-col items-center gap-1.5">
              <span className="p-[2.5px] rounded-full" style={{ background: seen ? "var(--line)" : `linear-gradient(135deg, #00D09C, #5367FF)` }}>
                <span className="h-[60px] w-[60px] rounded-full grid place-items-center text-[26px] border-[3px] border-bg" style={{ background: `linear-gradient(135deg, ${byte.gradient[0]}, ${byte.gradient[1]})` }}>
                  {byte.emoji}
                </span>
              </span>
              <span className="text-[11px] font-medium text-ink-2 truncate w-full text-center">{byte.short}</span>
            </button>
          );
        })}
      </div>

      {dip && !coachDismissed && <DipCoach onDismiss={() => setCoachDismissed(true)} />}

      <section className="mx-5 mt-5 rounded-[28px] bg-[#0b2a20] text-white p-5 relative overflow-hidden" data-testid="hero">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-mint/25 blur-2xl" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-white/70">Across {stashes.length} stash{stashes.length === 1 ? "" : "es"}</span>
            {settings.calm && (
              <button
                onClick={() => setPeek(!peek)}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 h-11 -my-1.5 text-[13px] font-semibold"
                aria-label={peek ? "Hide today's change" : "Peek at today's change"}
              >
                {peek ? <EyeOff size={14} /> : <Eye size={14} />} {peek ? "Hide today" : "Calm mode"}
              </button>
            )}
          </div>
          <div className="num mt-1 text-[40px] font-extrabold tracking-tight">{rupees(totals.value)}</div>
          {hasInvested ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px]">
              <span className="text-white/80">
                <span className={totals.gain >= 0 ? "text-mint font-semibold" : "text-[#ff9a85] font-semibold"}>{signedRupees(totals.gain)}</span> grown since you started
              </span>
              {showDaily && (
                <span className="text-white/80" data-testid="day-change">
                  Today <span className={totals.day >= 0 ? "text-mint font-semibold" : "text-[#ff9a85] font-semibold"}>{signedRupees(totals.day)}</span>
                </span>
              )}
            </div>
          ) : (
            <div className="text-[14px] text-white/80">Your plan is ready. It just needs its first ₹100.</div>
          )}
          {settings.calm && !peek && hasInvested && (
            <p className="mt-3 text-[12px] text-white/60 leading-snug">
              Daily ups & downs are hidden — they're noise for goals that are months away.{" "}
              <button className="underline font-semibold" onClick={() => setSetting("calm", false)}>
                Turn off
              </button>
            </p>
          )}
          {!hasInvested && stashes[0] && (
            <div className="mt-4">
              <Button className="w-full" onClick={() => setAddTo(stashes[0])} data-testid="first-invest">
                Try ₹100 first in {stashes[0].emoji} {stashes[0].name.split(" ")[0]}
              </Button>
              <p className="mt-2 text-center text-[12px] text-white/70">
                Your full plan ({rupees(stashes.reduce((sum, stash) => sum + (stash.plan.paused ? 0 : stash.plan.amount), 0))}/month) starts with AutoPay after this.
              </p>
            </div>
          )}
        </div>
      </section>

      {paydayPending && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-5 mt-4">
          <Card onClick={() => navigate("/payday")} className="p-4 border-mint bg-mint-soft">
            <div className="flex items-center gap-3">
              <span className="text-[30px]">💸</span>
              <div className="flex-1">
                <div className="text-[16px] font-bold">Money's in. Pay future-you first?</div>
                <div className="text-[13px] text-ink-2">{profile.rhythm === "monthly" ? "Your split is ready. Takes one tap." : "You pick the %. Or skip it — no pressure."}</div>
              </div>
              <ChevronRight size={20} />
            </div>
          </Card>
        </motion.div>
      )}

      {hasInvested && (
        <div className="mx-5 mt-4 rounded-3xl border border-line bg-surface p-4" data-testid="streak">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-amber-soft grid place-items-center">
              <Flame size={22} className="text-[#F58A3D]" />
            </div>
            <div className="flex-1">
              <div className="text-[16px] font-bold">
                {streakWeeks}-week streak
              </div>
              <div className="text-[13px] text-ink-2">Counts weeks you invested anything. Not trades, not app opens.</div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            {Array.from({ length: 8 }).map((_, index) => (
              <span key={index} className={`h-2 flex-1 rounded-full ${index < Math.min(8, streakWeeks) ? "bg-mint" : "bg-surface-3"}`} />
            ))}
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[12px] text-ink-2">
            <Snowflake size={14} className="text-blue" /> {freezes} streak freeze{freezes === 1 ? "" : "s"} left — for broke months. No guilt.
          </div>
        </div>
      )}

      <SectionTitle
        action={
          <button onClick={() => navigate("/new-stash")} className="inline-flex items-center gap-1 text-[14px] font-semibold text-pos min-h-11 px-1">
            <Plus size={16} /> New
          </button>
        }
      >
        Your stashes
      </SectionTitle>
      <div className="px-5 space-y-3">
        {stashes.map((stash) => (
          <StashCard key={stash.id} stash={stash} dip={dip} onOpen={() => navigate(`/stash/${stash.id}`)} />
        ))}
        <button
          onClick={() => navigate("/new-stash")}
          className="w-full rounded-3xl border-2 border-dashed border-line p-4 flex items-center justify-center gap-2 text-[15px] font-semibold text-ink-2 hover:border-mint min-h-[64px]"
        >
          <Plus size={18} /> Start a new stash
        </button>
      </div>

      <SectionTitle>Today in 30 seconds</SectionTitle>
      <div className="mx-5 rounded-3xl bg-surface-2 p-5">
        {dip ? (
          <>
            <div className="text-[15px] font-bold">Nifty 50 is down 4.1% this week</div>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">
              Global markets fell on worries about US interest rates; Indian banks and IT dragged the most.
            </p>
            <p className="mt-3 text-[14px] leading-relaxed">
              <b>Does it matter for you?</b> Your short-term stashes barely moved. Your long-term money has years to go — time has historically helped, though it's never guaranteed.
            </p>
          </>
        ) : (
          <>
            <div className="text-[15px] font-bold">Nifty 50 is up 0.6% today</div>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">Banks rallied after the RBI kept interest rates unchanged.</p>
            <p className="mt-3 text-[14px] leading-relaxed">
              <b>Does it matter for you?</b> Not really. One day is noise when your goals are months or years away.
            </p>
          </>
        )}
      </div>

      <p className="px-5 mt-6 text-[11px] leading-relaxed text-ink-2">
        Prototype with illustrative numbers. Mutual fund investments are subject to market risks; read all scheme documents carefully.
      </p>

      <AddMoneySheet stash={addTo} open={!!addTo} onClose={() => setAddTo(undefined)} suggested={100} />
    </Page>
  );
}

function StashCard({ stash, dip, onOpen }: { stash: Stash; dip: boolean; onOpen: () => void }) {
  const value = stashValue(stash, dip);
  const progress = value / stash.target;
  const eta = monthsToTarget(stash.target, value, monthlyEquivalent(stash.plan), stash.bucket, stash.plan.stepUp);
  const etaDate = eta === null ? null : addMonths(new Date(), eta);
  const onTrack = eta !== null && eta <= monthsLeft(stash);
  return (
    <Card onClick={onOpen} className="p-4">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl grid place-items-center text-[24px]" style={{ background: `${stash.color}22` }}>
          {stash.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[16px] font-semibold truncate">{stash.name}</div>
          <div className="text-[13px] text-ink-2 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: bucketMeta[stash.bucket].dot }} />
            {bucketMeta[stash.bucket].label} · by {monthYear(stash.deadline)}
          </div>
        </div>
        <div className="text-right">
          <div className="num text-[16px] font-bold">{rupees(value)}</div>
          <div className="text-[12px] text-ink-2">of {rupees(stash.target)}</div>
        </div>
      </div>
      <div className="mt-3">
        <ProgressBar value={progress} color={stash.color} />
      </div>
      <div className="mt-2 flex items-center justify-between text-[12px]">
        <span className={`font-semibold ${stash.plan.paused ? "text-amber" : stash.invested === 0 ? "text-ink-2" : onTrack ? "text-pos" : "text-amber"}`}>
          {stash.plan.paused
            ? "⏸ Paused"
            : stash.invested === 0
              ? "Not started yet"
              : onTrack
                ? "✓ On track"
                : etaDate
                  ? `Reaches goal ~${monthYear(etaDate.toISOString())}`
                  : "Needs a plan"}
        </span>
        <span className="text-ink-2">{percent(progress * 100, 0).replace("+", "")} there</span>
      </div>
    </Card>
  );
}

function DipCoach({ onDismiss }: { onDismiss: () => void }) {
  const navigate = useNavigate();
  const stashes = useStore((state) => state.stashes);
  const totals = portfolio(stashes, true);
  const before = portfolio(stashes, false);
  const drop = totals.value - before.value;
  const steadyShare = stashes.filter((stash) => stash.bucket === "steady").reduce((sum, stash) => sum + stashValue(stash, true), 0) / (totals.value || 1);
  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-5 mt-5 rounded-[28px] border border-blue/30 bg-blue-soft p-5" data-testid="dip-coach">
      <div className="text-[12px] font-bold uppercase tracking-wider text-blue">Dip coach</div>
      <h2 className="mt-1 text-[20px] font-bold leading-tight">Markets are having a moment. Here's what it means for you.</h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-surface p-3">
          <div className="text-[12px] text-ink-2">Your stashes this week</div>
          <div className="num text-[18px] font-bold text-neg">{signedRupees(drop)}</div>
        </div>
        <div className="rounded-2xl bg-surface p-3">
          <div className="text-[12px] text-ink-2">Sitting in Steady funds</div>
          <div className="num text-[18px] font-bold">{Math.round(steadyShare * 100)}%</div>
        </div>
      </div>
      <p className="mt-3 text-[14px] leading-relaxed">
        A 4% week happens a few times most years. Your near-term goals are in calm funds, so they barely moved. Only long-term money feels this. It has time, which has historically helped — though recovery is never guaranteed.
      </p>
      <div className="mt-4 flex gap-2">
        <Button size="md" variant="dark" className="flex-1" onClick={() => navigate("/learn/dips")}>
          Why markets fall · 60s
        </Button>
        <Button size="md" variant="secondary" onClick={onDismiss}>
          Got it
        </Button>
      </div>
    </motion.section>
  );
}
