import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShieldAlert } from "lucide-react";
import { funds, bucketMeta, type Fund } from "../data/funds";
import { stocks, pricePath } from "../data/stocks";
import { useStore } from "../lib/store";
import { percent, rupees } from "../lib/format";
import { Button, Chip, Page, RiskDots, SectionTitle, Sheet, Sparkline, Term } from "../components/ui";

const templateForBucket = { steady: "emergency", balanced: "gadget", growth: "freedom" } as const;

export function Invest() {
  const navigate = useNavigate();
  const { showToast, fnoUnlockAt, settings, setSetting, profile } = useStore();
  const [spicePercent, setSpicePercent] = useState(10);
  const spiceCap = Math.round((profile.monthly * spicePercent) / 100 / 50) * 50;
  const affordable = stocks.filter((stock) => stock.price <= spiceCap).sort((a, b) => a.price - b.price);
  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const [query, setQuery] = useState("");
  const [openFund, setOpenFund] = useState<Fund | null>(null);
  const needle = query.trim().toLowerCase();
  const matchingFunds = funds.filter((fund) => !needle || `${fund.name} ${fund.plainName} ${fund.category}`.toLowerCase().includes(needle));
  const matchingStocks = stocks.filter((stock) => !needle || `${stock.name} ${stock.ticker} ${stock.youKnowItAs}`.toLowerCase().includes(needle));

  const more = [
    { label: "IPOs", emoji: "🔔" },
    { label: "All stocks", emoji: "📈" },
    { label: "ETFs", emoji: "🧺" },
    { label: "Gold ETFs", emoji: "🪙" },
    { label: "US stocks", emoji: "🇺🇸" },
  ];

  return (
    <Page className="pb-8">
      <header className="px-5 pt-4">
        <h1 className="text-[28px] font-extrabold tracking-tight">Invest</h1>
        <label className="mt-3 flex items-center gap-2 rounded-2xl bg-surface-2 px-4 h-12">
          <Search size={18} className="text-ink-2" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Zudio, index fund, gold…" aria-label="Search" className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-ink-2" />
        </label>
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar" aria-label="Jump to section">
          {[
            ["Funds", "funds"],
            ["Stocks", "stocks"],
            ["IPOs & more", "more"],
            ["F&O", "more"],
          ].map(([label, target]) => (
            <Chip key={label} onClick={() => jump(target)} className="shrink-0">
              {label}
            </Chip>
          ))}
        </div>
      </header>

      <button onClick={() => showToast("IPO applications work just like Groww today — this card adds the reality check.")} className="mx-5 mt-4 w-[calc(100%-40px)] text-left rounded-3xl border border-line bg-surface p-4 hover:border-mint" data-testid="ipo-card">
        <div className="flex items-center gap-3">
          <span className="text-[26px]">🔔</span>
          <div className="flex-1">
            <div className="text-[15px] font-bold">2 IPOs open this week</div>
            <div className="text-[13px] text-ink-2 leading-snug">Allotment is a lottery and listing-day gains aren't guaranteed. Apply with Spice pot money, not your goals.</div>
          </div>
        </div>
      </button>

      <div id="funds" className="scroll-mt-2" />
      <SectionTitle>Start here</SectionTitle>
      <p className="px-5 -mt-2 mb-3 text-[14px] text-ink-2">
        Four funds cover most of what a first-time investor needs. All are <Term id="direct">Direct</Term> plans, so no commissions. Past performance may or may not be sustained.
      </p>
      <div className="px-5 space-y-3">
        {matchingFunds.map((fund) => (
          <button key={fund.id} onClick={() => setOpenFund(fund)} className="w-full text-left rounded-3xl border border-line bg-surface p-4 hover:border-mint">
            <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-ink-2">
              <span className="h-2 w-2 rounded-full" style={{ background: fund.tag ? "#E0A100" : bucketMeta[fund.bucket].dot }} /> {fund.tag ?? bucketMeta[fund.bucket].label}
            </div>
            <div className="mt-0.5 text-[16px] font-bold">{fund.plainName}</div>
            <div className="text-[13px] text-ink-2 truncate">{fund.name}</div>
            <div className="mt-3 inline-flex rounded-full bg-mint-soft px-3 py-1 text-[13px] font-semibold">Good for: {fund.goodFor}</div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <RiskDots level={fund.riskLevel} />
                <span className="text-[12px] text-ink-2">Riskometer: {fund.riskometer}</span>
              </div>
              <span className="num text-[12px] text-ink-2">Past 3Y: {percent(fund.returns3y)}/yr</span>
            </div>
          </button>
        ))}
      </div>

      <div id="stocks" className="scroll-mt-2" />
      <SectionTitle>Brands you already use</SectionTitle>
      <p className="px-5 -mt-2 mb-3 text-[14px] text-ink-2">Loving the product ≠ a good investment. We show you both sides.</p>
      <ul className="mx-5 rounded-3xl border border-line bg-surface divide-y divide-line overflow-hidden">
        {matchingStocks.map((stock) => (
          <li key={stock.ticker}>
            <button onClick={() => navigate(`/stock/${stock.ticker}`)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-surface-2">
              <span className="h-11 w-11 rounded-xl grid place-items-center text-white font-extrabold text-[18px]" style={{ background: stock.logoBg }}>
                {stock.logo}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-semibold">{stock.name}</div>
                <div className="text-[12px] text-ink-2 truncate">{stock.youKnowItAs}</div>
              </div>
              <Sparkline points={pricePath(stock, 24)} width={56} height={26} />
              <div className="text-right w-[84px]">
                <div className="num text-[15px] font-semibold">{rupees(stock.price)}</div>
                <div className={`num text-[12px] font-semibold ${stock.yearChange >= 0 ? "text-pos" : "text-neg"}`}>{percent(stock.yearChange)} 1Y</div>
              </div>
            </button>
          </li>
        ))}
      </ul>
      <div className="mx-5 mt-3 rounded-3xl border border-line bg-surface p-4" data-testid="spice-pot">
        <div className="flex items-center gap-3">
          <span className="text-[28px]">🌶️</span>
          <div className="flex-1">
            <div className="text-[16px] font-bold">Spice pot</div>
            <div className="text-[13px] text-ink-2 leading-snug">
              {settings.spice ? `On · up to ${rupees(spiceCap)}/month for single stocks, tracked separately from your goals.` : "Want some action? Keep a capped pot for single stocks and themes, so a bad bet can't touch your goals."}
            </div>
          </div>
        </div>
        {!settings.spice && (
          <>
            <div className="mt-3 flex gap-2" role="group" aria-label="Spice pot cap">
              {[10, 15, 20].map((value) => (
                <Chip key={value} active={spicePercent === value} onClick={() => setSpicePercent(value)}>
                  {value}%
                </Chip>
              ))}
            </div>
            <p className="mt-2 text-[12px] text-ink-2">
              {affordable.length
                ? `${rupees(spiceCap)}/month buys about ${Math.floor(spiceCap / affordable[0].price)} share${Math.floor(spiceCap / affordable[0].price) === 1 ? "" : "s"} of ${affordable[0].name}, or unused cap rolls over to next month.`
                : `${rupees(spiceCap)}/month rolls over until it covers a share, or goes into a theme ETF.`}
            </p>
          </>
        )}
        <Button
          size="md"
          variant={settings.spice ? "secondary" : "dark"}
          className="mt-3 w-full"
          onClick={() => {
            setSetting("spice", !settings.spice);
            showToast(settings.spice ? "Spice pot off." : `Spice pot on · capped at ${rupees(spiceCap)}/month (${spicePercent}% of what you invest).`);
          }}
        >
          {settings.spice ? "Turn off" : `Cap it at ${rupees(spiceCap)}/month`}
        </Button>
      </div>

      <div id="more" className="scroll-mt-2" />
      <SectionTitle>Everything else on Groww</SectionTitle>
      <div className="px-5 grid grid-cols-3 gap-2.5">
        {more.map((item) => (
          <button key={item.label} onClick={() => showToast(`${item.label} works just like Groww today.`)} className="rounded-2xl border border-line bg-surface p-3 min-h-[84px] text-left hover:border-mint">
            <div className="text-[22px]">{item.emoji}</div>
            <div className="mt-1 text-[13px] font-semibold">{item.label}</div>
          </button>
        ))}
        <button onClick={() => navigate("/fno")} className="rounded-2xl border border-line bg-surface p-3 min-h-[84px] text-left hover:border-amber" data-testid="fno-tile">
          <div className="flex items-center gap-1 text-[22px]">
            ⚡ <ShieldAlert size={14} className="text-amber" />
          </div>
          <div className="mt-1 text-[13px] font-semibold">F&O</div>
          <div className="text-[11px] text-ink-2">Futures & options</div>
          <div className="text-[11px] text-amber font-semibold">{fnoUnlockAt ? "Cooling off" : "Reality check first"}</div>
        </button>
      </div>

      <Sheet open={!!openFund} onClose={() => setOpenFund(null)} title={openFund?.plainName ?? ""}>
        {openFund && (
          <div>
            <div className="text-[13px] text-ink-2">
              {openFund.name} · {openFund.category}
            </div>
            <p className="mt-3 text-[15px] leading-relaxed">{openFund.oneLiner}</p>
            <div className="mt-4 rounded-2xl bg-mint-soft p-4">
              <div className="text-[12px] font-bold text-pos">GOOD FOR</div>
              <p className="mt-1 text-[14px] leading-relaxed">{openFund.whoFor}</p>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-[14px]">
              <Stat label={<Term id="expense-ratio">Expense ratio</Term>} value={`${openFund.expenseRatio}% / yr`} />
              <Stat label={<Term id="exit-load">Exit load</Term>} value={openFund.exitLoad} />
              <Stat label="Past 3Y, per year" value={percent(openFund.returns3y)} />
              <Stat label="Holds things like" value={openFund.holdsLike.slice(0, 3).join(", ")} />
            </dl>
            <p className="mt-3 text-[12px] text-ink-2">Past returns are history, not a forecast.</p>
            <Button
              className="mt-5 w-full"
              onClick={() => {
                setOpenFund(null);
                navigate(`/new-stash?template=${templateForBucket[openFund.bucket]}`);
              }}
            >
              Start a stash with this
            </Button>
          </div>
        )}
      </Sheet>
    </Page>
  );
}

function Stat({ label, value }: { label: ReactNode; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-2 p-3">
      <dt className="text-[12px] text-ink-2">{label}</dt>
      <dd className="mt-0.5 font-semibold leading-snug">{value}</dd>
    </div>
  );
}
