import { create } from 'zustand';


export const useTitle = create((set) => ({
  title: '标题',
  setTitle: (newTitle) => set({ title: newTitle }),
  clearTitle: () => set({ title: '' }),
}));
