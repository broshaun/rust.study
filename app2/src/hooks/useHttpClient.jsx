import { useMemo, useCallback } from 'react'
import { useLocalStorageState, useLatest } from 'ahooks'; // ✅ 只加 useLatest

function replacer(key, value) {
  if (value instanceof Map) return Object.fromEntries(value)
  if (value instanceof Date) return value.toISOString()
  if (value === undefined) return null
  return value
}

// import { fetch } from '@tauri-apps/plugin-http';
// const apiBase = 'http://localhost:5015'

const apiBase = ''


export function useHttpClient(baseUrl) {
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

  const http = useMemo(
    () => ({ requestBodyJson, requestParams, uploadFiles }),
    [requestBodyJson, requestParams, uploadFiles]
  )
  return { http }
}
