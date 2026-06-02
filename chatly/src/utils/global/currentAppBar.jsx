import { create } from "zustand";
export { GlobalAppBar } from "./components/GlobalAppBar"



export const currentAppBar = create((set) => ({
  title: "主页",
  leftPath: null,
  rightIcon: null,
  rightPath: null,

  setTitle: (title) => set({ title }),
  setLeftPath: (leftPath) => set({ leftPath }),
  setRightIcon: (rightIcon) => set({ rightIcon }),
  setRightPath: (rightPath) => set({ rightPath }),
  clearAppBar: () => set({ title: "", leftPath: null, rightIcon: null, rightPath: null }),
}));

