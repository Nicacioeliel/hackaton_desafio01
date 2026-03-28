import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAppStore } from "@/store/app.store";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

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

export function AppShell({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const mobileOpen = useAppStore((s) => s.mobileNavOpen);
  const setMobileOpen = useAppStore((s) => s.setMobileNavOpen);

  const meta =
    titles[loc.pathname] ||
    (loc.pathname.startsWith("/analise/")
      ? { title: "Resultado da análise", subtitle: "Documento × ART × parecer" }
      : { title: "CAT Vision IA" });

  useEffect(() => {
    setMobileOpen(false);
  }, [loc.pathname, setMobileOpen]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <Topbar title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
      {mobileOpen && (
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
