import { create } from "zustand";

export const currentChat = create((set) => ({
  current: null,
  setCurrent: (user) => set({ current: user }),
  clearCurrent: () => set({ current: null }),
}));