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
    if (value == null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };
  const remove = () => localStorage.removeItem(key);
  return { get, set, remove };
}

export const token = createJsonStorage("token", {});

import { useState, useEffect } from 'react';

export function useRemainSeconds() {
  const calc = () => {
    const data = token.get();
    const expireStr = data?.login_expired;
    if (!expireStr) return 0;
    const expireTime = new Date(expireStr).getTime();
    const now = Date.now();
    const diff = Math.floor((expireTime - now) / 1000);
    return Math.max(0, diff);
  };

  const [seconds, setSeconds] = useState(calc());
  useEffect(() => {
    const timer = setInterval(() => {
      const rest = calc();
      setSeconds(rest);
      if (rest <= 0) {
        token.remove();
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return seconds;
}