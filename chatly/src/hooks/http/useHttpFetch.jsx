import { useCallback } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

const fetchImpl = isTauri()
  ? tauriFetch
  : window.fetch.bind(window);

export function useHttpFetch() {
  const fetcher = useCallback((url, options = {}) => {
    return fetchImpl(url, options);
  }, []);

  return { fetcher };
}