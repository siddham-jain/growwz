import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, ChartLine, Moon, RotateCcw, Sparkles, TrendingDown, Wallet } from "lucide-react";
import { useStore } from "../lib/store";
import { Page, SectionTitle, Toggle } from "../components/ui";

const riskLabel = { cautious: "Cautious 😬", steady: "Steady 🧘", bold: "Bold 🛒" };
const vibeLabel = { student: "Student", intern: "Intern", firstjob: "First job", freelancer: "Freelancer" };

export function You() {
  const navigate = useNavigate();
  const { profile, settings, dip, setSetting, setDip, triggerPayday, reset, loadDemo, showToast } = useStore();

  return (
    <Page className="pb-10">
      <header className="px-5 pt-4 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-mint-soft grid place-items-center text-[26px] font-extrabold text-pos">{profile.name.slice(0, 1).toUpperCase()}</div>
        <div>
          <h1 className="text-[24px] font-extrabold tracking-tight">{profile.name}</h1>
          <div className="flex items-center gap-1.5 text-[13px] text-ink-2">
            <BadgeCheck size={16} className="text-pos" /> KYC verified · {vibeLabel[profile.vibe]}
          </div>
        </div>
      </header>

      <div className="mx-5 mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-surface-2 p-3.5">
          <div className="text-[12px] text-ink-2">Money vibe</div>
          <div className="text-[15px] font-bold">{riskLabel[profile.risk]}</div>
        </div>
        <div className="rounded-2xl bg-surface-2 p-3.5">
          <div className="text-[12px] text-ink-2">Comfortable monthly</div>
          <div className="num text-[15px] font-bold">₹{profile.monthly.toLocaleString("en-IN")}</div>
        </div>
      </div>

      <SectionTitle>How the app feels</SectionTitle>
      <ul className="mx-5 rounded-3xl border border-line bg-surface divide-y divide-line">
        <Row icon={<Sparkles size={20} />} title="Calm mode" body="Hide daily ups & downs on Home. Show goal progress instead.">
          <Toggle label="Calm mode" checked={settings.calm} onChange={(value) => setSetting("calm", value)} />
        </Row>
        <Row icon={<Moon size={20} />} title="Dark mode" body="Easy on the eyes at 1am.">
          <Toggle label="Dark mode" checked={settings.dark} onChange={(value) => setSetting("dark", value)} />
        </Row>
        <Row icon={<Wallet size={20} />} title="UPI round-ups" body="Round every Groww UPI payment up to the next ₹10 and invest the change.">
          <Toggle
            label="UPI round-ups"
            checked={settings.roundups}
            onChange={(value) => {
              setSetting("roundups", value);
              if (value) showToast("Round-ups on. Your ₹87 chai becomes ₹90 — ₹3 goes to Freedom fund.");
            }}
          />
        </Row>
      </ul>

      <SectionTitle>Demo controls</SectionTitle>
      <p className="px-5 -mt-2 mb-3 text-[13px] text-ink-2">For reviewers: trigger the moments this design is built around.</p>
      <ul className="mx-5 rounded-3xl border border-line bg-surface divide-y divide-line">
        <ActionRow icon={<span className="text-[18px]">💸</span>} title="Simulate payday" onClick={() => { navigate("/"); setTimeout(triggerPayday, 250); }} />
        <ActionRow icon={<TrendingDown size={20} />} title={dip ? "End the market dip" : "Simulate a 4% market dip"} onClick={() => { setDip(!dip); navigate("/"); }} />
        <ActionRow icon={<ChartLine size={20} />} title="Load a 5-month-old demo account" onClick={() => { loadDemo(); navigate("/"); }} />
        <ActionRow icon={<RotateCcw size={20} />} title="Start over from onboarding" onClick={() => { reset(); navigate("/welcome"); }} danger />
      </ul>

      <p className="px-5 mt-6 text-[11px] text-ink-2 leading-relaxed">
        Concept prototype. Funds, prices and returns are illustrative. Nothing here is investment advice.
      </p>
    </Page>
  );
}

function Row({ icon, title, body, children }: { icon: ReactNode; title: string; body: string; children: ReactNode }) {
  return (
    <li className="flex items-center gap-3 p-4">
      <span className="h-10 w-10 shrink-0 rounded-xl bg-surface-2 grid place-items-center text-ink">{icon}</span>
      <div className="flex-1">
        <div className="text-[15px] font-semibold">{title}</div>
        <div className="text-[13px] text-ink-2 leading-snug">{body}</div>
      </div>
      {children}
    </li>
  );
}

function ActionRow({ icon, title, onClick, danger }: { icon: ReactNode; title: string; onClick: () => void; danger?: boolean }) {
  return (
    <li>
      <button onClick={onClick} className={`w-full flex items-center gap-3 p-4 text-left hover:bg-surface-2 ${danger ? "text-neg" : ""}`}>
        <span className="h-10 w-10 shrink-0 rounded-xl bg-surface-2 grid place-items-center">{icon}</span>
        <span className="text-[15px] font-semibold">{title}</span>
      </button>
    </li>
  );
}
