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

  // 解构 store 方法和值（无冗余，保持原样）
  const loginToken = tokenStore((s) => s.value);
  const setTokenStore = tokenStore((s) => s.setStore);
  const removeTokenStore = tokenStore((s) => s.removeStore);

  const expireTime = expireStore((s) => s.value);
  const setExpireStore = expireStore((s) => s.setStore);
  const removeExpireStore = expireStore((s) => s.removeStore);

  // 优化1：增强 isLogged 健壮性（非冗余，更严谨，无重复代码）
  const isLogged = useMemo(() => {
    // 仅当 loginToken 是「非空非空格字符串」时，视为已登录
    return !!loginToken && typeof loginToken === "string" && loginToken.trim() !== "";
  }, [loginToken]);

  /**
   * 优化2：去除重复的 Number(expireTime) 转换，一次转换兜底
   * 同步派生 isExpired，首屏有值，无冗余
   */
  const isExpired = useMemo(() => {
    if (!isLogged) return true;
    // 一次转换并兜底：无效值直接视为过期
    const validExpireTime = typeof expireTime === "number" ? expireTime : 0;
    return validExpireTime <= Date.now();
  }, [isLogged, expireTime]);

  // 仅用于“到点触发一次重渲染”，让 isExpired 从 false 自动变 true
  const [, forceRender] = useState(0);

  const setToken = useCallback(
    (token) => {
      // 优化3：同步增强 token 校验（与 isLogged 逻辑一致，无冗余）
      if (!token || typeof token !== "string" || token.trim() === "") {
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
    // 优化4：手动触发一次重渲染，确保 isExpired 立即更新（无冗余，逻辑更完整）
    forceRender((x) => x + 1);
  }, [removeTokenStore, removeExpireStore]);

  /**
   * 优化5：去除重复的 Number(expireTime) 转换，使用 isExpired 兜底
   * 逻辑更精简，无冗余
   */
  useEffect(() => {
    // 不登录或已过期：不需要 timer
    if (!isLogged || isExpired) return;

    const now = Date.now();
    // 直接使用已兜底的 expireTime（数字类型）
    const delay = expireTime - now;

    // 已到期：触发一次 re-render 即可
    if (delay <= 0) {
      forceRender((x) => x + 1);
      return;
    }

    // 到点触发一次 re-render
    const t = setTimeout(() => {
      forceRender((x) => x + 1);
      // 可选：到期自动登出
      // fnLogout();
    }, delay);

    return () => clearTimeout(t);
  }, [isLogged, isExpired, expireTime]);

  // 优化6：去除冗余的 loginToken || "" 兜底
  // 原因：loginToken 要么是有效字符串，要么是 undefined，调用方可自行处理兜底，无需在此重复
  return {
    loginToken,
    isLogged,
    isExpired, // 永远是 true/false，不会 undefined
    setToken,
    setTime,
    fnLogout,
  };
}