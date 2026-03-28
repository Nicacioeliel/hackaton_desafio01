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
}
