import { useCallback, useRef } from 'react';


export function useHtml() {
    const ref = useRef(null);

    const getHtml = useCallback(() => {
        return ref.current?.outerHTML ?? '';
    }, [])
    return { ref, getHtml }
}