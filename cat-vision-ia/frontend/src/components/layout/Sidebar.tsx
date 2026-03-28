import { Activity, History, LayoutDashboard, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app.store";

const links = [
  { to: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { to: "/analise/nova", label: "Nova análise", icon: Sparkles },
  { to: "/historico", label: "Histórico", icon: History },
];

export function Sidebar() {
  const open = useAppStore((s) => s.mobileNavOpen);
  const setOpen = useAppStore((s) => s.setMobileNavOpen);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card/95 backdrop-blur-md transition-transform lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-fg font-bold text-sm shadow-glow">
          CV
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-fg">
            CREA-MA
          </p>
          <p className="font-semibold leading-tight">CAT Vision IA</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-fg hover:bg-muted hover:text-foreground",
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2 text-xs text-muted-fg">
          <Activity className="h-4 w-4 shrink-0" />
          <span>Triagem inteligente · apoio à decisão humana</span>
        </div>
      </div>
    </aside>
  );
}
