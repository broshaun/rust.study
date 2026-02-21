import { useMemo, useCallback } from 'react'
import { useLocalStorageState, useLatest } from 'ahooks'; // ✅ 只加 useLatest

function replacer(key, value) {
  if (value instanceof Map) return Object.fromEntries(value)
  if (value instanceof Date) return value.toISOString()
  if (value === undefined) return null
  return value
}

import { fetch } from '@tauri-apps/plugin-http';


export function useHttpClient(baseUrl) {
  // const apiBase = ''
  const [apiBase] = useLocalStorageState('apiBase', { defaultValue: '' })
  const [loginToken] = useLocalStorageState('zustand:login_token');
  const tokenRef = useLatest(loginToken);

  const getAuthHeaders = useCallback(() => {
    const t = tokenRef.current;
    return t ? { Authorization: t } : {};
  }, [tokenRef]);

  const requestBodyJson = useCallback(
    async (method, payload = {}) => {
      const response = await fetch(`${apiBase}${baseUrl}`, {
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(), // ✅ 每次请求取最新 token
        },
        body: JSON.stringify(payload, replacer),
      })
      return response.json()
    },
    [baseUrl, getAuthHeaders] // ✅ 不再依赖 authHeaders 对象
  )

  const requestParams = useCallback(
    async (method, payload = {}) => {
      const url_params = new URLSearchParams(payload).toString()
      const response = await fetch(`${apiBase}${baseUrl}?${url_params}`, {
        method: method.toUpperCase(),
        headers: getAuthHeaders(), // ✅ 每次请求取最新 token
      })
      return response.json()
    },
    [baseUrl, getAuthHeaders]
  )

  const uploadFiles = useCallback(
    async (file, method = 'PUT') => {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch(`${apiBase}${baseUrl}`, {
        method,
        headers: getAuthHeaders(), // ✅ 每次请求取最新 token
        body: formData,
      })
      return response.json()
    },
    [baseUrl, getAuthHeaders]
  )

  const buildUrl = useCallback(
    (params) => {
      // 1️⃣ 计算完整 base（带域名）
      const origin =
        apiBase ||
        (typeof window !== 'undefined' ? window.location.origin : '')

      const base = `${origin}${baseUrl}`.replace(/\/+$/, '')

      if (params == null) return base

      // 2️⃣ 如果传入的是完整 URL，直接返回
      if (typeof params === 'string' && /^https?:\/\//i.test(params)) {
        return params
      }

      // 3️⃣ 单个 path
      if (typeof params === 'number' || typeof params === 'string') {
        return `${base}/${encodeURIComponent(params)}`
      }

      // 4️⃣ 多级 path
      if (Array.isArray(params)) {
        return `${base}/${params.map(v => encodeURIComponent(String(v))).join('/')}`
      }

      // 5️⃣ query 参数
      if (typeof params === 'object') {
        const qs = new URLSearchParams(
          Object.entries(params).filter(([, v]) => v != null)
        ).toString()

        return qs ? `${base}?${qs}` : base
      }

      return base
    },
    [baseUrl]
  )



  const http = useMemo(
    () => ({ requestBodyJson, requestParams, uploadFiles, buildUrl }),
    [requestBodyJson, requestParams, uploadFiles, buildUrl]
  )
  return { http }
}
