import { getUserDB, tokenStore } from "utils";
import { userId, deviceId } from "utils/identity"
import { apiMqtt } from "utils/store/apiBase";
import { create } from 'zustand'
import { loginCache2 } from "cache/loginCache";
import { group_list2 } from "cache/group_list";


export const useAuthStore1 = create((set, get) => {
    return {
        loading: false,
        ready: false,
        data: {},
        error: null,

        initCache: async () => {
            const state = get();
            if (state.ready || state.loading) return;
            try {
                set({ loading: true, error: null })
                const uid = userId.get();
                const db = getUserDB(uid);
                const did = deviceId.get();
                const host = apiMqtt.get();
                const token = tokenStore.get()?.token;
                set({ data: { uid, db, did, host, token } })
                set({ ready: true })
            } catch (err) {
                set({ error: err })
                throw err
            } finally {
                set({ loading: false })
            }
        }

    }
});


export const useAuthStore = create((set, get) => {
  return {
    loading: false,
    ready: false,
    error: null,

    initCache: async () => {
      const state = get();
      if (state.ready || state.loading) return;
      try {
        set({ loading: true, error: null })
        await loginCache2.fetch();
        await group_list2.fetch();
        set({ ready: true })
      } catch (err) {
        set({ error: err })
        throw err
      } finally {
        set({ loading: false })
      }
    },

    refresh: async () => {
      const state = get();
      if (state.loading) return;
      try {
        set({ loading: true, error: null })
        await loginCache2.refresh();
        await group_list2.refresh();
      } catch (err) {
        set({ error: err })
        throw err
      } finally {
        set({ loading: false })
      }
    },
  }
})
