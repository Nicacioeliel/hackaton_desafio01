import { create } from "zustand";
import type { UploadRecord } from "@/types/upload";
import type { Art } from "@/types/art";

interface DraftState {
  upload: UploadRecord | null;
  selectedArt: Art | null;
  setUpload: (u: UploadRecord | null) => void;
  setSelectedArt: (a: Art | null) => void;
  reset: () => void;
}

export const useAnalysisDraft = create<DraftState>((set) => ({
  upload: null,
  selectedArt: null,
  setUpload: (u) => set({ upload: u }),
  setSelectedArt: (a) => set({ selectedArt: a }),
  reset: () => set({ upload: null, selectedArt: null }),
}));
