import React, { createContext, useContext, useMemo, useRef, useState } from "react";
import styles from "./ChatMsg.module.css";

const ChatMsgContext = createContext(null);

export const useChatMsg = () => {
  const context = useContext(ChatMsgContext);
  if (!context) {
    throw new Error("useChatMsg 必须在 ChatMsg 组件内使用");
  }
  return context;
};

export const ChatMsg = ({
  children,
  width = "100%",
  height = "100%",
  style,
  className = "",
  ref,
  theme,
}) => {
  const contentRef = useRef(null);

  const api = useMemo(
    () => ({
      contentRef,
      scrollToBottom: (instant = false) => {
        const el = contentRef.current;
        if (!el) return;

        el.scrollTo({
          top: el.scrollHeight,
          behavior: instant ? "auto" : "smooth",
        });
      },
    }),
    []
  );

  return (
    <ChatMsgContext.Provider value={api}>
      <div
        ref={ref}
        data-theme={theme}
        className={[styles.wrapper, className].filter(Boolean).join(" ")}
        style={{ width, height, ...style }}
      >
        {children}
      </div>
    </ChatMsgContext.Provider>
  );
};

const Meta = ({ title, left, right }) => {
  return (
    <div className={styles.head}>
      <div className={styles.side}>{left}</div>
      <div className={styles.title}>{title}</div>
      <div className={styles.sideRight}>{right}</div>
    </div>
  );
};

const Content = ({ children }) => {
  const { contentRef } = useChatMsg();

  return (
    <div ref={contentRef} className={styles.content}>
      {children}
    </div>
  );
};

const Send = ({
  onSend,
  placeholder = "输入消息...",
  disabled = false,
  loading = false,
  maxRows = 3,
}) => {
  const [val, setVal] = useState("");
  const { scrollToBottom } = useChatMsg();
  const textareaRef = useRef(null);

  const getLineHeight = () => 20;
  const getBaseHeight = () => 42;

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;

    const lineHeight = getLineHeight();
    const maxHeight = lineHeight * maxRows + 22; // padding 近似补偿

    el.style.height = `${getBaseHeight()}px`;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  };

  const resetTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = `${getBaseHeight()}px`;
  };

  const handleSend = async () => {
    const text = val.trim();
    if (!text || disabled || loading) return;

    const maybePromise = onSend?.(text);

    setVal("");
    requestAnimationFrame(() => {
      resetTextarea();
      scrollToBottom();
    });

    if (maybePromise && typeof maybePromise.then === "function") {
      try {
        await maybePromise;
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleChange = (e) => {
    setVal(e.target.value);
    requestAnimationFrame(resizeTextarea);
  };

  return (
    <div className={styles.send}>
      <textarea
        ref={textareaRef}
        value={val}
        rows={1}
        disabled={disabled || loading}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder={placeholder}
        className={styles.input}
      />

      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || loading}
        className={styles.btn}
      >
        {loading ? "发送中..." : "发送"}
      </button>
    </div>
  );
};

ChatMsg.Meta = Meta;
ChatMsg.Content = Content;
ChatMsg.Send = Send;

export default ChatMsg;