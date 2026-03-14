import { useMemo } from "react"

/**
 * 时间工具 Hook
 * 默认保持原有功能，同时支持自定义格式
 */
const useDateTime = () => {

  return useMemo(() => {

    const padZero = (num) => String(num).padStart(2, "0")

    const formatDate = (date, format) => {

      const map = {
        YYYY: date.getFullYear(),
        MM: padZero(date.getMonth() + 1),
        DD: padZero(date.getDate()),
        HH: padZero(date.getHours()),
        mm: padZero(date.getMinutes()),
        ss: padZero(date.getSeconds())
      }

      return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (k) => map[k])
    }

    // 获取 Date 对象
    const getDate = () => new Date()

    // 日期字符串
    const getDateStr = (format = "YYYY-MM-DD") => {
      return formatDate(new Date(), format)
    }

    // 时间字符串
    const getTimeStr = (format = "HH:mm:ss") => {
      return formatDate(new Date(), format)
    }

    // 日期+时间
    const getDateTimeStr = (format = "YYYY-MM-DD HH:mm:ss") => {
      return formatDate(new Date(), format)
    }

    // 秒级时间戳
    const getTimestampSec = () => Math.floor(Date.now() / 1000)

    // 毫秒级时间戳
    const getTimestampMs = () => Date.now()

    return {
      getDate,
      getDateStr,
      getDateTimeStr,
      getTimeStr,
      getTimestampSec,
      getTimestampMs
    }

  }, [])
}

export { useDateTime }