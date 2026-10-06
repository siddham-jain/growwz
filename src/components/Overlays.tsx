import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { glossary } from "../data/glossary";
import { useStore } from "../lib/store";
import { Button, GrowwLogo, Sheet, useOverlayRoot } from "./ui";

export function DecodeSheet() {
  const decode = useStore((state) => state.decode);
  const openDecode = useStore((state) => state.openDecode);
  const navigate = useNavigate();
  const entry = decode ? glossary[decode] : undefined;
  return (
    <Sheet open={!!entry} onClose={() => openDecode(null)} title={entry ? `Decode: ${entry.term}` : ""}>
      {entry && (
        <div data-testid="decode-sheet">
          <p className="text-[17px] leading-relaxed text-ink">{entry.plain}</p>
          <div className="mt-4 rounded-2xl bg-blue-soft p-4">
            <div className="text-[12px] font-bold uppercase tracking-wider text-blue">Think of it like</div>
            <p className="mt-1 text-[15px] leading-relaxed text-ink">{entry.like}</p>
          </div>
          <Button
            variant="secondary"
            size="md"
            className="mt-5 w-full"
            onClick={() => {
              openDecode(null);
              navigate("/learn");
            }}
          >
            <BookOpen size={18} /> Browse all decoded terms
          </Button>
        </div>
      )}
    </Sheet>
  );
}

export function Toast() {
  const toast = useStore((state) => state.toast);
  const showToast = useStore((state) => state.showToast);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => showToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast, showToast]);
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          role="status"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          className="absolute bottom-24 inset-x-5 z-[60] rounded-2xl bg-ink text-bg px-4 py-3.5 text-[14px] font-medium shadow-lg pointer-events-auto"
        >
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function NoticeBanner() {
  const notice = useStore((state) => state.notice);
  const setNotice = useStore((state) => state.setNotice);
  const navigate = useNavigate();
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(timer);
  }, [notice, setNotice]);
  return (
    <AnimatePresence>
      {notice && (
        <motion.button
          data-testid="notice"
          initial={{ y: -120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -120, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          onClick={() => {
            setNotice(null);
            if (notice.route) navigate(notice.route);
          }}
          className="absolute top-3 inset-x-3 z-[70] flex gap-3 items-start text-left rounded-[22px] bg-surface/95 backdrop-blur-xl border border-line p-3.5 shadow-xl pointer-events-auto"
        >
          <GrowwLogo size={36} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[12px] text-ink-2">
              <span className="font-semibold">Groww</span> · now
            </div>
            <div className="font-semibold text-[15px] text-ink">{notice.title}</div>
            <div className="text-[14px] text-ink-2 leading-snug">{notice.body}</div>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

const confettiColors = ["#00D09C", "#5367FF", "#F58A3D", "#FFD43B", "#C355F5"];

export function Celebration() {
  const celebrate = useStore((state) => state.celebrate);
  const setCelebrate = useStore((state) => state.setCelebrate);
  const root = useOverlayRoot();
  if (!root) return null;
  return createPortal(
    <AnimatePresence>
      {celebrate === "first" && (
        <motion.div
          data-testid="celebration"
          className="absolute inset-0 z-[80] bg-[#0b2a20] text-white flex flex-col pointer-events-auto overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {Array.from({ length: 36 }).map((_, index) => (
            <motion.span
              key={index}
              className="absolute top-0 h-3 w-2 rounded-sm"
              style={{ left: `${(index * 37) % 100}%`, background: confettiColors[index % confettiColors.length] }}
              initial={{ y: -40, rotate: 0, opacity: 1 }}
              animate={{ y: 900, rotate: 360 * (index % 2 ? 1 : -1), opacity: 0.9 }}
              transition={{ duration: 2.4 + (index % 5) * 0.3, delay: (index % 7) * 0.08, ease: "easeIn" }}
            />
          ))}
          <div className="flex-1 flex flex-col justify-center px-7">
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", delay: 0.2 }} className="text-[64px]">
              🌱
            </motion.div>
            <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }} className="mt-4 text-[34px] leading-[1.1] font-extrabold tracking-tight">
              You're officially an investor.
            </motion.h1>
            <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="mt-4 text-[17px] text-white/80 leading-relaxed">
              The hardest part of investing is starting. That's done. Your units show up in 1–2 working days — we'll ping you.
            </motion.p>
            <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-6 space-y-2.5 text-[15px] text-white/90">
              <li>✅ First investment done</li>
              <li>🔥 Week 1 of your streak</li>
              <li>🧘 Calm mode is on — we hide the daily noise</li>
            </motion.ul>
          </div>
          <div className="px-6 pb-10">
            <Button className="w-full" onClick={() => setCelebrate(null)}>
              Let's go
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    root,
  );
}
