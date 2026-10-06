import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Minus, Plus } from "lucide-react";
import { stockByTicker, pricePath } from "../data/stocks";
import { useStore, portfolio } from "../lib/store";
import { percent, rupees } from "../lib/format";
import { Button, Page, Sheet, Sparkline, TopBar } from "../components/ui";

export function StockDetail() {
  const { ticker = "" } = useParams();
  const navigate = useNavigate();
  const { stashes, dip, showToast } = useStore();
  const stock = stockByTicker(ticker);
  const [buying, setBuying] = useState(false);
  const [quantity, setQuantity] = useState(1);
  if (!stock) return <Navigate to="/invest" replace />;

  const cost = stock.price * quantity;
  const total = portfolio(stashes, dip).value;
  const share = cost / (total + cost);

  return (
    <Page className="pb-28">
      <TopBar title="" />
      <div className="px-5">
        <div className="flex items-center gap-3">
          <span className="h-14 w-14 rounded-2xl grid place-items-center text-white font-extrabold text-[24px]" style={{ background: stock.logoBg }}>
            {stock.logo}
          </span>
          <div>
            <h1 className="text-[22px] font-extrabold tracking-tight">{stock.name}</h1>
            <div className="text-[13px] text-ink-2">
              NSE: {stock.ticker} · you know it as {stock.youKnowItAs}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-3">
          <span className="num text-[32px] font-extrabold">{rupees(stock.price)}</span>
          <span className={`num text-[15px] font-semibold ${stock.yearChange >= 0 ? "text-pos" : "text-neg"}`}>{percent(stock.yearChange)} past year</span>
        </div>
        <div className="mt-3">
          <Sparkline points={pricePath(stock, 60)} width={350} height={140} />
        </div>
        <p className="mt-1 text-[11px] text-ink-2">Illustrative price history</p>

        <div className="mt-6 rounded-3xl border border-line bg-surface p-4">
          <h2 className="text-[16px] font-bold">How they make money</h2>
          <p className="mt-1.5 text-[15px] leading-relaxed">{stock.howTheyEarn}</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-mint-soft p-4">
            <div className="text-[13px] font-bold text-pos">💪 What the company does well</div>
            <ul className="mt-2 space-y-1.5 text-[14px] leading-snug">
              {stock.greenFlags.map((flag) => (
                <li key={flag}>{flag}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-neg-soft p-4">
            <div className="text-[13px] font-bold text-neg">👀 What could go wrong</div>
            <ul className="mt-2 space-y-1.5 text-[14px] leading-snug">
              {stock.redFlags.map((flag) => (
                <li key={flag}>{flag}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 mt-6 px-5 pt-3 pb-5 bg-gradient-to-t from-bg via-bg to-transparent">
        <Button className="w-full" onClick={() => setBuying(true)}>
          Buy {stock.name}
        </Button>
      </div>

      <Sheet open={buying} onClose={() => setBuying(false)} title={`Buy ${stock.name}`}>
        <div className="mb-4 rounded-2xl border border-line p-3.5" data-testid="buy-reflection">
          <div className="text-[13px] font-bold">Before you buy</div>
          <ul className="mt-1.5 space-y-1 text-[13px] text-ink-2 leading-snug">
            <li>• Would you keep holding if it fell 30% next month?</li>
            <li>• Are you buying the business, or the hype on your feed?</li>
            <li>• Is your emergency cushion done first?</li>
          </ul>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-surface-2 p-3">
          <span className="text-[15px] font-semibold">Shares</span>
          <div className="flex items-center gap-3">
            <button aria-label="Fewer shares" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-11 w-11 grid place-items-center rounded-full bg-surface">
              <Minus size={18} />
            </button>
            <span className="num w-8 text-center text-[20px] font-bold">{quantity}</span>
            <button aria-label="More shares" onClick={() => setQuantity(quantity + 1)} className="h-11 w-11 grid place-items-center rounded-full bg-surface">
              <Plus size={18} />
            </button>
          </div>
        </div>
        <div className="mt-4 flex justify-between text-[15px]">
          <span className="text-ink-2">You pay (approx.)</span>
          <span className="num font-bold">{rupees(cost)}</span>
        </div>
        {share > 0.2 && (
          <p className="mt-4 rounded-2xl bg-amber-soft p-3.5 text-[14px] leading-snug" data-testid="concentration-warning">
            This would be <b>{Math.round(share * 100)}%</b> of everything you've invested — in one company. Totally your call, just flagging it.
          </p>
        )}
        <Button
          className="mt-5 w-full"
          onClick={() => {
            setBuying(false);
            showToast(`Order placed: ${quantity} × ${stock.name}. Delivered to your demat by tomorrow.`);
            navigate("/invest");
          }}
        >
          Place order · {rupees(cost)}
        </Button>
      </Sheet>
    </Page>
  );
}
