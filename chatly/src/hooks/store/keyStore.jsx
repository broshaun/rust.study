import { create } from "zustand";
import { Store } from "@tauri-apps/plugin-store";

/**
 * ==========================================
 * useKeyStore
 * ==========================================
 *
 * 基于 Zustand + Tauri Store 的全局状态管理 Hook
 *
 * 功能：
 * 1. 全局状态共享（Zustand）
 * 2. 持久化存储（Tauri Store）
 * 3. 同一个 key 只创建一个 store（单例）
 * 4. 支持 React useEffect 监听变化
 *
 * 数据流程：
 *
 * React Component
 *        ↓
 *     Zustand Store
 *        ↓
 *   Tauri Store (JSON)
 *
 * Zustand 负责：
 * - 响应式状态
 * - 组件更新
 *
 * Tauri Store 负责：
 * - 本地持久化
 * - 应用重启数据保留
 *
 * ------------------------------------------
 * 基本使用
 * ------------------------------------------
 *
 * 1️⃣ 创建 store
 *
 * import { useKeyStore } from "@/stores/keyStore";
 *
 * export const useTokenStore = useKeyStore("token", {
 *   defaultValue: ""
 * });
 *
 *
 * 2️⃣ 在组件中使用
 *
 * const token = useTokenStore((s) => s.value);
 * const setToken = useTokenStore((s) => s.setStore);
 *
 *
 * 3️⃣ 修改值
 *
 * await setToken("abc123");
 *
 *
 * 4️⃣ 删除值
 *
 * await useTokenStore.getState().removeStore();
 *
 *
 * 5️⃣ useEffect 监听变化
 *
 * const token = useTokenStore((s) => s.value);
 *
 * useEffect(() => {
 *   console.log("token changed:", token);
 * }, [token]);
 *
 *
 * ------------------------------------------
 * API
 * ------------------------------------------
 *
 * useKeyStore(key, options)
 *
 * 参数：
 *
 * key: string
 *   store 唯一标识
 *
 * options.defaultValue: any
 *   默认值
 *
 *
 * ------------------------------------------
 * Store State
 * ------------------------------------------
 *
 * value
 *   当前状态值
 *
 *
 * ------------------------------------------
 * Store Methods
 * ------------------------------------------
 *
 * setStore(value)
 *   设置值并持久化
 *
 * removeStore()
 *   删除值并恢复默认值
 *
 * loadStore()
 *   从 Tauri Store 加载数据
 *
 *
 * ------------------------------------------
 * 示例
 * ------------------------------------------
 *
 * // tokenStore.js
 *
 * export const useTokenStore = useKeyStore("token", {
 *   defaultValue: ""
 * });
 *
 *
 * // component.jsx
 *
 * const token = useTokenStore((s) => s.value);
 * const setToken = useTokenStore((s) => s.setStore);
 *
 * useEffect(() => {
 *   console.log("token changed:", token);
 * }, [token]);
 *
 *
 * ------------------------------------------
 * 持久化文件
 * ------------------------------------------
 *
 * 默认存储文件：
 *
 * app-store.json
 *
 * 示例：
 *
 * {
 *   "token": "abc123",
 *   "theme": "dark"
 * }
 *
 */

const storeMap = new Map();

const tauriStore = new Store("app-store.json");

export const useKeyStore = (key, { defaultValue } = {}) => {
  if (storeMap.has(key)) {
    return storeMap.get(key);
  }

  const store = create((set, get) => ({
    value: defaultValue,

    /**
     * 设置值（支持函数式更新）
     */
    setStore: async (next) => {
      const prev = get().value;
      const value = typeof next === "function" ? next(prev) : next;

      set({ value });

      await tauriStore.set(key, value);
      await tauriStore.save();

      return value;
    },

    /**
     * 删除值
     */
    removeStore: async () => {
      set({ value: defaultValue });

      await tauriStore.delete(key);
      await tauriStore.save();
    },

    /**
     * 从持久化存储加载
     */
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