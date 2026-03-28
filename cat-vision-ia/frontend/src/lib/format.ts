export function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function statusLabel(s: string) {
  const m: Record<string, string> = {
    VERDE: "Compatível",
    AMARELO: "Atenção",
    VERMELHO: "Divergência / risco",
    COMPATIVEL: "Compatível",
    AUSENTE: "Ausente",
    DIVERGENTE: "Divergente",
    NAO_VERIFICADO: "Não verificado",
  };
  return m[s] ?? s;
}
