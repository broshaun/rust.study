import { create } from "zustand";

/** 使用说明
 * const group = groupStore.getState().get(id);
 * groupStore.getState().set(id, {id,name: "测试群", timestamp: Date.now()});
 * groupStore.getState().delete(id);
 */
export const groupStore = create((set, get) => ({
  groups: new Map(),

  get: (id) => {
    return get().groups.get(id);
  },

  set: (id, value) => {
    set((state) => {
      const groups = new Map(state.groups);
      groups.set(id, {
        ...value, timestamp: value.timestamp ?? Date.now(),
      });
      return { groups };
    });
  },

  delete: (id) => {
    set((state) => {
      const groups = new Map(state.groups);
      groups.delete(id);
      return { groups };
    });
  },

  clear: () => {
    set({ groups: new Map() });
  },
}));