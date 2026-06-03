import { useEffect, useState } from "react";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";

const IMAGE_CACHE = new Map();
const IMAGE_TASKS = new Map();

async function loadCachedImage(url) {
  if (IMAGE_CACHE.has(url)) return IMAGE_CACHE.get(url);
  if (IMAGE_TASKS.has(url)) return IMAGE_TASKS.get(url);

  const task = invoke("get_cached_image", { url })
    .then(({ path }) => {
      const src = convertFileSrc(path);
      IMAGE_CACHE.set(url, src);
      IMAGE_TASKS.delete(url);
      return src;
    })
    .catch((error) => {
      IMAGE_TASKS.delete(url);
      throw error;
    });

  IMAGE_TASKS.set(url, task);
  return task;
}

export function useCachedImage(url) {
  const [state, setState] = useState({
    src: url ? IMAGE_CACHE.get(url) || "" : "",
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!url) {
      setState({ src: "", loading: false, error: null });
      return;
    }

    if (IMAGE_CACHE.has(url)) {
      setState({ src: IMAGE_CACHE.get(url), loading: false, error: null });
      return;
    }

    let alive = true;

    setState({ src: "", loading: true, error: null });

    loadCachedImage(url)
      .then((src) => {
        if (alive) setState({ src, loading: false, error: null });
      })
      .catch((error) => {
        if (alive) {
          setState({
            src: "",
            loading: false,
            error: error?.message || String(error),
          });
        }
      });

    return () => {
      alive = false;
    };
  }, [url]);

  return {
    ...state,
    success: !!state.src && !state.error,
  };
}

export async function clearAllImageCache() {
  IMAGE_CACHE.clear();
  IMAGE_TASKS.clear();
  await invoke("clear_image_cache");
}

export function Avatar({ url }) {
  const { src, loading, error } = useCachedImage(url);

  if (loading) return <div>Loading...</div>;
  if (error || !src) return <div>No image</div>;

  return <img src={src} alt="" />;
}