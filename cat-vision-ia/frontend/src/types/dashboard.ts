export interface DashboardMetrics {
  total_analyses: number;
  conformidade_verde: number;
  atencao_amarelo: number;
  divergencia_vermelho: number;
  taxa_divergencias_pct: number;
  tempo_medio_ms: number | null;
  media_risco: number | null;
  top_inconsistencies: { field: string; count: number }[];
  distribuicao_criticidade: { criticality: string; count: number }[];
  distribuicao_status_campos: { status: string; count: number }[];
  normativa_conforme: number;
  normativa_parcial: number;
  normativa_nao_conforme: number;
  taxa_conformidade_normativa_pct: number | null;
  top_normative_violations: { rule_id: string; count: number }[];
}
