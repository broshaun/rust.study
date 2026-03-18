import React, { createContext, useContext, useMemo, useRef, useState } from "react";
import styles from "./ChatMsg.module.css";

const ChatMsgContext = createContext(null);

/**
 * 钩子：获取聊天窗口上下文
 */
export const useChatMsg = () => {
  const context = useContext(ChatMsgContext);
  if (!context) {
    throw new Error("useChatMsg 必须在 ChatMsg 组件内使用");
  }
  return context;
};

/**
 * ChatMsg - 聊天窗口主容器
 */
export const ChatMsg = ({
  children,
  width = "100%",
  height = "100%",
  style,
  className = "",
  ref // ✅ React 19 直接解构 ref
}) => {
  const contentRef = useRef(null);

  const api = useMemo(
    () => ({
      contentRef,
      // 滚动到底部逻辑
      scrollToBottom: (instant = false) => {
        const el = contentRef.current;
        if (el) {
          el.scrollTo({
            top: el.scrollHeight,
            behavior: instant ? "auto" : "smooth",
          });
        }
      },
    }),
    []
  );

  return (
    <ChatMsgContext.Provider value={api}>
      <div
        ref={ref}
        className={`${styles.wrapper} ${className}`}
        style={{ width, height, ...style }}
      >
        {children}
      </div>
    </ChatMsgContext.Provider>
  );
};

/**
 * Meta - 聊天头部
 */
const Meta = ({ title, left, right }) => (
  <div className={styles.head}>
    <div className={styles.side}>{left}</div>
    <div className={styles.title}>{title}</div>
    <div className={styles.side} style={{ justifyContent: "flex-end" }}>
      {right}
    </div>
  </div>
);

/**
 * Content - 消息内容区
 */
const Content = ({ children }) => {
  const { contentRef } = useChatMsg();
  return (
    <div ref={contentRef} className={styles.content}>
      {children}
    </div>
  );
};

/**
 * Send - 发送区域
 */
const Send = ({ onSend, placeholder = "输入消息..." }) => {
  const [val, setVal] = useState("");
  const { scrollToBottom } = useChatMsg();

  const handleSend = () => {
    const text = val.trim();
    if (!text) return;
    onSend?.(text);
    setVal("");

    // ✅ React 19 优化：在下一帧执行滚动，确保 DOM 已渲染新消息
    requestAnimationFrame(() => {
      scrollToBottom();
    });
  };

  const handleInput = (e) => {
    setVal(e.target.value);
    // 自动高度调整逻辑
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
  };

  return (
    <div className={styles.send}>
      <textarea
        value={val}
        rows={1}
        onChange={handleInput}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder={placeholder}
        className={styles.input}
      />
      <button onClick={handleSend} className={styles.btn}>
        发送
      </button>
    </div>
  );
};

// 静态组件挂载
ChatMsg.Meta = Meta;
ChatMsg.Content = Content;
ChatMsg.Send = Send;

export default ChatMsg;