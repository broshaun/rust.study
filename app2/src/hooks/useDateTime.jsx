import { useMemo } from 'react';

/**
 * 处理时间戳/日期的通用Hook
 * @param {number | string | Date} time - 时间戳（秒/毫秒）、日期字符串、Date对象，不传则取当前时间
 * @returns {Object} 包含各种格式的时间字符串和原始Date对象
 */
const useDateTime = (time) => {
    // 处理入参，转换为标准Date对象（兼容秒级/毫秒级时间戳、字符串、Date对象）
    const date = useMemo(() => {
        let targetTime = time;

        // 不传参数时取当前时间
        if (targetTime === undefined || targetTime === null) {
            return new Date();
        }

        // 如果是数字，判断是秒级还是毫秒级时间戳（秒级：长度10位，毫秒级：13位）
        if (typeof targetTime === 'number') {
            const timestamp = targetTime;
            // 秒级时间戳转毫秒
            if (timestamp.toString().length === 10) {
                targetTime = timestamp * 1000;
            }
        }

        // 转换为Date对象
        const dateObj = new Date(targetTime);

        // 校验Date对象是否有效
        if (isNaN(dateObj.getTime())) {
            console.warn('useDateTime: 无效的时间参数，已使用当前时间', targetTime);
            return new Date();
        }

        return dateObj;
    }, [time]);

    // 补零函数：确保数字为两位数（如 1 → 01）
    const padZero = (num) => num.toString().padStart(2, '0');

    // 格式化：2021-01-01（日期）
    const dateStr = useMemo(() => {
        const year = date.getFullYear();
        const month = padZero(date.getMonth() + 1); // 月份从0开始，需+1
        const day = padZero(date.getDate());
        return `${year}-${month}-${day}`;
    }, [date]);

    // 格式化：2021-01-01 10:01:01（日期+时间）
    const dateTimeStr = useMemo(() => {
        const hours = padZero(date.getHours());
        const minutes = padZero(date.getMinutes());
        const seconds = padZero(date.getSeconds());
        return `${dateStr} ${hours}:${minutes}:${seconds}`;
    }, [date, dateStr]);

    // 格式化：10:01:01（仅时间）
    const timeStr = useMemo(() => {
        const hours = padZero(date.getHours());
        const minutes = padZero(date.getMinutes());
        const seconds = padZero(date.getSeconds());
        return `${hours}:${minutes}:${seconds}`;
    }, [date]);

    // 获取当前时间戳（秒级）
    const timestampSec = useMemo(() => Math.floor(date.getTime() / 1000), [date]);

    // 获取当前时间戳（毫秒级）
    const timestampMs = useMemo(() => date.getTime(), [date]);

    return {
        date, // 原始Date对象，可自定义操作
        dateStr, // 2021-01-01
        dateTimeStr, // 2021-01-01 10:01:01
        timeStr, // 10:01:01
        timestampSec, // 秒级时间戳（如 1609435261）
        timestampMs, // 毫秒级时间戳（如 1609435261000）
    };
};

export { useDateTime };