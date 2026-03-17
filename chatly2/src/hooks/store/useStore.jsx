import { create } from ".pnpm/zustand@5.0.12_@types+react@19.2.14_react@19.2.4/node_modules/zustand";

/**
 * 全局缓存池：存储 store 实例、元信息、监听标识
 * 避免重复创建，保证单例模式
 */
const storeMap = new Map();
const metaMap = new Map();
const listenerMap = new Map();

/**
 * 判断当前环境是否支持 localStorage
 * @returns {boolean} 是否支持
 */
const canUseStorage = () => {
  return typeof window !== "undefined" && !!window.localStorage;
};

/**
 * 安全解析 JSON 字符串（避免解析失败报错）
 * @param {string | null} v 从 localStorage 获取的字符串
 * @returns {any} 解析后的数据或 undefined
 */
const safeParse = (v) => {
  if (!v) return undefined;
  try {
    return JSON.parse(v);
  } catch {
    return undefined;
  }
};

/**
 * 安全序列化数据为 JSON 字符串（避免序列化失败报错）
 * @param {any} v 要序列化的数据
 * @returns {string | undefined} 序列化后的字符串或 undefined
 */
const safeStringify = (v) => {
  try {
    return JSON.stringify(v);
  } catch {
    return undefined;
  }
};

/**
 * 带 localStorage 持久化、跨标签页同步的单例 Zustand Hook
 * 核心特性：
 * 1. 单例模式：同一个 key 复用 store 实例，避免重复创建
 * 2. 持久化：自动同步数据到 localStorage，页面刷新不丢失
 * 3. 跨标签页同步：支持监听 storage 事件，多标签页数据同步
 * 4. 默认值固定：首次创建的 defaultValue 全局有效，不被后续覆盖
 * @param {string} key 状态唯一标识（默认：default）
 * @param {Object} [options] 配置项
 * @param {any} [options.defaultValue] 初始默认值
 * @param {boolean} [options.listenStorageChange] 是否监听跨标签页存储变化
 * @returns {ReturnType<typeof create>} Zustand store 实例
 */
export const useStore = (key = "default", options) => {
  // 解构配置项，设置默认值（避免 undefined 报错）
  const { defaultValue, listenStorageChange = false } = options || {};
  const storageKey = `zustand:${key}`;

  // ✅ 已存在：直接复用 store 实例 + 支持后补挂载跨标签页监听
  if (storeMap.has(key)) {
    const store = storeMap.get(key);
    const meta = metaMap.get(key); // 保证 defaultValue 全局固定

    if (
      listenStorageChange &&
      typeof window !== "undefined" &&
      !listenerMap.get(meta.storageKey)
    ) {
      window.addEventListener("storage", (e) => {
        if (e.key !== meta.storageKey) return;
        const v = safeParse(e.newValue);
        store.setState({ value: v === undefined ? meta.defaultValue : v });
      });
      listenerMap.set(meta.storageKey, true);
    }

    return store;
  }

  // ✅ 首次创建：固定 defaultValue，存入元信息缓存
  metaMap.set(key, { storageKey, defaultValue });

  /**
   * 从 localStorage 读取数据，无数据则返回默认值
   * @returns {any} 读取到的数据或默认值
   */
  const readStorage = () => {
    if (!canUseStorage()) return defaultValue;
    const v = safeParse(localStorage.getItem(storageKey));
    return v === undefined ? defaultValue : v;
  };

  /**
   * 写入数据到 localStorage
   * @param {any} value 要写入的数据
   */
  const writeStorage = (value) => {
    if (!canUseStorage()) return;
    const s = safeStringify(value);
    if (s !== undefined) {
      localStorage.setItem(storageKey, s);
    }
  };

  /**
   * 从 localStorage 中删除对应数据
   */
  const removeStorage = () => {
    if (!canUseStorage()) return;
    localStorage.removeItem(storageKey);
  };

  // 创建 Zustand store 实例，保留所有核心功能
  const store = create((set, get) => ({
    value: readStorage(),

    /**
     * 获取当前 key 对应的状态值
     * @returns {any} 状态值
     */
    getStore: () => get().value,

    /**
     * 设置当前 key 对应的状态值（支持直接赋值/函数式更新）
     * @param {any | ((prev: any) => any)} next 新值或函数式更新回调
     */
    setStore: (next) => {
      const prev = get().value;
      const value = typeof next === "function" ? next(prev) : next;
      writeStorage(value);
      set({ value });
    },

    /**
     * 判断当前 key 是否有有效状态值（非 undefined）
     * @returns {boolean} 是否存在有效状态
     */
    hasStore: () => get().value !== undefined,

    /**
     * 删除当前 key 对应的状态值，重置为默认值
     */
    removeStore: () => {
      removeStorage();
      set({ value: defaultValue });
    },
  }));

  // ✅ 首次创建：挂载跨标签页监听（去重，避免重复绑定）
  if (
    listenStorageChange &&
    typeof window !== "undefined" &&
    !listenerMap.get(storageKey)
  ) {
    window.addEventListener("storage", (e) => {
      if (e.key !== storageKey) return;
      const v = safeParse(e.newValue);
      store.setState({ value: v === undefined ? defaultValue : v });
    });
    listenerMap.set(storageKey, true);
  }

  // 缓存 store 实例，保证单例
  storeMap.set(key, store);
  return store;
};