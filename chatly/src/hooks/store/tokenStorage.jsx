import { getStore, setStore, removeStore } from "./appStorage";

const TOKEN_KEY = "login_token";
const EXPIRE_KEY = "login_expire_time";

/* ========= 内部工具 ========= */

const pad = (n) => String(n).padStart(2, "0");

const formatTime = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} `
       + `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const computeExpire = (seconds) => {
  const safe = typeof seconds === "number" && seconds >= 0 ? seconds : 10;
  const actual = Math.max(safe - 10, 10);
  return Date.now() + actual * 1000;
};

/* ========= Token + Expire ========= */

async function setToken(token, seconds) {
  if (!token) return;

  const expireTime = computeExpire(seconds);

  await Promise.all([
    setStore(TOKEN_KEY, token),
    setStore(EXPIRE_KEY, expireTime),
  ]);

  return {
    token,
    expireTime,
    expireAt: formatTime(expireTime),
  };
}

async function getToken() {
  return (await getStore(TOKEN_KEY)) || "";
}

async function getExpireTime() {
  return (await getStore(EXPIRE_KEY)) || 0;
}

async function removeToken() {
  await Promise.all([
    removeStore(TOKEN_KEY),
    removeStore(EXPIRE_KEY),
  ]);
}

/* ========= 状态判断 ========= */

async function isLogged() {
  const token = await getToken();
  return !!token;
}

async function isExpired() {
  const expire = await getExpireTime();
  return !expire || expire <= Date.now();
}

/* ========= HTTP Header ========= */

async function getAuthHeader() {
  const token = await getToken();
  const expired = await isExpired();

  if (!token || expired) return {};

  return {
    Authorization: token,
  };
}

/* ========= 导出 ========= */

export {
  setToken,
  getToken,
  getExpireTime,
  removeToken,

  isLogged,
  isExpired,

  getAuthHeader,

  formatTime,
};