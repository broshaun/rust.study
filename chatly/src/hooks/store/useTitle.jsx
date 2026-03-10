import { useCallback, useSyncExternalStore } from 'react';
import { useGlobalStore as customUseStore } from './useGlobalStore';

// 唯一标识 Key
const TITLE_KEY = 'global_title';

// 轻量订阅器
let titleSubscribers = new Set();
const subscribeTitle = (callback) => {
  titleSubscribers.add(callback);
  return () => titleSubscribers.delete(callback);
};
const notifyTitleUpdate = () => titleSubscribers.forEach(cb => cb());

/**
 * 全局标题管理 Hook
 * 基于单例 store 实现响应式标题同步
 * @returns {Object} { title: 当前标题, setTitle: 设置标题 }
 */
export function useTitle() {
  // 1. 获取标题模块对应的单例 store 实例
  const titleStore = customUseStore(TITLE_KEY);

  // 2. 响应式获取标题数据
  const title = useSyncExternalStore(
    subscribeTitle,
    () => titleStore.getState().getStore() || "", // 获取存储值，默认为空字符串
    () => "" // 服务端渲染快照
  );

  // 3. 设置标题
  const setTitle = useCallback((newTitle) => {
    // 调用 store 实例的 getState() 后执行 setStore
    titleStore.getState().setStore(newTitle);
    notifyTitleUpdate(); // 触发所有订阅该 Hook 的组件更新
  }, [titleStore]);

  return { title, setTitle };
}