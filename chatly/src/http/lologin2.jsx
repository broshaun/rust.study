// loginUserInfoQuery.js

import { useEffect, useState } from 'react';
import { QueryClient, QueryObserver } from '@tanstack/query-core';
import { useLocalStorage } from '@mantine/hooks';

const ACCOUNT_KEY = 'current_account';
const STALE_TIME = 12 * 60 * 60 * 1000;
const queryClient = new QueryClient();

const key = (userId) => ['login-info', userId];

const queryFn = (apiLogin) => async () => {
    const res = await apiLogin.requestBodyJson('info', {});
    if (!res) throw new Error('获取失败');
    return res.code === 200 ? res.data : {};
};

const fetch = (apiLogin, userId) => {
    if (!userId) return null;
    return queryClient.fetchQuery({
        queryKey: key(userId),
        queryFn: queryFn(apiLogin),
        staleTime: STALE_TIME,
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

const invalidate = (userId) => {
    if (!userId) return null;
    return queryClient.invalidateQueries({ queryKey: key(userId) });
};

const remove = (userId) => {
    if (!userId) return null;
    return queryClient.removeQueries({ queryKey: key(userId) });
};

const useCache = () => {
    const [userId] = useLocalStorage({ key: ACCOUNT_KEY });
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
    invalidate,
    remove,
    useCache,
};

// const userInfo = loginCache.useCache();
// await loginCache.fetch(apiLogin, userId);
// loginCache.set(userId, userInfo);
// const cache = loginCache.get(userId);
// await loginCache.invalidate(userId);