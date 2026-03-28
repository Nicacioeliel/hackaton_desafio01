import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAppStore } from "@/store/app.store";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { cn } from "@/lib/utils";

const titles: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": {
    title: "Painel do analista",
    subtitle: "Métricas de triagem e últimas análises de CAT / ACT",
  },
  "/analise/nova": {
    title: "Nova análise",
    subtitle: "Envie o Atestado de Capacidade Técnica e selecione a ART",
  },
  "/historico": {
    title: "Histórico",
    subtitle: "Filtre, reabra e exporte relatórios",
  },
};

function isResultRoute(path: string) {
  return /^\/analise\/\d+$/.test(path);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const mobileOpen = useAppStore((s) => s.mobileNavOpen);
  const setMobileOpen = useAppStore((s) => s.setMobileNavOpen);
  const analystFocusMode = useAppStore((s) => s.analystFocusMode);
  const setAnalystFocusMode = useAppStore((s) => s.setAnalystFocusMode);

  const onResult = isResultRoute(loc.pathname);
  const hideChrome = analystFocusMode && onResult;

  useEffect(() => {
    setMobileOpen(false);
  }, [loc.pathname, setMobileOpen]);

  useEffect(() => {
    if (!onResult) setAnalystFocusMode(false);
  }, [loc.pathname, onResult, setAnalystFocusMode]);

  const meta =
    titles[loc.pathname] ||
    (onResult
      ? { title: "Resultado da análise", subtitle: "Documento × ART × parecer" }
      : { title: "CAT Vision IA" });

  const topTitle = hideChrome
    ? "Modo análise — inspeção documental"
    : meta.title;
  const topSubtitle = hideChrome ? undefined : meta.subtitle;

  return (
    <div className="min-h-screen bg-background">
      {!hideChrome && <Sidebar />}
      <div
        className={cn(
          "flex min-h-screen flex-1 flex-col",
          hideChrome ? "lg:pl-0" : "lg:pl-64",
        )}
      >
        <Topbar
          title={topTitle}
          subtitle={topSubtitle}
          variant={hideChrome ? "compact" : "default"}
        />
        <main
          className={cn(
            "flex-1",
            hideChrome ? "p-3 sm:p-4 lg:p-5" : "p-4 sm:p-6 lg:p-8",
          )}
        >
          {children}
        </main>
      </div>
      {mobileOpen && !hideChrome && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
}
