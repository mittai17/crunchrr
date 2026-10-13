import { create } from "zustand";
export const useShellStore = create<{
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  focus: boolean;
  setFocus: (value: boolean) => void;
}>((set) => ({
  collapsed: false,
  setCollapsed: (collapsed) => set({ collapsed }),
  focus: false,
  setFocus: (focus) => set({ focus }),
}));
