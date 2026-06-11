import { useEffect, useState } from "react";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";

export function useCachedImage(url) {
    const [state, setState] = useState({ src: "", loading: false, error: null });

    useEffect(() => {
        if (!url) {
            setState({ src: "", loading: false, error: null });
            return;
        }
        let cancelled = false;
        setState({ src: "", loading: true, error: null });
        invoke("get_image_cached", { url })
            .then((path) => {
                if (cancelled) return;
                setState({ src: convertFileSrc(path), loading: false, error: null });
            })
            .catch((error) => {
                if (cancelled) return;
                setState({ src: "", loading: false, error: String(error) });
            });
        return () => {
            cancelled = true;
        };
    }, [url]);
    return state;
}

export async function clearAllImageCache() {
    await invoke("clear_image_cache");
}