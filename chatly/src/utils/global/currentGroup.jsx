import { create } from "zustand";

export const currentGroup = create((set) => ({
  current: null,
  setCurrent: (group) => set({ current: group }),
  clearCurrent: () => set({ current: null }),
}));