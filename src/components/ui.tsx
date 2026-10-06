import { type ButtonHTMLAttributes, type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";

type Variant = "primary" | "secondary" | "ghost" | "dark" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-mint text-mint-ink hover:brightness-95",
  secondary: "bg-surface-2 text-ink hover:bg-surface-3",
  ghost: "bg-transparent text-ink-2 hover:bg-surface-2",
  dark: "bg-ink text-bg hover:opacity-90",
  danger: "bg-neg-soft text-neg hover:brightness-95",
};

export function Button({
  variant = "primary",
  size = "lg",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "lg" | "md" | "sm" }) {
  const sizes = { lg: "h-14 px-6 text-[16px] rounded-2xl", md: "h-11 px-4 text-[15px] rounded-xl", sm: "h-9 px-3 text-[13px] rounded-lg" };
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition disabled:opacity-40 disabled:pointer-events-none ${sizes[size]} ${variants[variant]} ${className}`}
      {...(props as object)}
    >
      {children}
    </motion.button>
  );
}

export function Card({ className = "", children, onClick }: { className?: string; children: ReactNode; onClick?: () => void }) {
  const Tag = onClick ? motion.button : motion.div;
  return (
    <Tag
      onClick={onClick}
      whileTap={onClick ? { scale: 0.985 } : undefined}
      className={`block w-full text-left rounded-3xl bg-surface border border-line ${className}`}
    >
      {children}
    </Tag>
  );
}

export function TopBar({ title, right, onBack, transparent }: { title?: string; right?: ReactNode; onBack?: () => void; transparent?: boolean }) {
  const navigate = useNavigate();
  return (
    <div className={`sticky top-0 z-20 flex items-center gap-2 px-3 h-14 ${transparent ? "" : "bg-bg/90 backdrop-blur-md"}`}>
      <button
        aria-label="Go back"
        onClick={onBack ?? (() => navigate(-1))}
        className="h-11 w-11 grid place-items-center rounded-full hover:bg-surface-2 text-ink"
      >
        <ChevronLeft size={24} />
      </button>
      <div className="flex-1 font-semibold text-[17px] truncate">{title}</div>
      {right}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between px-5 mt-7 mb-3">
      <h2 className="text-[18px] font-bold tracking-tight">{children}</h2>
      {action}
    </div>
  );
}

export function ProgressBar({ value, color = "var(--mint)", height = 8 }: { value: number; color?: string; height?: number }) {
  return (
    <div className="w-full rounded-full bg-surface-3 overflow-hidden" style={{ height }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

export function ProgressRing({ value, size = 120, stroke = 12, color = "var(--mint)", children }: { value: number; size?: number; stroke?: number; color?: string; children?: ReactNode }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, value));
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--surface-3)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - clamped) }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative h-11 w-14 shrink-0 grid place-items-center"
    >
      <span className={`relative h-7 w-12 rounded-full transition ${checked ? "bg-mint" : "bg-surface-3"}`}>
        <motion.span layout className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow ${checked ? "right-1" : "left-1"}`} />
      </span>
    </button>
  );
}

export function Chip({ active, onClick, children, className = "" }: { active?: boolean; onClick?: () => void; children: ReactNode; className?: string }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-11 px-4 rounded-full text-[14px] font-semibold border transition ${
        active ? "bg-mint-soft border-mint text-ink" : "bg-surface border-line text-ink-2 hover:border-ink-3"
      } ${className}`}
    >
      {children}
    </motion.button>
  );
}

// inline jargon: tap to get a plain-language definition
export function Term({ id, children }: { id: string; children: ReactNode }) {
  const openDecode = useStore((state) => state.openDecode);
  return (
    <button
      data-term={id}
      onClick={(event) => {
        event.stopPropagation();
        openDecode(id);
      }}
      className="inline underline decoration-dotted decoration-2 underline-offset-4 decoration-blue/60 font-semibold text-inherit"
    >
      {children}
    </button>
  );
}

export function useOverlayRoot() {
  const [element, setElement] = useState<HTMLElement | null>(null);
  useEffect(() => setElement(document.getElementById("overlay-root")), []);
  return element;
}

export function Sheet({ open, onClose, title, children, dark }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; dark?: boolean }) {
  const root = useOverlayRoot();
  if (!root) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="absolute inset-0 pointer-events-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 340 }}
            className={`absolute bottom-0 inset-x-0 max-h-[88%] overflow-y-auto no-scrollbar rounded-t-[28px] pb-8 ${dark ? "bg-[#17181b] text-white" : "bg-bg text-ink"}`}
          >
            <div className="sticky top-0 z-10 pt-2.5 pb-1 bg-inherit">
              <div className="mx-auto h-1.5 w-10 rounded-full bg-ink-3/40" />
              <div className="flex items-center justify-between px-5 pt-3">
                <h2 className="text-[19px] font-bold tracking-tight">{title}</h2>
                <button aria-label="Close" onClick={onClose} className="h-11 w-11 -mr-2 grid place-items-center rounded-full hover:bg-surface-2">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="px-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    root,
  );
}

export function Sparkline({ points, width = 120, height = 40, color }: { points: number[]; width?: number; height?: number; color?: string }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${((index / (points.length - 1)) * width).toFixed(1)},${(height - ((point - min) / span) * (height - 4) - 2).toFixed(1)}`)
    .join(" ");
  const stroke = color ?? (points[points.length - 1] >= points[0] ? "var(--pos)" : "var(--neg)");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={path} fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function GrowwLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-label="Groww">
      <defs>
        <clipPath id="groww-logo">
          <circle cx="32" cy="32" r="30" />
        </clipPath>
      </defs>
      <g clipPath="url(#groww-logo)">
        <rect width="64" height="64" fill="#5367FF" />
        <path d="M0 38 L18 28 L30 36 L46 20 L64 26 V64 H0Z" fill="#00D09C" />
      </g>
    </svg>
  );
}

export function RiskDots({ level }: { level: number }) {
  return (
    <div className="flex gap-1" aria-label={`Risk ${level} of 5`}>
      {[1, 2, 3, 4, 5].map((dot) => (
        <span key={dot} className="h-1.5 w-4 rounded-full" style={{ background: dot <= level ? (level >= 4 ? "#F58A3D" : level >= 3 ? "var(--blue)" : "var(--mint)") : "var(--surface-3)" }} />
      ))}
    </div>
  );
}

export function Page({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`min-h-full ${className}`}
    >
      {children}
    </motion.div>
  );
}
