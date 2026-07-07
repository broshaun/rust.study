// 🎯 仅用于网络请求并发去重的 Promise 锁
const inflight = new Map();

export function createStorageCache({
    stored,
    cacheKey,
    queryFn
}) {
    // 1. 严格参数校验 (坏数据直接拦截，这是最基础的易维护保障)
    if (!stored || (typeof stored !== 'object' && typeof stored !== 'function')) throw new Error('[Cache] Invalid stored');
    if (!cacheKey || typeof cacheKey !== 'string') throw new Error('[Cache] Invalid cacheKey');
    if (typeof queryFn !== 'function') throw new Error('[Cache] Invalid queryFn');

    const getTbl = () => typeof stored === 'function' ? stored() : stored;
    // 2. 底层 DB 原子操作 (try-catch 保证持久化层哪怕崩了，业务也不卡死)
    const getAsync = async () => {
        try {
            return (await getTbl()?.get(cacheKey))?.data ?? null;
        } catch { return null; }
    };
    const dbPut = async (data) => {
        try {
            await getTbl()?.put({ id: cacheKey, data, timestamp: Date.now() });
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
    // 3. 核心网络请求去重锁 (性能核心：多处同时 fetch 只有 1 个网络请求)
    const safeNetworkFetch = async () => {
        if (inflight.has(cacheKey)) return inflight.get(cacheKey);
        const promise = (async () => {
            try {
                const data = await queryFn();
                if (data !== undefined) await dbPut(data); // 写入 DB，由你的外部数据库监听器感知
                return data;
            } finally {
                inflight.delete(cacheKey); // 只要请求完立刻释放，零内存残留
            }
        })();
        inflight.set(cacheKey, promise);
        return promise;
    };

    // 4. 极致扁平的 API 导出 (零冗余逻辑，执行路径最短，性能最高)
    const fetch = async () => (await getAsync()) ?? safeNetworkFetch();
    const refresh = async () => safeNetworkFetch();
    const set = async (data) => (await dbPut(data), data);
    const remove = async () => (await dbDel(), true);
    const clear = async () => { inflight.clear(); await dbClear(); return true; };

    return {
        getAsync,
        fetch,
        refresh,
        set,
        remove,
        clear
    };
}