import React, { createContext, useContext, useMemo, useRef, useState } from "react";
import styles from "./ChatMsg.module.css";

const ChatMsgContext = createContext(null);
export const useChatMsg = () => useContext(ChatMsgContext);

export const ChatMsg = ({
  children,
  width = "100%",
  height = "100%",
  style,
  className = ""
}) => {
  const contentRef = useRef(null);

  const api = useMemo(
    () => ({
      contentRef,
      scrollToBottom: () => {
        const el = contentRef.current;
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      }
    }),
    []
  );

  return (
    <ChatMsgContext.Provider value={api}>
      <div
        className={[styles.wrapper, className].filter(Boolean).join(" ")}
        style={{ width, height, ...style }}
      >
        {children}
      </div>
    </ChatMsgContext.Provider>
  );
};

const Meta = ({ title, left, right }) => (
  <div className={styles.head}>
    <div className={styles.side}>{left}</div>
    <div className={styles.title}>{title}</div>
    <div className={styles.side} style={{ justifyContent: "flex-end" }}>
      {right}
    </div>
  </div>
);

const Content = ({ children }) => {
  const { contentRef } = useChatMsg();
  return (
    <div ref={contentRef} className={styles.content}>
      {children}
    </div>
  );
};

const Send = ({ onSend, placeholder = "输入消息..." }) => {
  const [val, setVal] = useState("");
  const { scrollToBottom } = useChatMsg();

  const handleSend = () => {
    const text = val.trim();
    if (!text) return;
    onSend?.(text);
    setVal("");
    setTimeout(scrollToBottom, 64);
  };

  return (
    <div className={styles.send}>
      <textarea
        value={val}
        rows={1}
        onChange={(e) => setVal(e.target.value)}
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

Object.assign(ChatMsg, { Meta, Content, Send });

export default ChatMsg;