import { QueryClient, QueryObserver } from '@tanstack/query-core';
import localforage from 'localforage';

export const emptyState = Object.freeze({
  data: null, error: null, isPending: false, isFetching: false, isSuccess: false, isError: false,
});

const isInvalidKey = (key) => key.some((v) => v == null);

const toState = (value) => {
  if (!value) return emptyState;
  const { data, error, status, fetchStatus } = value;
  return {
    data: data ?? null,
    error,
    isPending: status === 'pending',
    isFetching: fetchStatus === 'fetching',
    isSuccess: status === 'success',
    isError: status === 'error',
  };
};

// 缓存 localforage 数据库实例
const dbInstances = new Map();

const createLocalForageStorage = (getActiveScope, cacheKey) => {
  const getDb = () => {
    const dbName = String(getActiveScope() || 'QueryClientDefaultDB');
    if (!dbInstances.has(dbName)) {
      dbInstances.set(dbName, localforage.createInstance({ name: dbName }));
    }
    return dbInstances.get(dbName);
  };
  return {
    get: async () => (await getDb().getItem(cacheKey))?.data ?? null,
    set: async (data) => {
      try { await getDb().setItem(cacheKey, { data, ts: Date.now() }); }
      catch (e) { console.warn('[localforage set failed]', e); }
    },
    remove: async () => {
      try { await getDb().removeItem(cacheKey); }
      catch (e) { console.warn('[localforage remove failed]', e); }
    },
  };
};

export const queryClient = new QueryClient();

export function createQueryCache({
  scope = null,
  cacheKey,
  queryFn,
  staleTime = 0,
  retry = 1,
  retryDelay = 1000,
  storage = false,
}) {
  if (!cacheKey || typeof cacheKey !== 'string') throw new Error('[createQueryCache] cacheKey must be a string');
  if (typeof queryFn !== 'function') throw new Error('[createQueryCache] queryFn must be a function');

  const getActiveScope = () => (typeof scope === 'function' ? scope() : scope);
  const storageAdapter = storage ? createLocalForageStorage(getActiveScope, cacheKey) : null;
  const resolveKey = () => {
    const currentScope = getActiveScope();
    const finalKey = currentScope ? [currentScope, cacheKey] : [cacheKey];
    if (isInvalidKey(finalKey)) throw new Error('[createQueryCache] invalid queryKey');
    return finalKey;
  };
  const optionsOf = (key) => ({
    queryKey: key || resolveKey(),
    staleTime, retry, retryDelay, queryFn,
  });

  const get = () => {
    if (storage) {
      console.error(`[QueryCache Error] 缓存 [${cacheKey}] 已启用 storage。同步 get() 无法读取持久化层！请立刻改用 "await getAsync()"，否则无法获取本地存储的数据。`);
    }
    return queryClient.getQueryData(resolveKey());
  };

  const getAsync = async () => {
    if (!storageAdapter) return get();
    const key = resolveKey();
    const memoryData = queryClient.getQueryData(key);
    if (memoryData !== undefined && memoryData !== null) return memoryData;
    const cached = await storageAdapter.get();
    if (cached !== null) queryClient.setQueryData(key, cached);
    return cached;
  };

  const fetch = async () => {
    const key = resolveKey();
    if (storageAdapter) {
      const cached = await storageAdapter.get();
      if (cached) queryClient.setQueryData(key, cached);
    }
    const data = await queryClient.fetchQuery(optionsOf(key));
    if (storageAdapter && data !== undefined) {
      await storageAdapter.set(data);
    }
    return data;
  };

  const refresh = async () => {
    const key = resolveKey();
    await queryClient.invalidateQueries({ queryKey: key });
    const data = await queryClient.fetchQuery(optionsOf(key));
    if (storageAdapter && data !== undefined) await storageAdapter.set(data);
    return data;
  };

  const set = async (data) => {
    const key = resolveKey();
    if (storageAdapter) await storageAdapter.set(data);
    return queryClient.setQueryData(key, data);
  };

  const remove = async () => {
    queryClient.removeQueries({ queryKey: resolveKey(), exact: true });
    if (storageAdapter) await storageAdapter.remove();
    return true;
  };

  const subscribe = (callback) => {
    if (typeof callback !== 'function') return () => { };
    const key = resolveKey();
    const observer = new QueryObserver(queryClient, optionsOf(key));
    const emit = async (result) => {
      const state = toState(result);
      callback(state);
      if (storageAdapter && state.isSuccess) await storageAdapter.set(state.data);
    };
    emit(observer.getCurrentResult());
    return observer.subscribe(emit);
  };

  return {
    get,
    getAsync,
    fetch,
    refresh,
    set,
    remove,
    subscribe
  };
}