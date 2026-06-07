import { create } from "zustand";

/**
 * friendStore 使用示例：
 * friendStore.getState().get(id)
 * friendStore.getState().set(id, { id, name: "小明", avatar: "xxx" })
 * friendStore.getState().delete(id)
 * friendStore.getState().clear()
 * friendStore.getState().filter(f => f.dialog === 1)
 */
export const friendStore = create((set, get) => ({
  friends: new Map(),

  /** 获取单个好友 */
  get: (id) => {
    return get().friends.get(id);
  },

  /** 添加或更新好友 */
  set: (id, value) => {
    set((state) => {
      const friends = new Map(state.friends);
      friends.set(id, {
        ...value,
        timestamp: value?.timestamp ?? Date.now(),
      });
      return { friends };
    });
  },

  /** 删除好友 */
  delete: (id) => {
    set((state) => {
      const friends = new Map(state.friends);
      friends.delete(id);
      return { friends };
    });
  },

  /** 清空好友列表 */
  clear: () => {
    set({ friends: new Map() });
  },

  /** 筛选好友，传入回调函数 */
  filter: (predicate) => {
    const friendsArray = Array.from(get().friends.values());
    return friendsArray.filter(predicate);
  },
}));