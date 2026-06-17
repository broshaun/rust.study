import { useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryObserver } from '@tanstack/query-core';

export const queryClient = new QueryClient();

const hasInvalidKey = (queryKey) =>
    queryKey.includes(undefined) || queryKey.includes(null);

export function createQueryCache({
    key,
    queryFn,
    staleTime = 0,
    retry = 1,
    retryDelay = 1000,
}) {
    const fetch = (...args) => {
        const queryKey = key(...args);
        if (hasInvalidKey(queryKey)) return Promise.resolve(null);

        return queryClient.fetchQuery({
            queryKey,
            queryFn: () => queryFn(...args),
            staleTime,
            retry,
            retryDelay,
        });
    };

    const get = (...args) => {
        const queryKey = key(...args);
        if (hasInvalidKey(queryKey)) return null;
        return queryClient.getQueryData(queryKey) ?? null;
    };

    const set = (...args) => {
        const data = args.pop();
        const queryKey = key(...args);
        if (hasInvalidKey(queryKey)) return null;
        queryClient.setQueryData(queryKey, data);
        return data;
    };

    const refresh = (...args) => {
        const queryKey = key(...args);
        if (hasInvalidKey(queryKey)) return Promise.resolve(null);
        return queryClient.invalidateQueries({ queryKey });
    };

    const remove = (...args) => {
        const queryKey = key(...args);
        if (hasInvalidKey(queryKey)) return Promise.resolve(null);
        return queryClient.removeQueries({ queryKey });
    };

    const useCache = (...args) => {
        const queryKey = useMemo(() => key(...args), args);
        const obsRef = useRef(null);
        const [state, setState] = useState(() => ({
            data: hasInvalidKey(queryKey) ? null : queryClient.getQueryData(queryKey) ?? null,
            error: null,
            isPending: false,
            isFetching: false,
            isSuccess: false,
            isError: false,
        }));

        useEffect(() => {
            if (hasInvalidKey(queryKey)) {
                setState({ data: null, error: null, isPending: false, isFetching: false, isSuccess: false, isError: false });
                return;
            }

            const observer = new QueryObserver(queryClient, {
                queryKey,
                queryFn: () => queryFn(...args),
                staleTime,
                retry,
                retryDelay,
                enabled: true,
            });
            obsRef.current = observer;

            const unsub = observer.subscribe(res => setState({
                data: res.data ?? null,
                error: res.error ?? null,
                isPending: res.status === 'pending',
                isFetching: res.fetchStatus === 'fetching',
                isSuccess: res.status === 'success',
                isError: res.status === 'error',
            }));
            return unsub;
        }, [queryKey]);

        const refetch = () => obsRef.current?.refetch();
        return { ...state, refetch };
    };

   

    return { key, fetch, get, set, refresh, remove, useCache };
}