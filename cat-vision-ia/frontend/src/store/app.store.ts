import { create } from "zustand";

interface AppState {
  mobileNavOpen: boolean;
  setMobileNavOpen: (v: boolean) => void;
  toggleMobileNav: () => void;
  /** Modo foco do analista: maximiza área útil na tela de resultado */
  analystFocusMode: boolean;
  setAnalystFocusMode: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  mobileNavOpen: false,
  setMobileNavOpen: (v) => set({ mobileNavOpen: v }),
  toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),
  analystFocusMode: false,
  setAnalystFocusMode: (v) => set({ analystFocusMode: v }),
}));
