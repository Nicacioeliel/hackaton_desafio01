import type { ArtListResponse } from "@/types/art";
import { api } from "./api";

export function fetchArts(q?: string) {
  const qs = q ? `?q=${encodeURIComponent(q)}` : "";
  return api.get<ArtListResponse>(`/api/v1/arts${qs}`);
}

export function fetchArt(id: number) {
  return api.get(`/api/v1/arts/${id}`);
}
