// 🎯 仅用于网络请求并发去重的 Promise 锁
const inflight = new Map();

export function createStorageCache({
    stored,
    cacheKey,
    queryFn,
    staleTime = 0,
}) {
    // 1. 严格参数校验
    if (!stored || (typeof stored !== 'object' && typeof stored !== 'function')) throw new Error('[Cache] Invalid stored');
    if (!cacheKey || typeof cacheKey !== 'string') throw new Error('[Cache] Invalid cacheKey');
    if (typeof queryFn !== 'function') throw new Error('[Cache] Invalid queryFn');

    const getTbl = () => typeof stored === 'function' ? stored() : stored;

    // 2. 底层 DB 原子操作
    const getAsync = async () => {
        try {
            return (await getTbl()?.get(cacheKey)) ?? null;
        } catch { return null; }
    };
    const dbPut = async (data) => {
        try {
            await getTbl()?.put({ id: cacheKey, data, timestamp: Date.now(), ttl: staleTime });
        } catch { }
    };
    const dbDel = async () => {
        try {
            await getTbl()?.delete(cacheKey);
        } catch { }
    };
    const dbClear = async () => {
        try {
            await getTbl()?.clear();
        } catch { }
    };

    // 3. 核心网络请求去重锁
    const safeNetworkFetch = async () => {
        if (inflight.has(cacheKey)) return inflight.get(cacheKey);
        const promise = (async () => {
            try {
                const data = await queryFn();
                if (data !== undefined) await dbPut(data);
                return data;
            } finally {
                inflight.delete(cacheKey);
            }
        })();
        inflight.set(cacheKey, promise);
        return promise;
    };

    // 4. SWR 核心逻辑：实现真正的 TanStack Query 体验
    const fetch = async () => {
        const cacheRecord = await getAsync();

        // 情况 1：完全没有缓存 -> 必须等待网络请求返回（硬等待）
        if (!cacheRecord) {
            return safeNetworkFetch();
        }

        const { data, timestamp, ttl } = cacheRecord;
        const isStale = typeof timestamp !== 'number' || typeof ttl !== 'number' || Date.now() > timestamp + ttl;

        // 情况 2：有缓存，且数据还很新鲜 -> 直接返回内存/DB数据，不触发网络请求
        if (!isStale) {
            return data;
        }

        // 情况 3 (SWR 核心)：有缓存，但数据【已陈旧】
        // 默默在后台发起网络请求（由于有 inflight 锁，多处同时触发也只会发一个请求）
        // 这里不加 await，让它异步执行
        safeNetworkFetch().catch((err) => {
            console.error('[Cache] Background refresh failed:', err);
        });

        // 立刻返回老数据给上层当垫底 UI，实现秒开体验
        return data;
    };

    // 5. API 导出
    const get = async () => (await getAsync())?.data ?? null;
    const refresh = async () => safeNetworkFetch();
    const set = async (data) => (await dbPut(data), data);
    const remove = async () => (await dbDel(), true);
    const clear = async () => { inflight.clear(); await dbClear(); return true; };

    return {
        get,
        fetch,
        refresh,
        set,
        remove,
        clear
    };
}