export interface FieldResult {
  id: number;
  field_name: string;
  art_value: string | null;
  extracted_value: string | null;
  normalized_art_value: string | null;
  normalized_extracted_value: string | null;
  status: string;
  confidence: number | null;
  justification: string | null;
  criticality?: string | null;
  category?: string | null;
  evidence_excerpt?: string | null;
  evidence_page?: number | null;
  score_impact?: number | null;
  normative_conformity?: string | null;
  regulatory_impact?: string | null;
  applied_rules?: Array<Record<string, unknown>>;
}

export interface NormativeRuleRow {
  rule_id: string;
  nome: string;
  resolucao: string;
  resolucao_versao?: string;
  artigo: string;
  obrigatoriedade: string;
  campo_relacionado: string | null;
  tipo_validacao: string;
  status: string;
  severidade: string;
  justificativa: string;
  impacto_regulatorio: string;
}

export interface NormativeBreakdown {
  normative_score: number;
  normative_status: string;
  violations_critical: number;
  violations_medium: number;
  violations_low: number;
  obligatory_met: number;
  obligatory_total: number;
  lines: string[];
  top_violations: Array<{ rule_id?: string; nome?: string; status?: string }>;
}

/** Breakdown explicável do score (API `score_breakdown`) */
export interface ScoreBreakdown {
  risk_score: number;
  lines: string[];
  counts: {
    divergencias_criticas: number;
    divergencias_medias: number;
    divergencias_baixas: number;
    ausentes: number;
    nao_identificados: number;
    nao_verificados: number;
    alerta_metadado: boolean;
    cnpj_api_indisponivel: boolean;
  };
  fields_criticos: string[];
}

export interface TableExtraction {
  id: number;
  table_name: string;
  csv_content: string | null;
  json_content: string | null;
}

export interface CnpjValidation {
  id: number;
  cnpj_consultado: string;
  razao_social_api: string | null;
  situacao_cadastral: string | null;
  status: string;
}

export interface AnalysisDetail {
  id: number;
  art_id: number;
  upload_id: number;
  upload_mime_type?: string | null;
  upload_original_name?: string | null;
  upload_suspicious_metadata?: boolean | null;
  overall_status: string;
  risk_score: number;
  executive_summary: string | null;
  suggested_feedback: string | null;
  cnpj_status: string | null;
  processing_time_ms: number | null;
  created_at: string | null;
  field_results: FieldResult[];
  tables: TableExtraction[];
  cnpj_validation: CnpjValidation | null;
  technical_opinion?: string | null;
  score_breakdown?: ScoreBreakdown | null;
  review_status?: string | null;
  normative_score?: number | null;
  normative_status?: string | null;
  normative_breakdown?: NormativeBreakdown | null;
  normative_rules?: NormativeRuleRow[];
}

export interface AnalysisListItem {
  id: number;
  art_id: number;
  upload_id: number;
  overall_status: string;
  risk_score: number;
  cnpj_status: string | null;
  created_at: string | null;
  art_numero: string | null;
  upload_original_name: string | null;
  summary_hint?: string | null;
  normative_score?: number | null;
  normative_status?: string | null;
}
