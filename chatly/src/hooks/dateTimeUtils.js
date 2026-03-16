const padZero = (num) => String(num).padStart(2, "0");

const formatDate = (date, format) => {
  const map = {
    YYYY: date.getFullYear(),
    MM: padZero(date.getMonth() + 1),
    DD: padZero(date.getDate()),
    HH: padZero(date.getHours()),
    mm: padZero(date.getMinutes()),
    ss: padZero(date.getSeconds()),
  };
  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (k) => map[k]);
};

export const useDateTime = () => ({
  getDate: () => new Date(),
  getDateStr: (format = "YYYY-MM-DD") => formatDate(new Date(), format),
  getTimeStr: (format = "HH:mm:ss") => formatDate(new Date(), format),
  getDateTimeStr: (format = "YYYY-MM-DD HH:mm:ss") => formatDate(new Date(), format),
  getTimestampSec: () => Math.floor(Date.now() / 1000),
  getTimestampMs: () => Date.now(),
});