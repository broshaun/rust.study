import { create } from "zustand";
import { Store } from "@tauri-apps/plugin-store";

/**
 * ==========================================
 * useSharedStore
 * ==========================================
 *
 * 基于 Zustand + Tauri Store 的全局共享状态 Hook
 *
 * 功能：
 * 1. 全局状态共享（Zustand）
 * 2. 本地持久化（Tauri Store）
 * 3. 同 key 单例 store
 * 4. React useEffect 自动监听变化
 */

const storeMap = new Map();

const tauriStore = new Store("app-store.json");

export const useSharedStore = (key, { defaultValue } = {}) => {
  if (storeMap.has(key)) {
    return storeMap.get(key);
  }

  const store = create((set, get) => ({
    value: defaultValue,

    setStore: async (next) => {
      const prev = get().value;
      const value = typeof next === "function" ? next(prev) : next;

      set({ value });

      await tauriStore.set(key, value);
      await tauriStore.save();

      return value;
    },

    removeStore: async () => {
      set({ value: defaultValue });

      await tauriStore.delete(key);
      await tauriStore.save();
    },

    loadStore: async () => {
      const v = await tauriStore.get(key);

      set({
        value: v === undefined ? defaultValue : v,
      });
    },
  }));

  // 初始化加载
  store.getState().loadStore();

  storeMap.set(key, store);

  return store;
};