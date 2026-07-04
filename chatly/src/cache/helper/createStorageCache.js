import { QueryClient, QueryObserver } from '@tanstack/query-core';
import localforage from 'localforage';

export const emptyState = Object.freeze({ data: null, error: null, isPending: false, isFetching: false, isSuccess: false, isError: false });
export const queryClient = new QueryClient();
const dbInstances = new Map();

const toState = (v) => v ? {
    data: v.data ?? null, error: v.error,
    isPending: v.status === 'pending', isFetching: v.fetchStatus === 'fetching',
    isSuccess: v.status === 'success', isError: v.status === 'error',
} : emptyState;

export function createStorageCache({
    scope = null,
    cacheKey,
    queryFn,
    retry = 1,
    retryDelay = 1000
}) {
    if (!cacheKey || typeof cacheKey !== 'string' || typeof queryFn !== 'function') throw new Error('[createStorageCache] Invalid parameters');

    const getActiveScope = () => typeof scope === 'function' ? scope() : scope;
    const resolveKey = () => getActiveScope() ? [getActiveScope(), cacheKey] : [cacheKey];

    // 🎯 对内闭包默认：内存生命周期无限长（因为以本地磁盘数据为准）
    const optionsOf = (key) => ({
        queryKey: key || resolveKey(),
        staleTime: Infinity,
        gcTime: Infinity, // 确保内存不主动销毁镜像缓存
        retry,
        retryDelay,
        queryFn
    });

    let cachedDb = null;
    const getDb = () => {
        if (cachedDb) return cachedDb;
        const dbName = String(getActiveScope() || 'QueryClientStorageDB');
        cachedDb = dbInstances.get(dbName) || localforage.createInstance({ name: dbName });
        dbInstances.set(dbName, cachedDb);
        return cachedDb;
    };

    const getAsync = async () => {
        try { return (await getDb().getItem(cacheKey))?.data ?? null; } catch { return null; }
    };

    const fetch = async () => {
        const key = resolveKey();
        const cached = await getAsync();

        if (cached !== null && cached !== undefined) {
            queryClient.setQueryData(key, cached);
            return cached;
        }

        const data = await queryClient.fetchQuery(optionsOf(key));
        if (data !== undefined) {
            try { await getDb().setItem(cacheKey, { data, ts: Date.now() }); } catch { }
        }
        return data;
    };

    const refresh = async () => {
        const key = resolveKey();
        const opts = optionsOf(key);

        // 🎯 只有在主动刷新时，才临时穿透内存，强制触发网络请求
        opts.staleTime = 0;

        const data = await queryClient.fetchQuery(opts);
        if (data !== undefined) {
            try { await getDb().setItem(cacheKey, { data, ts: Date.now() }); } catch { }
        }
        return data;
    };

    const set = async (data) => {
        const key = resolveKey();
        try { await getDb().setItem(cacheKey, { data, ts: Date.now() }); } catch { }
        return queryClient.setQueryData(key, data);
    };

    const remove = async () => {
        queryClient.removeQueries({ queryKey: resolveKey(), exact: true });
        try { await getDb().removeItem(cacheKey); } catch { }
        return true;
    };

    const subscribe = (callback) => {
        if (typeof callback !== 'function') return () => { };
        const observer = new QueryObserver(queryClient, optionsOf());
        const emit = (result) => callback(toState(result));
        emit(observer.getCurrentResult());
        return observer.subscribe(emit);
    };

    return {
        getAsync,
        fetch,
        refresh,
        set,
        remove,
        subscribe
    };
}