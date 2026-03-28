import type { AnalysisDetail, AnalysisListItem } from "@/types/analysis";
import { api } from "./api";

export function createAnalysis(uploadId: number, artId: number) {
  return api.postJson<AnalysisDetail>("/api/v1/analyses", {
    upload_id: uploadId,
    art_id: artId,
  });
}

export function fetchAnalysis(id: number) {
  return api.get<AnalysisDetail>(`/api/v1/analyses/${id}`);
}

export interface ListAnalysesParams {
  status?: string;
  art_q?: string;
  q?: string;
  risk_min?: number;
  risk_max?: number;
  sort?: "date_desc" | "risk_desc" | "risk_asc";
  skip?: number;
  limit?: number;
  normative_status?: "CONFORME" | "PARCIAL" | "NAO_CONFORME";
}

export function fetchAnalyses(params?: ListAnalysesParams) {
  const sp = new URLSearchParams();
  if (params?.status) sp.set("status", params.status);
  if (params?.art_q) sp.set("art_q", params.art_q);
  if (params?.q) sp.set("q", params.q);
  if (params?.risk_min != null) sp.set("risk_min", String(params.risk_min));
  if (params?.risk_max != null) sp.set("risk_max", String(params.risk_max));
  if (params?.sort) sp.set("sort", params.sort);
  if (params?.normative_status)
    sp.set("normative_status", params.normative_status);
  if (params?.skip != null) sp.set("skip", String(params.skip));
  if (params?.limit != null) sp.set("limit", String(params.limit));
  const q = sp.toString();
  return api.get<AnalysisListItem[]>(`/api/v1/analyses${q ? `?${q}` : ""}`);
}

export function patchAnalysisReview(id: number, review_status: string) {
  return api.patchJson<AnalysisDetail>(`/api/v1/analyses/${id}/review`, {
    review_status,
  });
}

export function regenerateTechnicalOpinion(id: number) {
  return api.postJson<AnalysisDetail>(`/api/v1/analyses/${id}/parecer`, {});
}

export function exportJsonUrl(id: number) {
  return api.downloadUrl(`/api/v1/analyses/${id}/export/json`);
}

export function exportCsvUrl(id: number) {
  return api.downloadUrl(`/api/v1/analyses/${id}/export/csv`);
}

export function exportPdfUrl(id: number) {
  return api.downloadUrl(`/api/v1/analyses/${id}/export/pdf`);
}

export function exportTxtUrl(id: number) {
  return api.downloadUrl(`/api/v1/analyses/${id}/export/txt`);
}
