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

export function fetchAnalyses(params?: { status?: string; art_q?: string }) {
  const sp = new URLSearchParams();
  if (params?.status) sp.set("status", params.status);
  if (params?.art_q) sp.set("art_q", params.art_q);
  const q = sp.toString();
  return api.get<AnalysisListItem[]>(`/api/v1/analyses${q ? `?${q}` : ""}`);
}

export function exportJsonUrl(id: number) {
  return api.downloadUrl(`/api/v1/analyses/${id}/export/json`);
}

export function exportCsvUrl(id: number) {
  return api.downloadUrl(`/api/v1/analyses/${id}/export/csv`);
}
