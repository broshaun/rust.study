/**
 * 存储对象/数组，自动 JSON 序列化（token 使用）
 */
function createJsonStorage(key, defaultValue) {
  const get = () => {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    try {
      return JSON.parse(item);
    } catch {
      return defaultValue;
    }
  };

  const set = (value) => {
    // console.log('执行赋值', value)
    if (value == null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };
  const remove = () => localStorage.removeItem(key);
  return { get, set, remove };
}



// 获取token
export const tokenStore = createJsonStorage("token", {});
const calc = () => {
  const data = tokenStore.get();
  const expireStr = data?.login_expired;
  if (!expireStr) return 0;
  const expireTime = new Date(expireStr).getTime();
  const now = Date.now();
  const diff = Math.floor((expireTime - now) / 1000);
  return Math.max(0, diff);
};
// 获取剩余时间
import { useState, useEffect } from 'react';
export function useRemainSeconds() {
  const [seconds, setSeconds] = useState(()=>calc());
  useEffect(() => {
    const timer = setInterval(() => {
      const rest = calc();
      setSeconds(rest);
      if (rest > 1 && rest < 10) {
        tokenStore.remove();
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [tokenStore, calc]);
  return seconds;
}