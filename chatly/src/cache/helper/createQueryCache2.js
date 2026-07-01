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
const createLocalStorage = () => {
    const prefix = 'QueryClient:';
    const keyOf = (key) => prefix + (Array.isArray(key) ? key.join(':') : String(key));
    return {
        get: (key) => {
            try {
                const raw = localStorage.getItem(keyOf(key));
                return raw ? JSON.parse(raw).data : null;
            } catch {
                return null;
            }
        },
        set: (key, data) => {
            try {
                localStorage.setItem(keyOf(key), JSON.stringify({ data, ts: Date.now() }));
            } catch (e) {
                console.warn('[localStorage set failed]', e);
            }
        },
        remove: (key) => {
            try {
                localStorage.removeItem(keyOf(key));
            } catch (e) {
                console.warn('[localStorage remove failed]', e);
            }

        },
    };
};

export const queryClient = new QueryClient();
export function createQueryCache({
    cacheKey,
    queryFn,
    staleTime = 0,
    retry = 1,
    retryDelay = 1000,
    storage = false,
}) {
    if (!cacheKey) throw new Error('[createQueryCache] cacheKey is required');
    if (typeof queryFn !== 'function') throw new Error('[createQueryCache] queryFn must be a function');
    const storageAdapter = storage ? createLocalStorage() : null;

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
        const key = resolveKey();
        if (storageAdapter) {
            const cached = storageAdapter.get(key);
            if (cached !== null) return cached;
        }
        return queryClient.getQueryData(key) ?? null;
    };

    const fetch = async () => {
        const key = resolveKey();
        if (storageAdapter) {
            const cached = storageAdapter.get(key);
            if (cached) {
                queryClient.setQueryData(key, cached);
            }
        }
        return await queryClient.fetchQuery(optionsOf(key));
    };

    const refresh = async () => {
        const key = resolveKey();
        await queryClient.invalidateQueries({ queryKey: key });
        const data = await queryClient.fetchQuery(optionsOf(key));
        if (storageAdapter && data !== undefined) {
            storageAdapter.set(key, data);
        }
        return data;
    };

    const set = (data) => {
        const key = resolveKey();
        if (storageAdapter) {
            storageAdapter.set(key, data);
        }
        return queryClient.setQueryData(key, data);
    };

    const remove = () => {
        const key = resolveKey();
        queryClient.removeQueries({ queryKey: key, exact: true });
        if (storageAdapter) {
            storageAdapter.remove(key)
        }
        return true;
    };

    const subscribe = (callback) => {
        if (typeof callback !== 'function') return () => { };
        const key = resolveKey();
        const options = optionsOf(key);
        const observer = new QueryObserver(queryClient, options);
        const emit = (result) => {
            const state = toState(result);
            callback(state);
            if (storageAdapter && state.isSuccess) {
                storageAdapter.set(key, state.data);
            }
        };
        emit(observer.getCurrentResult());
        return observer.subscribe(emit);
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