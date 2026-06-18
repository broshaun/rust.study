import { invoke } from "@tauri-apps/api/core";
import { apiBase as apiBase2, tokenStore } from "utils";


function replacer(key, value) {
  if (value instanceof Map) return Object.fromEntries(value);
  if (value instanceof Date) return value.toISOString();
  if (value === undefined) return null;
  return value;
}
function parseResponse(res) {
  if (res === undefined || res === null || res === "") return null;
  try {
    return JSON.parse(res);
  } catch {
    return res;
  }
}
function toBody(body = {}) {
  return JSON.parse(JSON.stringify(body, replacer));
}

async function fileToBytes(file) {
  const buffer = await file.arrayBuffer();
  return Array.from(new Uint8Array(buffer));
}

function createHttpClient(baseUrl = "") {

  const getEndpoint = () => {
    const apiBase = apiBase2.get();
    return `${apiBase || ""}${baseUrl || ""}`;
  };

  const getAuthHeaders = () => {
    const tokenValue = tokenStore.get()?.token;
    return tokenValue ? { Authorization: tokenValue } : {};
  };

  const get = async () => {
    const res = await invoke("http_get", {
      options: {
        url: getEndpoint(),
        headers: getAuthHeaders(),
      },
    });
    return parseResponse(res);
  };

  const getById = async (id) => {
    const res = await invoke("http_get", {
      options: {
        url: `${getEndpoint()}?id=${encodeURIComponent(id)}`,
        headers: getAuthHeaders(),
      },
    });
    return parseResponse(res);
  };

  const requestBodyJson = async (methodName, payload = {}) => {
    const res = await invoke("http_post", {
      options: {
        url: getEndpoint(),
        headers: {
          ...getAuthHeaders(),
          "X-HTTP-Method": methodName,
        },
        body: toBody(payload),
      },
    });
    return parseResponse(res);
  };

  const uploadFiles = async (file) => {
    if (!file) throw new Error("No file selected");
    const res = await invoke("http_upload", {
      url: getEndpoint(),
      fileBytes: await fileToBytes(file),
      fileName: file.name || "file",
    });
    return parseResponse(res);
  };

  return {
    endpoint: getEndpoint(),
    http: {
      get,
      getById,
      requestBodyJson,
      post: requestBodyJson,
      uploadFiles,
    },
  };
}

export { createHttpClient };