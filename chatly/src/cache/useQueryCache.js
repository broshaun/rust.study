import { useEffect, useState } from 'react';
import { emptyState, queryClient } from './helper/createQueryCache';

export function useQueryCache(cache, ...args) {
    const [state, setState] = useState(emptyState);
    useEffect(() => {
        const queryKey = cache.key(...args);
        const exists = queryClient.getQueryCache().find({ queryKey, exact: true });
        const unsubscribe = cache.subscribe(...args, setState);
        if (!exists) cache.fetch(...args).catch(() => { });
        return unsubscribe;
    }, [cache, ...args]);

    return {
        ...state,
        refetch: () => cache.refresh(...args)
    };
}