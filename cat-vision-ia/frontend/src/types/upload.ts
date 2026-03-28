export interface UploadRecord {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  sha256: string;
  creator: string | null;
  producer: string | null;
  created_at_pdf: string | null;
  modified_at_pdf: string | null;
  suspicious_metadata_flag: boolean;
  uploaded_at: string | null;
}
