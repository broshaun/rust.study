/**
 * 安全路径拼接
 */
const safeJoin = (...parts) => {
    return parts
        .filter(Boolean)
        .map((p, i) => {
            let segment = p.toString();
            if (i > 0) segment = segment.replace(/^\/+/, "");
            if (i < parts.length - 1) segment = segment.replace(/\/+$/, "");
            return segment;
        }).join("/");
};

/**
 * 存储纯字符串，不做 JSON 转换（apiBase / apiImgs 使用）
 */
function createStringStorage(key, defaultValue) {
    const get = () => {
        const item = localStorage.getItem(key);
        return item === null ? defaultValue : item;
    };
    const set = (value) => {
        if (value == null || value === "") {
            localStorage.removeItem(key);
        } else {
            localStorage.setItem(key, value);
        }
    };
    const remove = () => localStorage.removeItem(key);
    const join = (...subPaths) => {
        const base = get();
        return safeJoin(base, ...subPaths);
    };
    return { get, set, remove, join };
}

// 字符串类型存储
export const apiBase = createStringStorage("apiBase", "http://185.245.41.154:5015");
export const apiImgs = createStringStorage("apiImgs", "http://185.245.41.154:9000");
export const apiMqtt = createStringStorage("apiMqtt", "185.245.41.154");
