import { create } from "zustand";
import { Store } from "@tauri-apps/plugin-store";

/**
 * ==========================================
 * createSharedStore
 * ==========================================
 *
 * Zustand + Tauri Store 的共享状态工厂
 *
 * 功能：
 * 1. 创建可复用的 Zustand store
 * 2. 自动持久化到 Tauri Store
 * 3. 同 key 单例复用
 *
 * 注意：
 * - 同 key 的 defaultValue 以首次创建为准
 * - value 初始可能先为 defaultValue，直到 loaded = true
 */

const storeMap = new Map();
let tauriStorePromise;

async function getTauriStore() {
  if (!tauriStorePromise) {
    tauriStorePromise = Store.load("app-store.json");
  }
  return tauriStorePromise;
}

export const createSharedStore = (key, { defaultValue } = {}) => {
  if (storeMap.has(key)) {
    return storeMap.get(key);
  }

  const store = create((set, get) => ({
    value: defaultValue,
    loaded: false,
    loading: false,

    setStore: async (next) => {
      const prev = get().value;
      const value = typeof next === "function" ? next(prev) : next;

      set({ value });

      const tauriStore = await getTauriStore();
      await tauriStore.set(key, value);
      await tauriStore.save();

      return value;
    },

    removeStore: async () => {
      set({ value: defaultValue });

      const tauriStore = await getTauriStore();
      await tauriStore.delete(key);
      await tauriStore.save();
    },

    loadStore: async () => {
      const { loaded, loading } = get();
      if (loaded || loading) return;

      set({ loading: true });

      try {
        const tauriStore = await getTauriStore();
        const v = await tauriStore.get(key);

        set({
          value: v === undefined ? defaultValue : v,
          loaded: true,
          loading: false,
        });
      } catch (error) {
        console.error(`[createSharedStore] loadStore failed for key "${key}"`, error);

        set({
          value: defaultValue,
          loaded: true,
          loading: false,
        });
      }
    },
  }));

  store.getState().loadStore();

  storeMap.set(key, store);

  return store;
};