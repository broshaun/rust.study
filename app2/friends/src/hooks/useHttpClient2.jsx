import { useMemo, useCallback } from 'react'
import { useLogin } from "./store/useLogin"


/**
 * 自定义JSON序列化替换器
 * 处理Map、Date等特殊类型
 */
function replacer(key, value) {
  if (value instanceof Map) {
    return Object.fromEntries(value)
  } else if (value instanceof Date) {
    return value.toISOString()
  } else if (value === undefined) {
    return null // 避免JSON.stringify忽略undefined字段
  }
  return value
}

/**
 * Http客户端
 */
export function useHttpClient(baseUrl) {
  const { loginToken } = useLogin()


  /**
   * 统一生成鉴权头
   * 兼容：store / localStorage 已有 token 的情况
   */
  const authHeaders = useMemo(() => {
    const token = loginToken || localStorage.getItem('login_token')
    return token ? { Authorization: token } : {}
  }, [loginToken])

  /**
   * JSON 请求（body）
   */
  const requestBodyJson = useCallback(
    async (method, payload = {}) => {
      const response = await fetch(baseUrl, {
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(payload, replacer),
      })
      return response.json()
    },
    [baseUrl, authHeaders]
  )

  /**
   * URL 参数请求（query）
   */
  const requestParams = useCallback(
    async (method, payload = {}) => {
      const url_params = new URLSearchParams(payload).toString()
      const response = await fetch(`${baseUrl}?${url_params}`, {
        method: method.toUpperCase(),
        headers: authHeaders,
      })
      return response.json()
    },
    [baseUrl, authHeaders]
  )

  /**
   * 文件上传
   * @param {*} file
   * @returns
   * 上传示例：
      <input type="file" id="fileInput" accept="image/*">
      <button onclick="uploadImage()">上传图片</button>

      async function uploadImage() {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0]; // 获取选中的图片文件
        if (!file) {
          alert('请选择图片！');
          return;
        }
        const { http } = useHttpClient('https://api.example.com/upload');

        http.uploadFile(file).then((results) => {
          console.log('results',results);
        })
      }
   */
  const uploadFiles = useCallback(
    async (file, method = 'PUT') => {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch(baseUrl, {
        method,
        headers: authHeaders, // ✅ 上传同样带 token
        body: formData,
      })
      return response.json()
    },
    [baseUrl, authHeaders]
  )

  /**
   * 对外暴露 http 对象
   * 保证引用稳定，方便依赖
   */
  const http = useMemo(
    () => ({ requestBodyJson, requestParams, uploadFiles }),
    [requestBodyJson, requestParams, uploadFiles]
  )

  return { http }
}
