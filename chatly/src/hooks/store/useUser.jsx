import { useCallback, useSyncExternalStore } from '.store/react@18.3.1/node_modules/react';
import { useGlobalStore as customUseStore } from './useGlobalStore';

// 用户模块唯一标识key
const USER_KEY = 'user';

// 轻量订阅器：实现user状态的响应式更新
let userSubscribers = new Set();
const subscribeUser = (callback) => {
  userSubscribers.add(callback);
  return () => userSubscribers.delete(callback);
};
const notifyUserUpdate = () => userSubscribers.forEach(cb => cb());

/**
 * 用户状态管理Hook
 * 基于单例store + 内置localStorage持久化实现
 * @returns {Object} { user: 用户信息, setUser: 设置用户信息, delUser: 删除用户信息 }
 */
export function useUser() {
  // 1. 获取用户模块对应的单例store实例（你的useStore返回Zustand store实例）
  const userStore = customUseStore(USER_KEY);

  // 2. 响应式获取用户信息（核心修复：先getState()再调用getStore()）
  const user = useSyncExternalStore(
    subscribeUser,
    () => userStore.getState().getStore(), // ✅ 修复：Zustand实例需先getState()
    () => undefined // 初始快照
  );

  // 3. 设置用户信息（利用store内置localStorage，无需手动操作）
  const setUser = useCallback((usr) => {
    if (usr == null) return delUser();
    // ✅ 修复：调用store实例的getState()后执行setStore
    userStore.getState().setStore(usr);
    notifyUserUpdate(); // 通知组件更新
  }, [userStore]);

  // 4. 删除用户信息（store自动清理localStorage）
  const delUser = useCallback(() => {
    // ✅ 修复：调用store实例的getState()后执行removeStore
    userStore.getState().removeStore();
    notifyUserUpdate(); // 通知组件更新
  }, [userStore]);

  return { setUser, delUser, user };
}