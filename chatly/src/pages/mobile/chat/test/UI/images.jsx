import { useEffect, useState } from "react";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";

const MEMORY_CACHE = new Map();

export function useCachedImage(url) {
    const [state, setState] = useState(() => {
        const cached = url ? MEMORY_CACHE.get(url) : null;

        return cached
            ? { src: cached, loading: false, error: null, success: true }
            : { src: "", loading: false, error: null, success: false };
    });

    useEffect(() => {
        if (!url) {
            setState({ src: "", loading: false, error: null, success: false });
            return;
        }

        const cached = MEMORY_CACHE.get(url);
        if (cached) {
            setState({ src: cached, loading: false, error: null, success: true });
            return;
        }

        let cancelled = false;

        async function load() {
            setState((prev) => ({
                ...prev,
                loading: true,
                error: null,
                success: false,
            }));

            try {
                const result = await invoke("get_cached_image", { url });

                const src = convertFileSrc(result.path);

                MEMORY_CACHE.set(url, src);

                if (!cancelled) {
                    setState({
                        src,
                        loading: false,
                        error: null,
                        success: true,
                    });
                }
            } catch (e) {
                if (!cancelled) {
                    setState({
                        src: "",
                        loading: false,
                        error: e?.message || String(e) || "Load failed",
                        success: false,
                    });
                }
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [url]);

    return state;
}

export async function clearAllImageCache() {
    MEMORY_CACHE.clear();
    await invoke("clear_image_cache");
}



export const Avatar = ({ url }) => {
    const { src, loading, error } = useCachedImage(url);

    if (loading) return <div>Loading...</div>;
    if (error || !src) return <div>No image</div>;

    return <img src={src} alt="" />;
}