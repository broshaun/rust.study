import { useSyncExternalStore, useCallback } from 'react';
import { useGlobal as customUseStore } from './useGlobal';

// 全局消息模块唯一标识
const GLOBAL_MSG_KEY = 'global_message_state';

// 响应式订阅器
let msgSubscribers = new Set();
const subscribeMsg = (callback) => {
  msgSubscribers.add(callback);
  return () => msgSubscribers.delete(callback);
};
const notifyMsgUpdate = () => msgSubscribers.forEach(cb => cb());

// 消息默认初始值（抽离成常量，方便复用和维护）
const DEFAULT_MSG = {
  iconName: 'info-circle',
  iconColor: 'gray',
  msgText: ''
};

/**
 * 全局消息管理Hook
 * @returns {Object} { msg: 消息状态, msgFn: 消息更新方法 }
 */
export function useMsg() {
  // 获取消息模块的store实例（Zustand store实例）
  const msgStore = customUseStore(GLOBAL_MSG_KEY);

  // 全局初始化：仅首次使用时设置默认值
  if (!msgStore.getState().hasStore()) {
    msgStore.getState().setStore(DEFAULT_MSG); // 复用默认常量
  }

  // 响应式获取消息状态
  const msg = useSyncExternalStore(
    subscribeMsg,
    () => msgStore.getState().getStore(),
    () => DEFAULT_MSG // 复用默认常量
  );

  // 消息更新方法（用useCallback缓存，避免组件重渲染）
  const msgFn = useCallback((code, msgText) => {
    let newMsg = {};
    switch (code) {
      case 'success':
        newMsg = { iconName: 'check-circle', iconColor: 'green', msgText };
        break;
      case 'error':
        newMsg = { iconName: 'times-circle', iconColor: 'red', msgText };
        break;
      case 'warning':
        newMsg = { iconName: 'exclamation-circle', iconColor: 'orange', msgText };
        break;
      default:
        newMsg = { ...DEFAULT_MSG, msgText }; // 复用默认常量，仅修改消息文本
        break;
    }

    // 1. 设置当前消息状态
    msgStore.getState().setStore(newMsg);
    notifyMsgUpdate();

    // 2. 3秒后恢复初始值（核心：添加定时器）
    const timer = setTimeout(() => {
      msgStore.getState().setStore(DEFAULT_MSG);
      notifyMsgUpdate();
    }, 1000); // 3000毫秒 = 3秒

    // 3. 清理定时器（避免内存泄漏，可选但推荐）
    return () => clearTimeout(timer);
  }, [msgStore]);

  return { msg, msgFn };
}