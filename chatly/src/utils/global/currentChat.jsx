import { create } from "zustand";

/**
 * 使用说明
 *
 * currentChat.getState().get("friend")
 * currentChat.getState().get("group")
 *
 * currentChat.getState().set("friend", {id:"u1001"})
 * currentChat.getState().set("group", {id:"g1001"})
 *
 * currentChat.getState().delete("friend")
 *
 * currentChat.getState().clear()
 */
export const currentChat = create((set, get) => ({
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