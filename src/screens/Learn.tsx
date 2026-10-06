import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleCheck, Search } from "lucide-react";
import { bytes } from "../data/bytes";
import { glossary } from "../data/glossary";
import { useStore } from "../lib/store";
import { Page, SectionTitle } from "../components/ui";

export function Learn() {
  const navigate = useNavigate();
  const { bytesDone, openDecode } = useStore();
  const [query, setQuery] = useState("");
  const entries = Object.entries(glossary).filter(([, entry]) => !query || `${entry.term} ${entry.plain}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <Page className="pb-8">
      <header className="px-5 pt-4">
        <h1 className="text-[28px] font-extrabold tracking-tight">Learn</h1>
        <p className="mt-1 text-[15px] text-ink-2">60-second Bytes. No finance degree required.</p>
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-mint-soft p-4">
          <div className="text-[28px]">🧠</div>
          <div className="flex-1">
            <div className="text-[15px] font-bold">
              {bytesDone.length} of {bytes.length} Bytes done
            </div>
            <div className="mt-2 h-2 rounded-full bg-surface overflow-hidden">
              <div className="h-full rounded-full bg-mint" style={{ width: `${(bytesDone.length / bytes.length) * 100}%` }} />
            </div>
          </div>
        </div>
      </header>

      <SectionTitle>Bytes</SectionTitle>
      <div className="px-5 grid grid-cols-2 gap-3">
        {bytes.map((byte) => {
          const done = bytesDone.includes(byte.id);
          return (
            <button
              key={byte.id}
              onClick={() => navigate(`/learn/${byte.id}`)}
              className="relative text-left rounded-3xl p-4 min-h-[160px] text-white overflow-hidden flex flex-col"
              style={{ background: `linear-gradient(150deg, ${byte.gradient[0]}, ${byte.gradient[1]})` }}
            >
              <span className="text-[34px]">{byte.emoji}</span>
              <span className="mt-auto text-[15px] font-bold leading-tight">{byte.title}</span>
              <span className="mt-1 text-[12px] text-white/80">
                {byte.minutes} min · {byte.slides.length + 1} cards
              </span>
              {done && <CircleCheck size={22} className="absolute top-3 right-3 text-white" aria-label="Done" />}
            </button>
          );
        })}
      </div>

      <SectionTitle>Decode</SectionTitle>
      <p className="px-5 -mt-2 mb-3 text-[14px] text-ink-2">Every confusing word, in plain language. Tap any underlined word in the app to see it.</p>
      <label className="mx-5 flex items-center gap-2 rounded-2xl bg-surface-2 px-4 h-12">
        <Search size={18} className="text-ink-2" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="NAV, exit load, XIRR…" aria-label="Search terms" className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-ink-2" />
      </label>
      <ul className="mx-5 mt-3 rounded-3xl border border-line bg-surface divide-y divide-line overflow-hidden">
        {entries.map(([key, entry]) => (
          <li key={key}>
            <button onClick={() => openDecode(key)} className="w-full text-left px-4 py-3.5 hover:bg-surface-2">
              <div className="text-[15px] font-semibold">{entry.term}</div>
              <div className="text-[13px] text-ink-2 line-clamp-1">{entry.plain}</div>
            </button>
          </li>
        ))}
      </ul>
    </Page>
  );
}
