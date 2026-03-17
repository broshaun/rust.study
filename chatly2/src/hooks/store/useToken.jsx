import { useMemo } from "react";
import { useLocalStorageState } from "ahooks";

const TOKEN_KEY = "login_token";
const EXPIRE_KEY = "login_expire";

export function useToken() {
  const [token, setTokenValue] = useLocalStorageState(TOKEN_KEY, {
    defaultValue: "",
  });

  const [expireTime, setExpireTime] = useLocalStorageState(EXPIRE_KEY, {
    defaultValue: 0,
  });

  /**
   * 设置 token
   */
  const setToken = (token, validSeconds = 0) => {
    if (!token) return;

    const expire = Date.now() + validSeconds * 1000;

    setTokenValue(token);
    setExpireTime(expire);
  };

  /**
   * 删除 token
   */
  const delToken = () => {
    setTokenValue("");
    setExpireTime(0);
  };

  /**
   * 剩余有效秒数
   */
  const remainSeconds = useMemo(() => {
    if (!expireTime) return 0;
    return Math.max(0, Math.floor((expireTime - Date.now()) / 1000));
  }, [expireTime]);

  return {
    token: token || "",
    setToken,
    delToken,
    remainSeconds,
  };
}