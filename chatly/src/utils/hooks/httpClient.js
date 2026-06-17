import { invoke } from "@tauri-apps/api/core";

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

export function createHttpClient({ apiBase = "", token = "", baseUrl = "" } = {}) {
  const endpoint = `${apiBase}${baseUrl}`;
  const authHeaders = token ? { Authorization: token } : {};

  async function get() {
    const res = await invoke("http_get", {
      options: {
        url: endpoint,
        headers: authHeaders,
      },
    });

    return parseResponse(res);
  }

  async function getById(id) {
    const res = await invoke("http_get", {
      options: {
        url: `${endpoint}?id=${encodeURIComponent(id)}`,
        headers: authHeaders,
      },
    });

    return parseResponse(res);
  }

  async function requestBodyJson(methodName, payload = {}) {
    const res = await invoke("http_post", {
      options: {
        url: endpoint,
        headers: {
          ...authHeaders,
          "X-HTTP-Method": methodName,
        },
        body: toBody(payload),
      },
    });

    return parseResponse(res);
  }

  async function uploadFiles(file) {
    if (!file) throw new Error("No file selected");

    const res = await invoke("http_upload", {
      url: endpoint,
      fileBytes: await fileToBytes(file),
      fileName: file.name || "file",
    });

    return parseResponse(res);
  }

  return {
    endpoint,
    get,
    getById,
    requestBodyJson,
    post: requestBodyJson,
    uploadFiles,
  };
}