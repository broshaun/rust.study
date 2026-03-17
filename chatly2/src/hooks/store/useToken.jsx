import { useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "@mantine/hooks";

const TOKEN_KEY = "login_token";
const EXPIRE_KEY = "login_expire";

export function useToken() {
  const [token, setTokenValue] = useLocalStorage(TOKEN_KEY, "");
  const [expireTime, setExpireTime] = useLocalStorage(EXPIRE_KEY, 0);
  const [remainSeconds, setRemainSeconds] = useState(0);

  const calcRemain = useCallback((expire) => {
    if (!expire) return 0;
    return Math.max(0, Math.floor((Number(expire) - Date.now()) / 1000));
  }, []);

  /**
   * 设置 token
   */
  const setToken = useCallback((token, validSeconds = 0) => {
    if (!token) return;

    const expire = Date.now() + Number(validSeconds || 0) * 1000;

    setTokenValue(token);
    setExpireTime(expire);

    // 关键优化：立即同步 remainSeconds
    setRemainSeconds(calcRemain(expire));
  }, [setTokenValue, setExpireTime, calcRemain]);

  /**
   * 删除 token
   */
  const delToken = useCallback(() => {
    setTokenValue("");
    setExpireTime(0);
    setRemainSeconds(0);
  }, [setTokenValue, setExpireTime]);

  /**
   * expireTime 变化时立即同步一次
   */
  useEffect(() => {
    setRemainSeconds(calcRemain(expireTime));
  }, [expireTime, calcRemain]);

  /**
   * 倒计时（核心）
   */
  useEffect(() => {
    if (!expireTime) {
      setRemainSeconds(0);
      return;
    }

    const tick = () => {
      const remain = calcRemain(expireTime);
      setRemainSeconds(remain);
    };

    tick();

    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [expireTime, calcRemain]);

  return {
    token: token || "",
    setToken,
    delToken,
    remainSeconds,
  };
}