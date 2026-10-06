import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Hourglass } from "lucide-react";
import { useStore } from "../lib/store";
import { Button } from "../components/ui";

const questions = [
  {
    question: "You buy a Nifty call option for ₹5,000. Nifty stays flat until expiry. You get back…",
    options: ["₹5,000", "Close to ₹0", "₹5,500"],
    answer: 1,
  },
  {
    question: "One Nifty futures lot controls roughly how much money's worth of Nifty?",
    options: ["₹5,000", "₹50,000", "₹15 lakh or more"],
    answer: 2,
  },
  {
    question: "You just lost ₹3,000 on a trade. Best next move?",
    options: ["Trade bigger to win it back", "Stop and review what happened", "Borrow and try again"],
    answer: 1,
  },
];

const lossLimits = [1000, 2500, 5000];

export function RealityCheck() {
  const navigate = useNavigate();
  const { fnoUnlockAt, startFnoCooloff, showToast } = useStore();
  const [stage, setStage] = useState<"stats" | "quiz" | "result">(fnoUnlockAt ? "result" : "stats");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [limit, setLimit] = useState(2500);
  const score = answers.filter((answer, index) => answer === questions[index].answer).length;
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const remaining = fnoUnlockAt ? Math.max(0, fnoUnlockAt - now) : 0;
  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);

  const choose = (option: number) => {
    const next = [...answers, option];
    setAnswers(next);
    if (current < questions.length - 1) setTimeout(() => setCurrent(current + 1), 250);
    else setTimeout(() => setStage("result"), 250);
  };

  return (
    <div className="min-h-full bg-[#101114] text-white flex flex-col" data-testid="reality-check">
      <div className="flex items-center px-3 h-14">
        <button aria-label="Go back" onClick={() => navigate(-1)} className="h-11 w-11 grid place-items-center rounded-full hover:bg-white/10">
          <ChevronLeft size={24} />
        </button>
        <span className="font-semibold">F&O reality check</span>
      </div>

      {stage === "stats" && (
        <div className="flex-1 flex flex-col px-6">
          <div className="text-[13px] font-bold uppercase tracking-wider text-[#ffb547]">Before you trade futures & options</div>
          <h1 className="mt-2 text-[34px] leading-[1.05] font-extrabold tracking-tight">
            <span className="text-[#ff7a5c]">91 of every 100</span> traders lost money last year.
          </h1>
          <div className="mt-6 grid grid-cols-10 gap-1.5" role="img" aria-label="91 of 100 dots are red: traders who lost money">
            {Array.from({ length: 100 }).map((_, index) => (
              <motion.span
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.008 }}
                className={`aspect-square rounded-full ${index >= 91 ? "bg-mint" : "bg-[#ff7a5c]/80"}`}
              />
            ))}
          </div>
          <ul className="mt-6 space-y-3 text-[15px] leading-snug text-white/85">
            <li className="flex gap-3">
              <span className="text-[20px]">🧑</span>
              <span>
                Under 30? <b className="text-white">89%</b> of traders your age lost money too.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-[20px]">🔁</span>
              <span><b className="text-white">3 in 4</b> who lost kept trading, hoping to win it back.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[20px]">💸</span>
              <span>Traders lost over <b className="text-white">₹1 lakh crore</b> combined in FY25.</span>
            </li>
          </ul>
          <p className="mt-4 text-[11px] text-white/50">Source: SEBI study of individual traders in equity derivatives, FY25. Traded F&O before? This screen shows your own P&L history instead.</p>
          <div className="mt-auto pb-8 pt-6 space-y-2">
            <Button className="w-full" onClick={() => setStage("quiz")}>
              One-time check · 3 questions · 30 sec
            </Button>
            <Button variant="ghost" className="w-full !text-white/80 hover:!bg-white/10" onClick={() => navigate("/learn/fno")}>
              Learn F&O in 2 minutes first
            </Button>
          </div>
        </div>
      )}

      {stage === "quiz" && (
        <div className="flex-1 flex flex-col px-6" data-testid="fno-quiz">
          <div className="flex gap-1.5">
            {questions.map((_, index) => (
              <span key={index} className={`h-1.5 flex-1 rounded-full ${index <= current ? "bg-mint" : "bg-white/15"}`} />
            ))}
          </div>
          <div className="mt-6 text-[13px] text-white/60">
            Question {current + 1} of {questions.length}
          </div>
          <motion.h2 key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mt-2 text-[24px] leading-tight font-bold">
            {questions[current].question}
          </motion.h2>
          <div className="mt-6 space-y-3">
            {questions[current].options.map((option, index) => (
              <motion.button
                key={`${current}-${option}`}
                whileTap={{ scale: 0.98 }}
                onClick={() => choose(index)}
                className="w-full text-left rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 min-h-[60px] text-[16px] font-semibold"
              >
                {option}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {stage === "result" && (
        <div className="flex-1 flex flex-col px-6" data-testid="fno-result">
          {fnoUnlockAt ? (
            <>
              <Hourglass size={40} className="text-[#ffb547]" />
              <h1 className="mt-4 text-[30px] leading-tight font-extrabold tracking-tight">F&O unlocks in</h1>
              <div className="num mt-2 text-[48px] font-extrabold text-mint" data-testid="cooloff-timer">
                {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-white/75">
                A one-time, 24-hour cool-off — only the first time you switch on F&O. Tomorrow it's yours, with a monthly loss limit of <b className="text-white">₹{limit.toLocaleString("en-IN")}</b> you can change any time.
              </p>
            </>
          ) : (
            <>
              <div className="text-[48px]">{score >= 2 ? "🧠" : "📚"}</div>
              <h1 className="mt-3 text-[30px] leading-tight font-extrabold tracking-tight">
                {score}/{questions.length} — {score === 3 ? "you know your stuff." : score === 2 ? "solid basics." : "let's learn a bit first."}
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-white/75">
                {score >= 2
                  ? "Next: a one-time 24-hour cool-off, and a monthly loss limit you pick now — while you're calm."
                  : "No shame — most people don't know this. A 2-minute Byte covers it. You can still unlock after a 24-hour cool-off."}
              </p>
              <div className="mt-6 text-[13px] font-semibold text-white/70">Monthly loss limit (we'll stop F&O orders after this)</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {lossLimits.map((value) => (
                  <button
                    key={value}
                    aria-pressed={limit === value}
                    onClick={() => setLimit(value)}
                    className={`min-h-12 rounded-xl border text-[15px] font-semibold ${limit === value ? "border-mint bg-mint/15 text-mint" : "border-white/15"}`}
                  >
                    ₹{value.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="mt-6 rounded-3xl bg-white/5 border border-white/10 p-4">
            <div className="text-[15px] font-bold">📝 Paper trade meanwhile</div>
            <p className="mt-1 text-[14px] text-white/70 leading-snug">Practise with ₹1,00,000 of virtual money. If it doesn't work on paper, it won't work for real.</p>
            <Button size="md" variant="secondary" className="mt-3 w-full" onClick={() => showToast("Paper trading is next on the roadmap.")}>
              Try paper trading
            </Button>
          </div>

          <div className="mt-auto pb-8 pt-6 space-y-2">
            {!fnoUnlockAt && (
              <Button
                className="w-full"
                data-testid="start-cooloff"
                onClick={() => {
                  startFnoCooloff();
                  showToast("Cool-off started. We'll remind you tomorrow.");
                }}
              >
                Start 24h cool-off
              </Button>
            )}
            {!fnoUnlockAt && score < 2 && (
              <Button variant="ghost" className="w-full !text-white/80 hover:!bg-white/10" onClick={() => navigate("/learn/fno")}>
                Watch the 2-minute Byte
              </Button>
            )}
            <Button variant="ghost" className="w-full !text-white/80 hover:!bg-white/10" onClick={() => navigate("/")}>
              Back to my stashes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
