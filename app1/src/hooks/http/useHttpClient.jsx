import { createMemo } from "solid-js";
import { fetch as fetcher } from "@tauri-apps/plugin-http";
import { useApiBase } from "./useApiBase";
import { useStore } from "hooks/store";

export function replacer(key, value) {
  if (value instanceof Map) return Object.fromEntries(value);
  if (value instanceof Date) return value.toISOString();
  if (value === undefined) return null;
  return value;
}

export function useHttpClient(baseUrl = "") {
  const { apiBase } = useApiBase();
  const [loginToken] = useStore("login_token", "");

  const endpoint = createMemo(() => {
    const origin = String(apiBase() || "").replace(/\/+$/, "");
    const path = String(baseUrl || "").replace(/^\/+/, "");
    return origin && path ? `${origin}/${path}` : origin || path;
  });

  const getAuthHeaders = () => {
    const token = loginToken();
    return token ? { Authorization: token } : {};
  };

  const request = (url, options = {}) => {
    const { method = "POST", headers = {}, body } = options;
    const isFormData = body instanceof FormData;

    return fetcher(url, {
      method,
      headers: {
        ...getAuthHeaders(),
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
    }).then((res) => {
      if (!res.ok) {
        let message = `HTTP ${res.status}`;

        return res
          .clone()
          .json()
          .then((err) => {
            throw new Error(err?.message || err?.msg || message);
          })
          .catch(() => {
            throw new Error(message);
          });
      }

      return res.json();
    });
  };

  const post = (methodName, payload = {}) =>
    request(endpoint(), {
      method: "POST",
      headers: {
        "X-HTTP-Method": methodName,
      },
      body: payload,
    });

  const getById = (id) =>
    request(`${endpoint()}?id=${encodeURIComponent(id)}`, {
      method: "GET",
    });

  const uploadFiles = (file, method = "POST", fieldName = "file") => {
    const formData = new FormData();
    formData.append(fieldName, file);

    return request(endpoint(), {
      method,
      body: formData,
    });
  };

  return {
    endpoint,
    http: {
      request,
      requestBodyJson: post,
      post,
      getById,
      uploadFiles,
    },
  };
}