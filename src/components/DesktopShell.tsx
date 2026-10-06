import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Moon, Sun } from "lucide-react";
import { demoName, useStore } from "../lib/store";
import { GrowwLogo } from "./ui";

const differences = [
  ["Goals, not tickers", "You start by naming what the money is for. We pick a suitable fund from the time horizon."],
  ["Built for lumpy income", "Payday split for salaries, a % of each payment for gigs, skip or pause anytime, ₹100 minimum."],
  ["Calm by default", "Daily P&L is hidden for new investors. Dips come with context, not panic."],
  ["Learn in 60 seconds", "Story-style Bytes, and any jargon is tappable for a plain-language decode."],
  ["Guardrails where it hurts", "F&O gets a reality check, a one-time cool-off and a loss limit. A capped Spice pot for risk-seekers."],
  ["Social without comparison", "Squad goals show progress %, never amounts."],
];

const stageHeight = 920;
const stages = { wide: 1320, compact: 880 };

export function DesktopShell({ children, width, height }: { children: ReactNode; width: number; height: number }) {
  const navigate = useNavigate();
  const { onboarded, dip, settings, profile, loadDemo, reset, triggerPayday, setDip, setSetting } = useStore();
  const demoOwner = profile.name.trim() || demoName;

  // the stage is designed at a fixed size and scaled to fit, so nothing ever scrolls
  const fit = (stageWidth: number) => Math.min(width / stageWidth, height / stageHeight, 1.4);
  const layout = fit(stages.wide) >= fit(stages.compact) * 0.9 ? "wide" : "compact";
  const scale = fit(stages[layout]);

  const ensureAccount = () => {
    if (!onboarded) loadDemo();
  };

  const moments: { label: string; hint: string; run: () => void }[] = [
    { label: "Start fresh", hint: "60-second onboarding → first ₹100", run: () => { reset(); navigate("/welcome"); } },
    { label: `${demoOwner}'s account, 5 months in`, hint: "First job, Bengaluru, ₹42k/month", run: () => { loadDemo(); navigate("/"); } },
    { label: "💸 Salary lands", hint: "Payday split, one tap", run: () => { ensureAccount(); navigate("/"); setTimeout(triggerPayday, 300); } },
    { label: dip ? "📈 End the market dip" : "📉 Market drops 4%", hint: "See Dip Coach", run: () => { ensureAccount(); navigate("/"); setDip(!dip); } },
    { label: "⚡ Try to trade F&O", hint: "Reality check + cool-off", run: () => { ensureAccount(); navigate("/fno"); } },
    { label: "📖 Watch a Byte", hint: "60-second story lesson", run: () => { ensureAccount(); navigate("/learn/dips"); } },
    { label: "👯 Squad goal", hint: "Goa trip with friends", run: () => { ensureAccount(); navigate("/squads"); } },
  ];

  const links = (
    <div className="flex flex-wrap gap-2">
      <a href="./brief.html" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-ink text-bg px-4 h-10 text-[14px] font-semibold">
        Read the 1-pager <ArrowUpRight size={16} />
      </a>
      <a href="./evals.html" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 h-10 text-[14px] font-semibold">
        Evals <ArrowUpRight size={16} />
      </a>
      <button
        onClick={() => setSetting("dark", !settings.dark)}
        aria-label="Toggle dark mode"
        className="inline-flex items-center justify-center rounded-full border border-line bg-surface h-10 w-10"
      >
        {settings.dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  );

  const disclaimer = (
    <p className="text-[12px] leading-relaxed text-ink-2">
      Prototype. Prices, returns and fund names are illustrative, not live data or advice. SEBI stats are from its FY25 equity derivatives study.
    </p>
  );

  return (
    <div className="fixed inset-0 overflow-hidden bg-shell text-ink">
      <div
        className={`absolute left-1/2 top-1/2 grid items-center ${layout === "wide" ? "grid-cols-[340px_390px_340px] gap-14 px-10" : "grid-cols-[340px_390px] gap-12 px-8"}`}
        style={{ width: stages[layout], height: stageHeight, transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        <aside>
          <div className="flex items-center gap-2.5">
            <GrowwLogo size={32} />
            <span className="text-[20px] font-bold tracking-tight">Groww</span>
            <span className="ml-1 rounded-full bg-mint-soft px-2.5 py-1 text-[12px] font-bold text-pos">Gen Z redesign</span>
          </div>
          <h1 className={`mt-5 leading-[1.05] font-extrabold tracking-tight ${layout === "wide" ? "text-[38px]" : "text-[34px]"}`}>Investing that fits a first paycheck.</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
            A concept for India's 20–26 year-olds opening their first investment account. Click a moment to jump straight into it.
          </p>
          <div className="mt-5 space-y-2">
            {moments.map((moment) => (
              <button
                key={moment.label}
                onClick={moment.run}
                className={`w-full text-left rounded-2xl bg-surface border border-line px-4 hover:border-mint transition ${layout === "wide" ? "py-3" : "py-2.5"}`}
              >
                <div className="text-[15px] font-semibold">{moment.label}</div>
                <div className="text-[13px] text-ink-2">{moment.hint}</div>
              </button>
            ))}
          </div>
          {layout === "compact" && (
            <div className="mt-5 space-y-3">
              {links}
              {disclaimer}
            </div>
          )}
        </aside>

        <div className="grid place-items-center">{children}</div>

        {layout === "wide" && (
          <aside>
            <div className="text-[13px] font-bold uppercase tracking-wider text-ink-2">What's different</div>
            <ul className="mt-4 space-y-4">
              {differences.map(([title, body]) => (
                <li key={title} className="flex gap-3">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-mint" />
                  <div>
                    <div className="text-[15px] font-semibold">{title}</div>
                    <div className="text-[14px] leading-snug text-ink-2">{body}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8">{links}</div>
            <div className="mt-6">{disclaimer}</div>
          </aside>
        )}
      </div>
    </div>
  );
}
