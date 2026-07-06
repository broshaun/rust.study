import { QueryObserver } from '@tanstack/query-core';
import { queryClient } from './createClient';


export const emptyState = Object.freeze({
    data: null,
    error: null,
    isPending: false,
    isFetching: false,
    isSuccess: false,
    isError: false
});


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
    retryDelay = 1000,
    stored = null
}) {
    if (!cacheKey || typeof cacheKey !== 'string' || typeof queryFn !== 'function') throw new Error('[createStorageCache] Invalid parameters');

    const resolveKey = () => {
        const s = typeof scope === 'function' ? scope() : scope;
        return s ? [s, cacheKey] : [cacheKey];
    };

    const optionsOf = () => ({ queryKey: resolveKey(), staleTime: Infinity, gcTime: Infinity, retry, retryDelay, queryFn });

    // 🎯 统一提取底层 DB 读写查删，彻底消灭外层的重复 try-catch 噪音代码
    const getTbl = () => typeof stored === 'function' ? stored() : stored;
    const dbGet = async () => { try { const t = getTbl(); return t ? (await t.get(cacheKey))?.data ?? null : null; } catch { return null; } };
    const dbPut = async (data) => { try { const t = getTbl(); if (t) await t.put({ id: cacheKey, data, timestamp: Date.now() }); } catch { } };
    const dbDel = async () => { try { const t = getTbl(); if (t) await t.delete(cacheKey); } catch { } };

    const getAsync = () => dbGet();

    const fetch = async () => {
        const cached = await dbGet();
        // cached != null 同时等价于排除 null 和 undefined
        if (cached != null) return queryClient.setQueryData(resolveKey(), cached), cached;

        const data = await queryClient.fetchQuery(optionsOf());
        if (data !== undefined) await dbPut(data);
        return data;
    };

    const refresh = async () => {
        const opts = optionsOf();
        opts.staleTime = 0; // 主动刷新穿透内存

        const data = await queryClient.fetchQuery(opts);
        if (data !== undefined) await dbPut(data);
        return data;
    };

    const set = async (data) => {
        await dbPut(data);
        return queryClient.setQueryData(resolveKey(), data);
    };

    const remove = async () => {
        queryClient.removeQueries({ queryKey: resolveKey(), exact: true });
        await dbDel();
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