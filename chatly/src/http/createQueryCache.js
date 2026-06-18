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

const isInvalidKey = (queryKey) =>
    queryKey.some((value) => value == null);

const toState = (result) => result ? {
    data: result.data ?? null,
    error: result.error ?? null,
    isPending: result.status === 'pending',
    isFetching: result.fetchStatus === 'fetching',
    isSuccess: result.status === 'success',
    isError: result.status === 'error',
} : emptyState;

export function createQueryCache({
    key,
    queryFn,
    staleTime = 0,
    retry = 1,
    retryDelay = 1000,
}) {
    const getOptions = (...args) => ({
        queryKey: key(...args),
        queryFn: () => queryFn(...args),
        staleTime,
        retry,
        retryDelay,
    });

    const getValidOptions = (...args) => {
        const options = getOptions(...args);
        return isInvalidKey(options.queryKey) ? null : options;
    };

    const fetch = (...args) => {
        const options = getValidOptions(...args);

        return options
            ? queryClient.fetchQuery(options)
            : Promise.resolve(null);
    };

    const get = (...args) => {
        const queryKey = key(...args);

        return isInvalidKey(queryKey)
            ? null
            : queryClient.getQueryData(queryKey) ?? null;
    };

    const set = (...args) => {
        const data = args.pop();
        const queryKey = key(...args);

        if (isInvalidKey(queryKey)) return null;

        queryClient.setQueryData(queryKey, data);
        return data;
    };

    const refresh = (...args) => {
        const options = getValidOptions(...args);

        return options
            ? queryClient.fetchQuery({ ...options, staleTime: 0 })
            : Promise.resolve(null);
    };

    const remove = (...args) => {
        const queryKey = key(...args);

        if (isInvalidKey(queryKey)) return null;

        queryClient.removeQueries({
            queryKey,
            exact: true,
        });

        return null;
    };

    const subscribe = (...args) => {
        const callback = args.pop();

        if (typeof callback !== 'function') {
            throw new TypeError('subscribe callback must be a function');
        }

        const options = getValidOptions(...args);

        if (!options) {
            callback(emptyState);
            return () => {};
        }

        const observer = new QueryObserver(queryClient, {
            ...options,
            enabled: false,
        });

        callback(toState(observer.getCurrentResult()));

        return observer.subscribe((result) => {
            callback(toState(result));
        });
    };

    return {
        key,
        fetch,
        get,
        set,
        refresh,
        remove,
        subscribe,
    };
}