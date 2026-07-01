import { QueryClient, QueryObserver } from '@tanstack/query-core';


export const emptyState = Object.freeze({
    data: null,
    error: null,
    isPending: false,
    isFetching: false,
    isSuccess: false,
    isError: false,
});
const isInvalidKey = (key) => key.some((v) => v == null);
const toState = (value) => {
    if (!value) return emptyState;
    return {
        data: value.data ?? null,
        error: value.error,
        isPending: value.status === 'pending',
        isFetching: value.fetchStatus === 'fetching',
        isSuccess: value.status === 'success',
        isError: value.status === 'error',
    };
};

export const queryClient = new QueryClient();
export function createQueryCache({
    cacheKey,
    queryFn,
    staleTime = 0,
    retry = 1,
    retryDelay = 1000,
}) {
    if (!cacheKey) throw new Error('[createQueryCache] cacheKey is required');
    if (typeof queryFn !== 'function') throw new Error('[createQueryCache] queryFn must be a function');

    const resolveKey = () => {
        const k = typeof cacheKey === 'function' ? cacheKey() : cacheKey;
        const key = Array.isArray(k) ? k : [k];
        if (isInvalidKey(key)) throw new Error('[createQueryCache] invalid queryKey');
        return key;
    };

    const optionsOf = (key) => ({
        queryKey: key || resolveKey(),
        staleTime,
        retry,
        retryDelay,
        queryFn: queryFn,
    });

    const get = () => {
        return queryClient.getQueryData(resolveKey()) ?? null;
    };

    const fetch = () => {
        return queryClient.fetchQuery(optionsOf());
    };

    const refresh = async () => {
        const key = resolveKey();
        await queryClient.invalidateQueries({ queryKey: key });
        return queryClient.fetchQuery(optionsOf(key));
    };

    const set = (data) => {
        return queryClient.setQueryData(resolveKey(), data);
    };

    const remove = () => {
        queryClient.removeQueries({ queryKey: resolveKey(), exact: true });
        return true;
    };

    // 以下多了没有初始值会执行初始值fetchQuery
    // const subscribe = (callback) => {
    //     if (typeof callback !== 'function') return () => {};
    //     const key = resolveKey();
    //     const options = optionsOf(key);
    //     const observer = new QueryObserver(queryClient, options);
    //     const currentResult = observer.getCurrentResult();
    //     callback(toState(currentResult));
    //     const shouldFetch = currentResult.isStale || (currentResult.status === 'pending' && observer.getCurrentQuery()?.state.fetchStatus !== 'fetching');
    //     if (shouldFetch) queryClient.fetchQuery(options).catch(() => {});
    //     const unsubscribe = observer.subscribe((result) => callback(toState(result)));
    //     return unsubscribe;
    // };

    const subscribe = (callback) => {
        if (typeof callback !== 'function') return () => { };
        const key = resolveKey();
        const options = optionsOf(key);
        const observer = new QueryObserver(queryClient, options);
        callback(toState(observer.getCurrentResult()));
        const unsubscribe = observer.subscribe((result) => callback(toState(result)));
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