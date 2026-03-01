import { create } from "zustand";


const storeMap = new Map();
export const useGlobal = (key = "default") => {
  if (storeMap.has(key)) return storeMap.get(key);
  const store = create((set, get) => ({
    data: {},
    getStore: () => get().data[key],
    setStore: (value) => set((state) => ({ data: { ...state.data, [key]: value } })),
    hasStore: () => Object.hasOwn(get().data, key),
    removeStore: () =>
      set((state) => {
        if (!Object.hasOwn(state.data, key)) return state;
        const { [key]: _, ...rest } = state.data;
        return { data: rest };
      }),
  }));
  storeMap.set(key, store);
  return store;
};
