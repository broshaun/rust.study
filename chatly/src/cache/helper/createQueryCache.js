import { QueryClient, QueryObserver } from '@tanstack/query-core';

export const queryClient = new QueryClient();

/* =========================
   empty state
========================= */
export const emptyState = {
    data: null,
    error: null,
    isPending: false,
    isFetching: false,
    isSuccess: false,
    isError: false,
};

/* =========================
   utils
========================= */
const isInvalidKey = (key) => key.some((v) => v == null);

const toState = (r) =>
    r
        ? {
              data: r.data ?? null,
              error: r.error ?? null,
              isPending: r.status === 'pending',
              isFetching: r.fetchStatus === 'fetching',
              isSuccess: r.status === 'success',
              isError: r.status === 'error',
          }
        : emptyState;

/* =========================
   CORE FACTORY
========================= */
export function createQueryCache({
    sessionId,        // ✔ 允许传 value（Session.get()）
    cacheKey,
    queryFn,
    staleTime = 0,
    retry = 1,
    retryDelay = 1000,
}) {


    /* =========================
       strict validation (static only)
    ========================= */
    if (!cacheKey) {
        throw new Error('[createQueryCache] cacheKey is required');
    }

    if (typeof queryFn !== 'function') {
        throw new Error('[createQueryCache] queryFn must be a function');
    }

    if (!sessionId) {
        throw new Error('[createQueryCache] sessionId is required');
    }

    /* =========================
       lazy session resolver (关键修复点)
    ========================= */
    const resolveSessionId = () => {
        // ✔ 支持 function 或 value
        if (typeof sessionId === 'function') {
            return sessionId();
        }
        return sessionId;
    };

    /* =========================
       query key
    ========================= */
    const getQueryKey = () => {
        const sid = resolveSessionId();

        if (!sid) {
            throw new Error('[createQueryCache] sessionId is not ready');
        }

        const key = [cacheKey, sid];

        if (isInvalidKey(key)) {
            throw new Error('[createQueryCache] invalid queryKey');
        }

        return key;
    };

    /* =========================
       options builder
    ========================= */
    const optionsOf = () => {
        const queryKey = getQueryKey();

        return {
            queryKey,
            staleTime,
            retry,
            retryDelay,
            queryFn: async () => {
                return await queryFn();
            },
        };
    };

    /* =========================
       get
    ========================= */
    const get = () => {
        const key = getQueryKey();

        const data = queryClient.getQueryData(key);
        if (data !== undefined) return data;

        return null;
    };

    /* =========================
       fetch (strict)
    ========================= */
    const fetch = async () => {
        const options = optionsOf();

        return queryClient.fetchQuery(options);
    };

    /* =========================
       refresh
    ========================= */
    const refresh = async () => {
        const options = optionsOf();

        return queryClient.fetchQuery({
            ...options,
            staleTime: 0,
        });
    };

    /* =========================
       set
    ========================= */
    const set = (data) => {
        const key = getQueryKey();

        queryClient.setQueryData(key, data);

        return data;
    };

    /* =========================
       remove
    ========================= */
    const remove = () => {
        const key = getQueryKey();

        queryClient.removeQueries({
            queryKey: key,
            exact: true,
        });

        return true;
    };

    /* =========================
       subscribe
    ========================= */
    const subscribe = (callback) => {
        if (typeof callback !== 'function') {
            throw new Error('[subscribe] callback must be a function');
        }

        const options = optionsOf();

        // ✔ 自动 hydrate（保证初始化）
        queryClient.fetchQuery(options).catch((e) => {
            console.error('[queryCache fetch error]', e);
        });

        const observer = new QueryObserver(queryClient, {
            ...options,
            enabled: false,
        });

        callback(toState(observer.getCurrentResult()));

        return observer.subscribe((result) =>
            callback(toState(result))
        );
    };

    /* =========================
       public API
    ========================= */
    return {
        get,
        fetch,
        refresh,
        set,
        remove,
        subscribe,
    };
}