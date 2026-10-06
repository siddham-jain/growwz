import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Lock, Share2 } from "lucide-react";
import { useStore, stashValue } from "../lib/store";
import { Button, Page, ProgressBar, SectionTitle } from "../components/ui";
import { monthYear } from "../lib/format";

const friends = [
  { name: "Meher", color: "#F58A3D", progress: 0.45, note: "is on a 6-week streak" },
  { name: "Kabir", color: "#C355F5", progress: 0.3, note: "taking a breather this month" },
  { name: "Aarav", color: "#5367FF", progress: 0.72, note: "invested this week" },
];

export function Squads() {
  const navigate = useNavigate();
  const { stashes, dip, profile, showToast } = useStore();
  const trip = stashes.find((stash) => stash.templateId === "trip");
  const yourProgress = trip ? stashValue(trip, dip) / trip.target : 0;
  const [cheers, setCheers] = useState<{ id: number; emoji: string }[]>([]);
  // fixed order, not a leaderboard: comparison is the thing that makes saving feel bad
  const members = [{ name: "You", color: "#00D09C", progress: yourProgress, note: trip ? "you're in!" : "start your Goa stash to join" }, ...friends];
  const started = members.filter((member) => member.progress > 0).length;

  const cheer = (emoji: string, name: string) => {
    const id = Date.now();
    setCheers((current) => [...current, { id, emoji }]);
    setTimeout(() => setCheers((current) => current.filter((item) => item.id !== id)), 1200);
    showToast(`Sent ${emoji} to ${name}`);
  };

  return (
    <Page className="pb-8">
      <header className="px-5 pt-4">
        <h1 className="text-[28px] font-extrabold tracking-tight">Squads</h1>
        <p className="mt-1 text-[15px] text-ink-2">Save for the same thing with friends. Everyone's money stays in their own account.</p>
      </header>

      <section className="relative mx-5 mt-5 rounded-[28px] p-5 text-white overflow-hidden" style={{ background: "linear-gradient(150deg, #F58A3D, #E0457B)" }} data-testid="squad-card">
        <div className="text-[13px] font-semibold text-white/80">Squad goal · {trip ? monthYear(trip.deadline) : "Mar 2027"}</div>
        <h2 className="mt-1 text-[26px] font-extrabold tracking-tight">Goa '27 🌴</h2>
        <div className="mt-1 text-[14px] text-white/85">4 friends · everyone sets their own target</div>
        <div className="mt-4 flex -space-x-2">
          {members.map((member) => (
            <span key={member.name} className="h-10 w-10 rounded-full border-2 border-white grid place-items-center text-[14px] font-bold" style={{ background: member.color }}>
              {member.name === "You" ? profile.name.slice(0, 1) : member.name.slice(0, 1)}
            </span>
          ))}
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-[13px] font-semibold">
            <span>{started} of {members.length} have started saving</span>
          </div>
          <div className="mt-1.5 h-2.5 rounded-full bg-white/25 overflow-hidden">
            <motion.div className="h-full bg-white rounded-full" initial={{ width: 0 }} animate={{ width: `${(started / members.length) * 100}%` }} />
          </div>
        </div>
        <AnimatePresence>
          {cheers.map((item) => (
            <motion.span key={item.id} className="absolute right-8 bottom-10 text-[34px]" initial={{ y: 0, opacity: 1 }} animate={{ y: -120, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 1.1 }}>
              {item.emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </section>

      <div className="mx-5 mt-3 flex items-center gap-2 text-[13px] text-ink-2">
        <Lock size={14} /> Friends see progress %, never your amounts or target.
      </div>

      <SectionTitle>Who's where</SectionTitle>
      <ul className="mx-5 space-y-2.5" data-testid="squad-members">
        {members.map((member) => (
          <li key={member.name} className="rounded-2xl border border-line bg-surface p-3.5">
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-full grid place-items-center text-white text-[14px] font-bold" style={{ background: member.color }}>
                {member.name === "You" ? profile.name.slice(0, 1) : member.name.slice(0, 1)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-semibold">{member.name}</div>
                <div className="text-[12px] text-ink-2 truncate">{member.note}</div>
              </div>
              <span className="num text-[15px] font-bold">{Math.round(Math.min(1, member.progress) * 100)}%</span>
            </div>
            <div className="mt-2.5">
              <ProgressBar value={member.progress} color={member.color} height={6} />
            </div>
            {member.name !== "You" && (
              <div className="mt-3 flex gap-2">
                <button onClick={() => cheer("🙌", member.name)} className="h-11 px-4 rounded-full bg-surface-2 text-[13px] font-semibold">
                  🙌 Cheer
                </button>
                {member.progress < 0.5 && (
                  <button onClick={() => cheer("👀", member.name)} className="h-11 px-4 rounded-full bg-surface-2 text-[13px] font-semibold">
                    👀 Gentle nudge
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="mx-5 mt-5 space-y-2">
        {!trip && (
          <Button className="w-full" onClick={() => navigate("/new-stash?template=trip")}>
            Start my Goa stash
          </Button>
        )}
        <Button variant="secondary" className="w-full" onClick={() => showToast("Invite link copied — paste it in the group chat.")}>
          <Share2 size={18} /> Invite to a new squad
        </Button>
      </div>
    </Page>
  );
}
