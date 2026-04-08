import { create } from "zustand";

export const useMsgState = create((set) => ({
  current: null,
  setCurrent: (user) => set({ current: user }),
  clearCurrent: () => set({ current: null }),
}));