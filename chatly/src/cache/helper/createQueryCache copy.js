import { QueryClient, QueryObserver } from '@tanstack/query-core';

export const queryClient = new QueryClient();

export const emptyState = {
    data: null,
    error: null,
    isPending: false,
    isFetching: false,
    isSuccess: false,
    isError: false,
};

const isInvalidKey = (key) => key.some((v) => v == null);
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
    sessionId,        // ✔ 允许传 value（Session.get()）
    cacheKey,
    queryFn,
    staleTime = 0,
    retry = 1,
    retryDelay = 1000,
}) {
    if (!cacheKey) throw new Error('[createQueryCache] cacheKey is required');
    if (typeof queryFn !== 'function') throw new Error('[createQueryCache] queryFn must be a function');
    if (!sessionId) throw new Error('[createQueryCache] sessionId is required');
    const resolveSessionId = () => {
        if (typeof sessionId === 'function') {
            return sessionId();
        }
        return sessionId;
    };
    const getQueryKey = () => {
        const sid = resolveSessionId();
        if (!sid) throw new Error('[createQueryCache] sessionId is not ready');
        const key = [cacheKey, sid];
        if (isInvalidKey(key)) throw new Error('[createQueryCache] invalid queryKey');
        return key;
    };

    const optionsOf = () => {
        const queryKey = getQueryKey();
        return {
            queryKey,
            staleTime,
            retry,
            retryDelay,
            queryFn: async () => { return await queryFn() },
        };
    };

    const get = () => {
        const data = queryClient.getQueryData(getQueryKey());
        if (data !== undefined) return data;
        return null;
    };

    const fetch = async () => {
        return queryClient.fetchQuery(optionsOf());
    };

    const refresh = async () => {
        await queryClient.invalidateQueries({ queryKey: getQueryKey() });
        return queryClient.fetchQuery(optionsOf());
    };

    const set = (data) => {
        return queryClient.setQueryData(getQueryKey(), data);
    };

    const remove = () => {
        queryClient.removeQueries({ queryKey: getQueryKey(), exact: true });
        return true;
    };


    const subscribe = (callback) => {
        if (typeof callback !== 'function') return () => { };
        const options = optionsOf();
        const observer = new QueryObserver(queryClient, options);
        callback(toState(observer.getCurrentResult()));
        const unsubscribe = observer.subscribe((result) => callback(toState(result)));
        queryClient.fetchQuery(options).catch(console.error);
        return unsubscribe;
    };

    return {
        get,
        fetch,
        refresh,
        set,
        remove,
        subscribe,
    };
}