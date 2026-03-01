/**
 * 纯实时时间工具Hook（无需传参）
 * 返回值均为函数，调用函数即可获取最新的实时时间
 * @returns {Object} 包含获取各类时间格式的函数
 */
const useDateTime = () => {
    // 补零工具函数
    const padZero = (num) => {
        const n = Number(num);
        return isNaN(n) ? '00' : n.toString().padStart(2, '0');
    };

    // 核心：获取最新的实时Date对象（每次调用都生成新的）
    const getDate = () => new Date();

    // 获取最新日期字符串：2021-01-01
    const getDateStr = () => {
        const date = getDate();
        const year = date.getFullYear();
        const month = padZero(date.getMonth() + 1);
        const day = padZero(date.getDate());
        return `${year}-${month}-${day}`;
    };

    // 获取最新日期+时间字符串：2021-01-01 10:01:01
    const getDateTimeStr = () => {
        const date = getDate();
        const hours = padZero(date.getHours());
        const minutes = padZero(date.getMinutes());
        const seconds = padZero(date.getSeconds());
        return `${getDateStr()} ${hours}:${minutes}:${seconds}`;
    };

    // 获取最新时间字符串：10:01:01
    const getTimeStr = () => {
        const date = getDate();
        const hours = padZero(date.getHours());
        const minutes = padZero(date.getMinutes());
        const seconds = padZero(date.getSeconds());
        return `${hours}:${minutes}:${seconds}`;
    };

    // 获取最新秒级时间戳：1609435261
    const getTimestampSec = () => Math.floor(getDate().getTime() / 1000);

    // 获取最新毫秒级时间戳：1609435261000
    const getTimestampMs = () => getDate().getTime();

    // 返回所有获取最新时间的函数
    return {
        getDate,        // 调用 → 获取最新Date对象
        getDateStr,     // 调用 → 获取最新日期字符串
        getDateTimeStr, // 调用 → 获取最新日期+时间字符串
        getTimeStr,     // 调用 → 获取最新时间字符串
        getTimestampSec,// 调用 → 获取最新秒级时间戳
        getTimestampMs  // 调用 → 获取最新毫秒级时间戳
    };
};

export { useDateTime };