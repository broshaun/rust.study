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
const toState = (result) => {
    if (!result) return emptyState;
    return {
        data: result.data ?? null,
        error: result.error ?? null,
        isPending: result.status === 'pending',
        isSuccess: result.status === 'success',
        isError: result.status === 'error',
        isFetching: result.fetchStatus === 'fetching',
    };
};

export function createQueryCache({
    sessionId,
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
        return typeof sessionId === 'function' ? sessionId() : sessionId;
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
        return { queryKey, staleTime, retry, retryDelay, queryFn: async () => await queryFn() };
    };

    const get = () => {
        const key = getQueryKey();
        const data = queryClient.getQueryData(key);
        return data ?? null;
    };

    const fetch = async () => {
        return queryClient.fetchQuery(optionsOf());
    };

    const refresh = async () => {
        const key = getQueryKey();
        await queryClient.invalidateQueries({ queryKey: key });
        return queryClient.refetchQueries({ queryKey: key });
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
        const observer = new QueryObserver(queryClient, options);
        const unsubscribe = observer.subscribe((result) => {
            callback(toState(result));
        });
        queryClient.fetchQuery(options).catch((e) => {
            console.error('[queryCache fetch error]', e);
        });
        return () => {
            unsubscribe();
            observer.destroy?.();
        };
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