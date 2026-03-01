import { useCallback, useRef } from '.store/react@18.3.1/node_modules/react';


export function useHtml() {
    const ref = useRef(null);

    const getHtml = useCallback(() => {
        return ref.current?.outerHTML ?? '';
    }, [])
    return { ref, getHtml }
}