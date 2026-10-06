import { NavLink } from "react-router-dom";
import { BookOpen, ChartLine, House, User, Users } from "lucide-react";

const tabs = [
  { to: "/", label: "Home", icon: House },
  { to: "/invest", label: "Invest", icon: ChartLine },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/squads", label: "Squads", icon: Users },
  { to: "/you", label: "You", icon: User },
];

export function BottomNav() {
  return (
    <nav aria-label="Main" className="shrink-0 border-t border-line bg-bg/95 backdrop-blur-md pb-[max(env(safe-area-inset-bottom),8px)]">
      <ul className="grid grid-cols-5">
        {tabs.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) => `flex flex-col items-center gap-1 pt-2.5 pb-1 text-[11px] font-semibold ${isActive ? "text-ink" : "text-ink-2"}`}
            >
              {({ isActive }) => (
                <>
                  <span className={`grid place-items-center h-8 w-14 rounded-full transition ${isActive ? "bg-mint-soft" : ""}`}>
                    <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} className={isActive ? "text-pos" : ""} />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
