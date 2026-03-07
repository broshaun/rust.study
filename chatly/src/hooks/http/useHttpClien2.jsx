import { useMemo, useCallback } from "react";
import { useLatest, useLocalStorageState } from "ahooks";
import { useApiBase } from "./useApiBase";

/**
 * JSON 序列化转换器
 * 解决原生 JSON.stringify 无法处理 Map、Date 以及 undefined 的问题
 */
function replacer(key, value) {
  if (value instanceof Map) return Object.fromEntries(value);
  if (value instanceof Date) return value.toISOString();
  if (value === undefined) return null;
  return value;
}

/**
 * 基于 Fetch 封装的 HTTP 客户端 Hook
 * @param {string} baseUrl - 业务模块的基础路径
 * @returns {object} { http, endpoint }
 */
export function useHttpClient(baseUrl) {
  const { apiBase } = useApiBase();

  // 从本地存储获取登录令牌
  const [loginToken] = useLocalStorageState("zustand:login_token");

  // 使用 useLatest 确保异步回调中始终能引用到最新的 Token 值
  const tokenRef = useLatest(loginToken);

  /**
   * 计算最终的 API 接入点地址 (Endpoint)
   * 逻辑：仅处理 apiBase 和 baseUrl 之间的拼接缝隙，不强制修改末尾格式
   */
  const endpoint = useMemo(() => {
    // 移除前缀末尾的斜杠
    const origin = (apiBase || "").replace(/\/+$/, "");
    // 移除路径开头的斜杠
    const path = (baseUrl || "").replace(/^\/+/, "");

    // 如果两个都有，中间加一个斜杠；否则直接返回存在的那个
    // 注意：这里不再对 path 的末尾做任何 replace 或强加操作
    return origin && path ? `${origin}/${path}` : (origin || path);
  }, [apiBase, baseUrl]);

  /**
   * 内部方法：构造鉴权请求头
   */
  const getAuthHeaders = useCallback(() => {
    const t = tokenRef.current;
    return t ? { Authorization: t } : {};
  }, [tokenRef]);

  /**
   * 发起 POST 请求
   */
  const post = useCallback(
    async (method, payload = {}) => {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "X-HTTP-Method": method,
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload, replacer),
      });
      return res.json();
    },
    [endpoint, getAuthHeaders]
  );

  /**
   * 发起 GET 请求
   */
  const getById = useCallback(
    async (id) => {
      // 这里的逻辑也需要注意，如果 endpoint 没斜杠，拼出来就是 "...?id=xxx"
      // 这通常是标准做法
      const url = `${endpoint}?id=${id}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return res.json();
    },
    [endpoint, getAuthHeaders]
  );

  /**
   * 上传文件
   */
  const uploadFiles = useCallback(
    async (file, method = "POST") => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(endpoint, {
        method,
        headers: getAuthHeaders(),
        body: formData,
      });
      return res.json();
    },
    [endpoint, getAuthHeaders]
  );

  /**
   * 核心请求方法聚合对象
   */
  const http = useMemo(
    () => ({
      post,
      getById,
      uploadFiles
    }),
    [post, getById, uploadFiles]
  );

  return { http, endpoint };
}