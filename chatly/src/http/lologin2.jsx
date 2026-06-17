import { useEffect, useState } from 'react';
import { QueryClient, QueryObserver } from '@tanstack/query-core';
import { useHttpClient } from 'utils';


const queryClient = new QueryClient();
const key = (userId) => ['login-info', userId];
const { http } = useHttpClient('/rpc/chat/login/');

async function loginFn() {
    const res = await http.requestBodyJson('info', {});
    if (!res) {
        throw new Error(res?.message || '获取失败');
    }
    if (res.code === 200) {
        return res.data;
    } else {
        return {}
    }
}

const fetch = (userId) => {
    if (!userId) return null;
    return queryClient.fetchQuery({
        queryKey: key(userId),
        queryFn: () => loginFn(),
        staleTime: 12 * 60 * 60 * 1000,
    });
};

const get = (userId) => {
    return userId ? queryClient.getQueryData(key(userId)) ?? null : null;
};

const set = (userId, data) => {
    if (!userId) return null;
    queryClient.setQueryData(key(userId), data);
    return data;
};

const refresh = (userId) => {
    if (!userId) return null;
    return queryClient.invalidateQueries({ queryKey: key(userId) });
};

const remove = (userId) => {
    if (!userId) return null;
    return queryClient.removeQueries({ queryKey: key(userId) });
};

const useCache = (userId) => {
    const [data, setData] = useState(() => get(userId));
    useEffect(() => {
        if (!userId) return setData(null);
        const observer = new QueryObserver(queryClient, { queryKey: key(userId), enabled: false });
        const unsubscribe = observer.subscribe((result) => { setData(result.data ?? null) });
        setData(get(userId));
        return unsubscribe;
    }, [userId]);
    return data;
};

export const loginCache = {
    key,
    fetch,
    get,
    set,
    refresh,
    remove,
    useCache,
};
