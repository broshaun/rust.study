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
   storage
========================= */
const getStorage = (storage) => {
    if (!storage) return null;
    if (storage === true)
        return typeof localStorage === 'undefined' ? null : localStorage;
    return storage;
};

const storageKey = (sessionId, cacheKey) =>
    `query-cache:${sessionId}:${cacheKey}`;

const read = (storage, sessionId, cacheKey) => {
    try {
        const raw = storage?.getItem(storageKey(sessionId, cacheKey));
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const write = (storage, sessionId, cacheKey, data) => {
    try {
        storage?.setItem(
            storageKey(sessionId, cacheKey),
            JSON.stringify(data)
        );
    } catch {}
};

const clear = (storage, sessionId, cacheKey) => {
    try {
        storage?.removeItem(storageKey(sessionId, cacheKey));
    } catch {}
};

/* =========================
   CORE FACTORY
========================= */
export function createQueryCache({
    sessionId,
    cacheKey,
    queryFn,
    staleTime = 0,
    retry = 1,
    retryDelay = 1000,
    storage = false,
}) {
    const store = getStorage(storage);
    if (!sessionId) {
        throw new Error('[createQueryCache] sessionId is required');
    }
    /* =========================
       query key
    ========================= */
    const getQueryKey = () => [cacheKey, sessionId];
    /* =========================
       options builder
    ========================= */
    const optionsOf = () => {
        const key = getQueryKey();
        if (isInvalidKey(key)) return null;
        return {
            queryKey: key,
            staleTime,
            retry,
            retryDelay,
            queryFn: async () => {
                const data = await queryFn();
                write(store, sessionId, cacheKey, data);
                return data;
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

        const local = read(store, sessionId, cacheKey);
        if (local == null) return null;

        queryClient.setQueryData(key, local);
        return local;
    };

    /* =========================
       fetch
    ========================= */
    const fetch = async () => {
        const options = optionsOf();
        return options ? queryClient.fetchQuery(options) : null;
    };

    /* =========================
       refresh
    ========================= */
    const refresh = async () => {
        const options = optionsOf();
        return options
            ? queryClient.fetchQuery({ ...options, staleTime: 0 })
            : null;
    };

    /* =========================
       set
    ========================= */
    const set = (data) => {
        const key = getQueryKey();

        queryClient.setQueryData(key, data);
        write(store, sessionId, cacheKey, data);

        return data;
    };

    /* =========================
       remove
    ========================= */
    const remove = () => {
        const key = getQueryKey();

        queryClient.removeQueries({ queryKey: key, exact: true });
        clear(store, sessionId, cacheKey);

        return null;
    };

    /* =========================
       subscribe
    ========================= */
    const subscribe = (callback) => {
        const options = optionsOf();

        if (!options) {
            callback(emptyState);
            return () => {};
        }

        get();

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