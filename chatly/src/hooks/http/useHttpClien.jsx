import { useMemo, useCallback } from "react";
import { fetch } from "@tauri-apps/plugin-http";
import { useApiBase } from "./useApiBase";
import { useToken } from "hooks";

/**
 * JSON 序列化转换器
 */
function replacer(key, value) {
  if (value instanceof Map) return Object.fromEntries(value);
  if (value instanceof Date) return value.toISOString();
  if (value === undefined) return null;
  return value;
}

/**
 * 路径拼接工具函数（处理多余斜杠、空值）
 * @param {string} base - 基础路径
 * @returns {Object} - 包含 join 方法的对象，同时保留字符串特性
 */
function createPathHelper(base) {
  const pathObj = {
    // 核心：拼接路径片段（支持多个参数/自动处理斜杠）
    join(...fragments) {
      // 过滤空值 + 去除每个片段首尾的斜杠
      const validFragments = [base, ...fragments].filter(Boolean).map(frag => 
        frag.toString().replace(/^\/+|\/+$/g, "")
      );
      // 拼接并确保路径正确（避免开头/结尾多余斜杠）
      return validFragments.join("/");
    },
    // 保留字符串原始值（避免类型异常）
    toString() {
      return base;
    },
    // 兼容直接取值
    valueOf() {
      return base;
    }
  };

  // 让对象可以直接作为字符串使用（隐式转换）
  return new Proxy(pathObj, {
    get(target, prop) {
      // 优先返回自定义方法/属性
      if (prop in target) return target[prop];
      // 否则返回字符串的原生属性（如 length、charAt 等）
      return base[prop];
    },
    apply(target, thisArg, args) {
      return base(...args);
    },
    // 隐式转换为字符串
    toString: () => base,
    valueOf: () => base
  });
}

export function useHttpClient(baseUrl = "") {
  const { apiBase } = useApiBase();
  const { token } = useToken();

  // ✅ 核心修改：用路径工具函数包装 endpoint，新增 join 方法
  const endpoint = useMemo(() => {
    const origin = String(apiBase || "").replace(/\/+$/, "");
    const path = String(baseUrl || "").replace(/^\/+/, "");
    const rawEndpoint = origin && path ? `${origin}/${path}` : origin || path;
    // 创建带 join 方法的 endpoint 对象
    return createPathHelper(rawEndpoint);
  }, [apiBase, baseUrl]);

  const request = useCallback(
    async (url, options = {}) => {
      const { method = "POST", headers = {}, body } = options;
      const isFormData = body instanceof FormData;

      const res = await fetch(url, {
        method,
        headers: {
          ...(token ? { Authorization: token } : {}),
          ...(isFormData || body === undefined
            ? {}
            : { "Content-Type": "application/json" }),
          ...headers,
        },
        body:
          body === undefined
            ? undefined
            : isFormData
              ? body
              : JSON.stringify(body, replacer),
      });

      if (!res.ok) {
        let message = `HTTP ${res.status}`;

        try {
          const err = await res.clone().json();
          message = err?.message || err?.msg || message;
        } catch {}

        throw new Error(message);
      }

      return res.json();
    },
    [token]
  );

  const requestBodyJson = useCallback(
    (methodName, payload = {}) =>
      request(endpoint, { // endpoint 可直接作为字符串使用
        method: "POST",
        headers: {
          "X-HTTP-Method": methodName,
        },
        body: payload,
      }),
    [endpoint, request]
  );

  const getById = useCallback(
    (id) =>
      request(`${endpoint}?id=${encodeURIComponent(id)}`, { // 直接拼接字符串也兼容
        method: "GET",
      }),
    [endpoint, request]
  );

  const uploadFiles = useCallback(
    (file, method = "POST", fieldName = "file") => {
      const formData = new FormData();
      formData.append(fieldName, file);

      return request(endpoint, { // 兼容原用法
        method,
        body: formData,
      });
    },
    [endpoint, request]
  );

  const http = useMemo(
    () => ({
      request,
      requestBodyJson,
      post: requestBodyJson,
      getById,
      uploadFiles,
    }),
    [request, requestBodyJson, getById, uploadFiles]
  );

  return {
    http,
    endpoint, // 返回带 join 方法的 endpoint
  };
}