import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { X } from "lucide-react";
import { byteById } from "../data/bytes";
import { useStore } from "../lib/store";
import { Button } from "../components/ui";

const slideMs = 6000;

export function ByteViewer() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const markByte = useStore((state) => state.markByte);
  const byte = byteById(id);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const total = byte ? byte.slides.length + 1 : 0;
  const onQuiz = byte ? index === byte.slides.length : false;

  useEffect(() => {
    if (!byte || onQuiz) return;
    const timer = setTimeout(() => setIndex((value) => Math.min(value + 1, total - 1)), slideMs);
    return () => clearTimeout(timer);
  }, [index, byte, onQuiz, total]);

  if (!byte) return <Navigate to="/learn" replace />;

  const close = () => navigate(-1);
  const go = (delta: number) => setIndex((value) => Math.max(0, Math.min(total - 1, value + delta)));
  const slide = byte.slides[index];

  return (
    <div className="relative h-full min-h-full text-white flex flex-col select-none" style={{ background: `linear-gradient(160deg, ${byte.gradient[0]}, ${byte.gradient[1]})` }} data-testid="byte-viewer">
      <div className="px-3 pt-4 flex gap-1">
        {Array.from({ length: total }).map((_, bar) => (
          <div key={bar} className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden">
            {bar < index && <div className="h-full w-full bg-white" />}
            {bar === index && (
              <motion.div key={index} className="h-full bg-white" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: onQuiz ? 0.3 : slideMs / 1000, ease: "linear" }} />
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between px-4 pt-3">
        <span className="text-[14px] font-semibold text-white/90">{byte.title}</span>
        <button aria-label="Close" onClick={close} className="h-11 w-11 grid place-items-center rounded-full hover:bg-white/10">
          <X size={22} />
        </button>
      </div>

      <div className="relative flex-1">
        {!onQuiz && (
          <>
            <button aria-label="Previous card" className="absolute inset-y-0 left-0 w-1/3 z-10" onClick={() => go(-1)} />
            <button aria-label="Next card" className="absolute inset-y-0 right-0 w-2/3 z-10" onClick={() => go(1)} data-testid="byte-next" />
          </>
        )}
        <AnimatePresence mode="wait">
          <motion.div key={index} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }} className="absolute inset-0 flex flex-col px-7 pb-10">
            {slide ? (
              <>
                <div className="flex-1 grid place-items-center">
                  <span className={slide.visual.length > 3 ? "text-[96px] font-extrabold tracking-tight" : "text-[110px]"}>{slide.visual}</span>
                </div>
                <div className="text-[13px] font-bold uppercase tracking-wider text-white/75">{slide.kicker}</div>
                <h2 className="mt-2 text-[32px] leading-[1.08] font-extrabold tracking-tight">{slide.title}</h2>
                <p className="mt-3 text-[17px] leading-relaxed text-white/90">{slide.body}</p>
                <p className="mt-6 text-[12px] text-white/60">Tap to continue</p>
              </>
            ) : (
              <div className="flex-1 flex flex-col pt-6" data-testid="byte-quiz">
                <div className="text-[13px] font-bold uppercase tracking-wider text-white/75">Quick check</div>
                <h2 className="mt-2 text-[26px] leading-tight font-extrabold">{byte.quiz.question}</h2>
                <div className="mt-6 space-y-3">
                  {byte.quiz.options.map((option, optionIndex) => {
                    const isAnswer = optionIndex === byte.quiz.answer;
                    const state = picked === null ? "idle" : isAnswer ? "right" : picked === optionIndex ? "wrong" : "dim";
                    return (
                      <motion.button
                        key={option}
                        whileTap={{ scale: 0.98 }}
                        disabled={picked !== null}
                        onClick={() => {
                          setPicked(optionIndex);
                          if (isAnswer) markByte(byte.id);
                        }}
                        className={`w-full text-left rounded-2xl px-4 min-h-[60px] text-[16px] font-semibold transition border-2 ${
                          state === "right" ? "bg-white text-[#0b2a20] border-white" : state === "wrong" ? "bg-black/20 border-[#ff9a85]" : state === "dim" ? "bg-white/5 border-transparent opacity-60" : "bg-white/15 border-transparent hover:bg-white/25"
                        }`}
                      >
                        {option} {state === "right" && "✓"}
                      </motion.button>
                    );
                  })}
                </div>
                {picked !== null && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
                    <p className="text-[16px] leading-relaxed">{picked === byte.quiz.answer ? `🎉 ${byte.quiz.explain}` : `Not quite. ${byte.quiz.explain}`}</p>
                    <div className="mt-6 space-y-2">
                      {picked !== byte.quiz.answer && (
                        <Button variant="secondary" className="w-full" onClick={() => setPicked(null)}>
                          Try again
                        </Button>
                      )}
                      <Button variant="dark" className="w-full !bg-white !text-[#0b2a20]" onClick={close} data-testid="byte-done">
                        Done
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
