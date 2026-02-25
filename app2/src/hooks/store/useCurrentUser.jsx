import { useCallback, useSyncExternalStore } from "react";
import { useGlobalStore as customUseStore } from "./useGlobalStore";

const CURRENT_USER_KEY = "current_user";

// 订阅器
let subscribers = new Set();

const subscribe = (callback) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
};

const notify = () => {
    subscribers.forEach((cb) => cb());
};

export function useCurrentUser() {
    // 1️⃣ 获取单例 store
    const userStore = customUseStore(CURRENT_USER_KEY);

    // 2️⃣ 响应式读取当前用户
    const user = useSyncExternalStore(
        subscribe,
        () => userStore.getState().getStore(),
        () => null
    );

    // 3️⃣ 设置当前用户
    const setCurrentUser = useCallback(
        (usr) => {
            if (!usr) {
                delCurrentUser();
                return;
            }

            userStore.getState().setStore(usr);
            notify();
        },
        [userStore]
    );

    // 4️⃣ 删除当前用户
    const delCurrentUser = useCallback(() => {
        userStore.getState().removeStore();
        notify();
    }, [userStore]);

    return {
        user,
        setCurrentUser,
        delCurrentUser,
    };
}