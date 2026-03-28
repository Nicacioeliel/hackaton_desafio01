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
    NAO_IDENTIFICADO: "Não identificado (OCR)",
    OK: "Verificado (API)",
  };
  return m[s] ?? s;
}

export function criticalityLabel(c: string | null | undefined) {
  if (!c) return "—";
  const u = c.toUpperCase();
  if (u === "CRITICA" || u === "CRÍTICA") return "Crítica";
  if (u === "MEDIA" || u === "MÉDIA") return "Média";
  if (u === "BAIXA") return "Baixa";
  if (u === "NENHUMA") return "—";
  return c;
}

export function confidenceLabel(conf: number | null | undefined): string {
  if (conf == null || Number.isNaN(conf)) return "—";
  const v = conf > 1 ? conf / 100 : conf;
  if (v >= 0.85) return "Alta";
  if (v >= 0.55) return "Média";
  return "Baixa";
}

export function confidencePercent(conf: number | null | undefined): string {
  if (conf == null || Number.isNaN(conf)) return "—";
  const v = conf > 1 ? conf : conf * 100;
  return `${Math.round(v)}%`;
}
