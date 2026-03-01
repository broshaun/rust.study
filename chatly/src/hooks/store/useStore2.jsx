import { create } from "zustand";

/**
 * 全局store缓存池：保证同一个key只创建一次store实例（单例模式）
 */
const storeMap = new Map();

/**
 * 带localStorage持久化的单例状态管理Hook
 * 核心特性：
 * 1. 单例模式：同一个key复用store实例，避免重复创建
 * 2. 内置localStorage：自动同步/读取/删除，无需手动操作
 * 3. 精简API：getStore/setStore/hasStore/removeStore
 * @param {string} key 状态唯一标识（默认：default）
 * @returns {Object} Zustand store实例（包含核心方法）
 */
export const useStore = (key = "default") => {
  // 单例复用：已创建过则直接返回
  if (storeMap.has(key)) {
    return storeMap.get(key);
  }

  // 生成localStorage唯一标识（避免冲突）
  const storageKey = `zustand:${key}`;

  /**
   * 安全读取localStorage数据
   * @returns {any} 解析后的数据（解析失败返回undefined）
   */
  const readStorage = () => {
    try {
      const storedValue = localStorage.getItem(storageKey);
      return storedValue ? JSON.parse(storedValue) : undefined;
    } catch (err) {
      console.warn(`读取localStorage失败 [key:${storageKey}]`, err);
      return undefined;
    }
  };

  /**
   * 安全写入数据到localStorage
   * @param {any} value 要存储的值（自动JSON序列化）
   */
  const writeStorage = (value) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (err) {
      console.warn(`写入localStorage失败 [key:${storageKey}]`, err);
    }
  };

  /**
   * 安全删除localStorage中的数据
   */
  const removeStorage = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch (err) {
      console.warn(`删除localStorage失败 [key:${storageKey}]`, err);
    }
  };

  // 创建Zustand store实例
  const store = create((set, get) => ({
    // 初始化值：优先读取localStorage
    value: readStorage(),

    /**
     * 获取当前key对应的状态值
     * @returns {any} 状态值
     */
    getStore: () => get().value,

    /**
     * 设置当前key对应的状态值（同步到localStorage）
     * @param {any} value 新的状态值
     */
    setStore: (value) => {
      writeStorage(value);
      set({ value });
    },

    /**
     * 判断当前key是否有有效状态值（非undefined）
     * @returns {boolean} 是否存在有效状态
     */
    hasStore: () => get().value !== undefined,

    /**
     * 删除当前key对应的状态值（同步删除localStorage）
     */
    removeStore: () => {
      removeStorage();
      set({ value: undefined });
    },
  }));

  // 缓存store实例，保证单例
  storeMap.set(key, store);

  return store;
};