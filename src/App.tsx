import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useStore } from "./lib/store";
import { BottomNav } from "./components/BottomNav";
import { Celebration, DecodeSheet, NoticeBanner, Toast } from "./components/Overlays";
import { DesktopShell } from "./components/DesktopShell";
import { Onboarding } from "./screens/Onboarding";
import { Home } from "./screens/Home";
import { StashDetail } from "./screens/StashDetail";
import { NewStash } from "./screens/NewStash";
import { Payday } from "./screens/Payday";
import { Invest } from "./screens/Invest";
import { StockDetail } from "./screens/StockDetail";
import { RealityCheck } from "./screens/RealityCheck";
import { Learn } from "./screens/Learn";
import { ByteViewer } from "./screens/ByteViewer";
import { Squads } from "./screens/Squads";
import { You } from "./screens/You";

const tabRoutes = ["/", "/invest", "/learn", "/squads", "/you"];

function useViewport() {
  const read = () => ({ width: window.innerWidth, height: window.innerHeight });
  const [viewport, setViewport] = useState(read);
  useEffect(() => {
    const listener = () => setViewport(read());
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, []);
  return viewport;
}

function StatusBar() {
  return (
    <div className="shrink-0 h-11 px-7 flex items-center justify-between text-[15px] font-semibold text-ink bg-bg" aria-hidden="true">
      <span>9:41</span>
      <span className="flex items-center gap-1.5">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5" width="3" height="7" rx="1" /><rect x="10" y="2" width="3" height="10" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none"><rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke="currentColor" opacity="0.4" /><rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor" /><rect x="24" y="4" width="2" height="4" rx="1" fill="currentColor" opacity="0.4" /></svg>
      </span>
    </div>
  );
}

function Phone({ framed }: { framed: boolean }) {
  const location = useLocation();
  const onboarded = useStore((state) => state.onboarded);
  const scroller = useRef<HTMLDivElement>(null);
  const showNav = onboarded && tabRoutes.includes(location.pathname);
  const fullBleed = location.pathname.startsWith("/learn/") || location.pathname === "/welcome";

  const openDecode = useStore((state) => state.openDecode);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
    openDecode(null);
  }, [location.pathname, openDecode]);

  const guard = (element: ReactNode) => (onboarded ? element : <Navigate to="/welcome" replace />);

  return (
    <div
      className={
        framed
          ? "relative w-[390px] h-[844px] rounded-[54px] bg-bg overflow-hidden flex flex-col shadow-[0_30px_80px_-20px_rgba(16,24,40,0.35)] ring-[10px] ring-[#111214]"
          : "relative h-[100dvh] w-full bg-bg overflow-hidden flex flex-col"
      }
    >
      {framed && !fullBleed && <StatusBar />}
      <div ref={scroller} id="scroller" className="relative flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/welcome" element={onboarded ? <Navigate to="/" replace /> : <Onboarding />} />
            <Route path="/" element={guard(<Home />)} />
            <Route path="/stash/:id" element={guard(<StashDetail />)} />
            <Route path="/new-stash" element={guard(<NewStash />)} />
            <Route path="/payday" element={guard(<Payday />)} />
            <Route path="/invest" element={guard(<Invest />)} />
            <Route path="/stock/:ticker" element={guard(<StockDetail />)} />
            <Route path="/fno" element={guard(<RealityCheck />)} />
            <Route path="/learn" element={guard(<Learn />)} />
            <Route path="/learn/:id" element={guard(<ByteViewer />)} />
            <Route path="/squads" element={guard(<Squads />)} />
            <Route path="/you" element={guard(<You />)} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
      {showNav && <BottomNav />}
      <div id="overlay-root" className="absolute inset-0 z-50 pointer-events-none">
        <NoticeBanner />
        <Toast />
      </div>
      <DecodeSheet />
      <Celebration />
    </div>
  );
}

export default function App() {
  const dark = useStore((state) => state.settings.dark);
  const { width, height } = useViewport();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // phone-sized screens get the app itself; anything bigger gets the scaled presentation stage
  if (width < 600 || Math.min(width, height) < 520) return <Phone framed={false} />;
  return (
    <DesktopShell width={width} height={height}>
      <Phone framed />
    </DesktopShell>
  );
}
