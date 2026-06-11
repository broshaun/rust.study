import { create } from "zustand";

/**
 * 使用说明
 *
 * currentAwait.getState().get("friend")
 * currentAwait.getState().get("group")
 *
 * currentAwait.getState().set("friend", 10)
 * currentAwait.getState().set("group", 20)
 *
 * currentAwait.getState().delete("friend")
 *
 * currentAwait.getState().clear()
 */
export const currentAwait = create((set, get) => ({
  current: new Map(),

  get: (key) => {
    return get().current.get(key);
  },

  set: (key, value) => {
    set((state) => {
      const current = new Map(state.current);

      current.set(key, value);

      return { current };
    });
  },

  delete: (key) => {
    set((state) => {
      const current = new Map(state.current);

      current.delete(key);

      return { current };
    });
  },

  clear: () => {
    set({
      current: new Map(),
    });
  },
}));