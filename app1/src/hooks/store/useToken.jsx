import { createMemo } from "solid-js";
import { useStore } from "./useStore";

const TOKEN_KEY = "login_token";
const EXPIRE_KEY = "login_expire";

export function useToken() {
  const [token, setTokenValue] = useStore(TOKEN_KEY, "");
  const [expireTime, setExpireTime] = useStore(EXPIRE_KEY, 0);

  /**
   * 设置 token
   */
  const setToken = (value, validSeconds = 0) => {
    if (!value) return;

    const expire = Date.now() + validSeconds * 1000;

    setTokenValue(value);
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
  const remainSeconds = createMemo(() => {
    const expire = expireTime();
    if (!expire) return 0;

    return Math.max(0, Math.floor((expire - Date.now()) / 1000));
  });

  return {
    token,
    setToken,
    delToken,
    remainSeconds,
  };
}