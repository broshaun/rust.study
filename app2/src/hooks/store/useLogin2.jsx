import { useCallback, useEffect, useMemo, useState } from "react";
import { useGlobalStore } from "./useGlobalStore";

const LOGIN_TOKEN_KEY = "login_token";
const LOGIN_EXPIRE_KEY = "login_expire_time";

// 你原本的“秒数 - 10秒”规则：最小 10 秒
const computeExpireTimestamp = (seconds) => {
  const safeSeconds = typeof seconds === "number" && seconds >= 0 ? seconds : 10;
  const actualSeconds = Math.max(safeSeconds - 10, 10);
  return Date.now() + actualSeconds * 1000;
};

export function useLogin() {
  const tokenStore = useGlobalStore(LOGIN_TOKEN_KEY);
  const expireStore = useGlobalStore(LOGIN_EXPIRE_KEY);

  const loginToken = tokenStore((s) => s.value);
  const setTokenStore = tokenStore((s) => s.setStore);
  const removeTokenStore = tokenStore((s) => s.removeStore);

  const expireTime = expireStore((s) => s.value); // ms timestamp
  const setExpireStore = expireStore((s) => s.setStore);
  const removeExpireStore = expireStore((s) => s.removeStore);

  const isLogged = !!loginToken;

  /**
   * ✅ isExpired：同步派生值（首屏就有值）
   * 规则：没 token 或没 expireTime -> 视为过期
   */
  const isExpired = useMemo(() => {
    if (!isLogged || !expireTime) return true;
    return Number(expireTime) <= Date.now();
  }, [isLogged, expireTime]);

  // 仅用于“到点触发一次重渲染”，让 isExpired 从 false 自动变 true
  const [, forceRender] = useState(0);

  const setToken = useCallback(
    (token) => {
      if (!token || typeof token !== "string") {
        console.warn("登录令牌必须是非空字符串");
        return;
      }
      setTokenStore(token);
    },
    [setTokenStore]
  );

  const setTime = useCallback(
    (seconds) => {
      const ts = computeExpireTimestamp(seconds);
      setExpireStore(ts);
    },
    [setExpireStore]
  );

  const fnLogout = useCallback(() => {
    removeTokenStore();
    removeExpireStore();
    // 不需要 setIsExpired(true)，因为 isExpired 会同步变 true
  }, [removeTokenStore, removeExpireStore]);

  useEffect(() => {
    // 不登录或已过期：不需要 timer
    if (!isLogged || !expireTime) return;

    const now = Date.now();
    const delay = Number(expireTime) - now;

    // 已到期：触发一次 re-render 即可（让 isExpired 立即变 true）
    if (delay <= 0) {
      forceRender((x) => x + 1);
      return;
    }

    // 到点触发一次 re-render（不提前 1 秒，避免负数/抖动；你要提前可自行 -1000）
    const t = setTimeout(() => {
      forceRender((x) => x + 1);
      // 可选：到期自动登出（看业务）
      // fnLogout();
    }, delay);

    return () => clearTimeout(t);
  }, [isLogged, expireTime]);

  return {
    loginToken: loginToken || "",
    isLogged,
    isExpired, // ✅ 永远是 true/false，不会 undefined
    setToken,
    setTime,
    fnLogout,
  };
}
