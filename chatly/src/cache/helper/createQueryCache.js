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
        const key = getQueryKey();
        const data = queryClient.getQueryData(key);
        if (data !== undefined) return data;
        return null;
    };

    const fetch = async () => {
        const options = optionsOf();
        return queryClient.fetchQuery(options);
    };

    const refresh = async () => {
        const key = getQueryKey();
        await queryClient.invalidateQueries({ queryKey: key });
        return queryClient.fetchQuery(optionsOf());
    };

    const set = (data) => {
        const key = getQueryKey();
        queryClient.setQueryData(key, data);
        return data;
    };

    const remove = () => {
        const key = getQueryKey();
        queryClient.removeQueries({ queryKey: key, exact: true });
        return true;
    };

    const subscribe = (callback) => {
        if (typeof callback !== 'function') {
            throw new Error('[subscribe] callback must be a function');
        }
        const options = optionsOf();
        queryClient.fetchQuery(options).catch((e) => { console.error('[queryCache fetch error]', e) });
        const observer = new QueryObserver(queryClient, { ...options, enabled: false });
        callback(toState(observer.getCurrentResult()));
        return observer.subscribe((result) => callback(toState(result)));
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