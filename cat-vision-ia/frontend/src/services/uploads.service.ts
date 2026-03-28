import type { UploadRecord } from "@/types/upload";
import { api } from "./api";

export function uploadFile(file: File) {
  return api.upload<UploadRecord>("/api/v1/uploads", file);
}

export function uploadFileUrl(id: number) {
  return api.downloadUrl(`/api/v1/uploads/${id}/file`);
}
