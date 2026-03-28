export interface DashboardMetrics {
  total_analyses: number;
  conformidade_verde: number;
  atencao_amarelo: number;
  divergencia_vermelho: number;
  taxa_divergencias_pct: number;
  tempo_medio_ms: number | null;
  top_inconsistencies: { field: string; count: number }[];
}
