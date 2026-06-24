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

const isInvalidKey = (queryKey) => queryKey.some((v) => v == null);

const toState = (r) => r ? {
    data: r.data ?? null,
    error: r.error ?? null,
    isPending: r.status === 'pending',
    isFetching: r.fetchStatus === 'fetching',
    isSuccess: r.status === 'success',
    isError: r.status === 'error',
} : emptyState;

const getStorage = (storage) => {
    if (!storage) return null;
    if (storage === true) return typeof localStorage === 'undefined' ? null : localStorage;
    return storage;
};

const storageKey = (queryKey) => `query-cache:${JSON.stringify(queryKey)}`;

const read = (storage, queryKey) => {
    try {
        const raw = storage?.getItem(storageKey(queryKey));
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const write = (storage, queryKey, data) => {
    try {
        storage?.setItem(storageKey(queryKey), JSON.stringify(data));
    } catch {}
};

const clear = (storage, queryKey) => {
    try {
        storage?.removeItem(storageKey(queryKey));
    } catch {}
};

/**
 const currentUser = loginCache.get(userId)
const [members, setMembers] = useState([])
useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    agroup_user.fetch(userId).catch(() => { });
    const unsubscribe = agroup_user.subscribe(userId, (next) => {
        if (!isMounted) return;
        const newData = Array.isArray(next?.data) ? next.data : [];
        setMembers(newData);
    });
    return () => {
        isMounted = false;
        unsubscribe?.();
    }
}, [userId]);
 */
export function createQueryCache({
    key,
    queryFn,
    staleTime = 0,
    retry = 1,
    retryDelay = 1000,
    storage = false,
}) {
    const store = getStorage(storage);
    const optionsOf = (...args) => {
        const queryKey = key(...args);
        if (isInvalidKey(queryKey)) return null;
        return {
            queryKey,
            staleTime,
            retry,
            retryDelay,
            queryFn: async () => {
                const data = await queryFn(...args);
                write(store, queryKey, data);
                return data;
            },
        };
    };

    const get = (...args) => {
        const queryKey = key(...args);
        if (isInvalidKey(queryKey)) return null;
        const data = queryClient.getQueryData(queryKey);
        if (data !== undefined) return data;
        const local = read(store, queryKey);
        if (local == null) return null;
        queryClient.setQueryData(queryKey, local);
        return local;
    };

    const fetch = async (...args) => {
        const options = optionsOf(...args);
        return options ? queryClient.fetchQuery(options) : null;
    };

    const refresh = async (...args) => {
        const options = optionsOf(...args);
        return options ? queryClient.fetchQuery({ ...options, staleTime: 0 }) : null;
    };

    const set = (...args) => {
        const data = args.pop();
        const queryKey = key(...args);
        if (isInvalidKey(queryKey)) return null;
        queryClient.setQueryData(queryKey, data);
        write(store, queryKey, data);
        return data;
    };

    const remove = (...args) => {
        const queryKey = key(...args);
        if (isInvalidKey(queryKey)) return null;
        queryClient.removeQueries({ queryKey, exact: true });
        clear(store, queryKey);
        return null;
    };

    const subscribe = (...args) => {
        const callback = args.pop();
        if (typeof callback !== 'function') {
            throw new TypeError('subscribe callback must be a function');
        }
        const options = optionsOf(...args);
        if (!options) {
            callback(emptyState);
            return () => {};
        }
        get(...args);
        const observer = new QueryObserver(queryClient, {
            ...options,
            enabled: false,
        });
        callback(toState(observer.getCurrentResult()));
        return observer.subscribe((result) => callback(toState(result)));
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