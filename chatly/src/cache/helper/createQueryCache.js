import { QueryClient, QueryObserver } from '@tanstack/query-core';

export const emptyState = Object.freeze({
    data: null,
    error: null,
    isPending: false,
    isFetching: false,
    isSuccess: false,
    isError: false
});
export const queryClient = new QueryClient();

const toState = (v) => v ? {
    data: v.data ?? null, error: v.error,
    isPending: v.status === 'pending', isFetching: v.fetchStatus === 'fetching',
    isSuccess: v.status === 'success', isError: v.status === 'error',
} : emptyState;

export function createQueryCache({
    scope = null,
    cacheKey,
    queryFn,
    staleTime = 0,
    retry = 1,
    retryDelay = 1000
}) {
    if (!cacheKey || typeof cacheKey !== 'string' || typeof queryFn !== 'function') throw new Error('[createCoreCache] Invalid parameters');
    const getActiveScope = () => typeof scope === 'function' ? scope() : scope;
    const resolveKey = () => {
        const s = getActiveScope();
        return s ? [s, cacheKey] : [cacheKey];
    };
    const optionsOf = (key) => ({ queryKey: key || resolveKey(), staleTime, retry, retryDelay, queryFn });

    const get = () => queryClient.getQueryData(resolveKey());

    const fetch = async () => queryClient.fetchQuery(optionsOf());

    const refresh = async () => {
        const opts = optionsOf();
        opts.staleTime = 0;
        return queryClient.fetchQuery(opts);
    };
    
    const set = (data) => queryClient.setQueryData(resolveKey(), data);

    const remove = () => (queryClient.removeQueries({ queryKey: resolveKey(), exact: true }), true);

    const subscribe = (callback) => {
        if (typeof callback !== 'function') return () => { };
        const observer = new QueryObserver(queryClient, optionsOf());
        const emit = (result) => callback(toState(result));
        emit(observer.getCurrentResult());
        return observer.subscribe(emit);
    };

    return {
        get, 
        fetch, 
        refresh, 
        set, 
        remove, 
        subscribe
    };
}