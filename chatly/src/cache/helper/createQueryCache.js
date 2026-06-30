import { QueryClient, QueryObserver } from '@tanstack/query-core';

export const queryClient = new QueryClient();

export const emptyState = { data: null, error: null, isPending: false, isFetching: false, isSuccess: false, isError: false };

const toState = (value) =>
    value ? {
        data: value.data ?? null,
        error: value.error ?? null,
        isPending: value.status === 'pending',
        isFetching: value.fetchStatus === 'fetching',
        isSuccess: value.status === 'success',
        isError: value.status === 'error',
    } : emptyState;

export function createQueryCache({
    cacheKey, // 👈 现在作为核心钥匙，支持数组，也支持返回数组的函数 () => []
    queryFn,
    staleTime = 0,
    retry = 1,
    retryDelay = 1000,
}) {
    if (!cacheKey) throw new Error('[createQueryCache] cacheKey is required');
    if (typeof queryFn !== 'function') throw new Error('[createQueryCache] queryFn must be a function');

    // 💡 核心优化：解析动态的 CacheKey
    const getQueryKey = () => {
        // 如果 cacheKey 是个函数，执行它获取最新数组；如果是普通数组，直接用
        const resolvedKey = typeof cacheKey === 'function' ? cacheKey() : cacheKey;

        // 确保解析出来的是个数组
        const keyArray = Array.isArray(resolvedKey) ? resolvedKey : [resolvedKey];

        // 防御性校验：如果数组里包含了 null/undefined（说明 Session 还没准备好），拦截报错
        if (keyArray.some(v => v == null)) {
            throw new Error('[createQueryCache] invalid queryKey: some values are null or undefined');
        }
        return keyArray;
    };

    const optionsOf = () => ({
        queryKey: getQueryKey(),
        staleTime,
        retry,
        retryDelay,
        queryFn,
    });

    return {
        get: () => queryClient.getQueryData(getQueryKey()) ?? null,

        fetch: async () => queryClient.fetchQuery(optionsOf()),

        refresh: async () => {
            await queryClient.invalidateQueries({ queryKey: getQueryKey() });
            return queryClient.fetchQuery(optionsOf());
        },

        set: (data) => queryClient.setQueryData(getQueryKey(), data),

        remove: () => {
            queryClient.removeQueries({ queryKey: getQueryKey(), exact: true });
            return true;
        },

        subscribe: (callback) => {
            if (typeof callback !== 'function') return () => { };
            const options = optionsOf();
            const observer = new QueryObserver(queryClient, options);
            callback(toState(observer.getCurrentResult()));
            const unsubscribe = observer.subscribe((result) => callback(toState(result)));
            queryClient.fetchQuery(options).catch(console.error);
            return unsubscribe;
        },
    };
}