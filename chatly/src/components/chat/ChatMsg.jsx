import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useEffect,
  useState,
} from "react";
import styles from "./ChatMsg.module.css";

const ChatMsgContext = createContext(null);

export const useChatMsg = () => {
  const ctx = useContext(ChatMsgContext);
  if (!ctx) throw new Error("ChatMsg 子组件必须在 <ChatMsg> 内部使用");
  return ctx;
};

/* ---------------- Root ---------------- */
const ChatMsgRoot = ({
  children,
  className = "",
  width,
  height,
  style,
  fitContainer = true,
}) => {
  const meta = useRef({ receiveAvatar: null, sendAvatar: null });
  const contentRef = useRef(null);

  const api = useMemo(
    () => ({
      messageRef: contentRef,
      meta: meta.current,
      scrollToBottom: () => {
        const el = contentRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      },
    }),
    []
  );

  const combinedStyle = {
    width: width ?? (fitContainer ? "100%" : undefined),
    height: height, // 不再默认 height:100%
    flex: fitContainer && height == null ? 1 : undefined,
    minWidth: 0,
    minHeight: 0,
    ...style,
  };

  return (
    <ChatMsgContext.Provider value={api}>
      <div className={`${styles.wrapper} ${className}`.trim()} style={combinedStyle}>
        {children}
      </div>
    </ChatMsgContext.Provider>
  );
};

/* ---------------- Meta ---------------- */
const Meta = ({
  title,
  left,
  right,
  receiveAvatar,
  sendAvatar,
  className = "",
  style,
}) => {
  const { meta } = useChatMsg();

  useEffect(() => {
    meta.receiveAvatar = receiveAvatar;
    meta.sendAvatar = sendAvatar;
  }, [meta, receiveAvatar, sendAvatar]);

  return (
    <div className={`${styles.head} ${className}`.trim()} style={style}>
      <div className={styles.headSide}>{left}</div>
      <div className={styles.headTitle}>{title}</div>
      <div className={`${styles.headSide} ${styles.headSideRight}`}>{right}</div>
    </div>
  );
};

/* ---------------- Content ---------------- */
const Content = ({ children, className = "", autoScroll = true, style, height }) => {
  const { messageRef, scrollToBottom } = useChatMsg();
  const isAtBottom = useRef(true);

  const onScroll = () => {
    const el = messageRef.current;
    if (!el) return;
    isAtBottom.current = el.scrollHeight - (el.scrollTop + el.clientHeight) < 30;
  };

  useEffect(() => {
    if (autoScroll && isAtBottom.current) {
      requestAnimationFrame(scrollToBottom);
    }
  }, [children, autoScroll, scrollToBottom]);

  const contentStyle = {
    flex: height == null ? 1 : `0 0 ${typeof height === "number" ? `${height}px` : height}`,
    minHeight: 0,
    ...style,
  };

  return (
    <div
      ref={messageRef}
      onScroll={onScroll}
      className={`${styles.content} ${className}`.trim()}
      style={contentStyle}
    >
      {children}
      <div className={styles.bottomAnchor} />
    </div>
  );
};

/* ---------------- Send ---------------- */
const Send = ({
  onSend,
  placeholder = "输入消息...",
  buttonText = "发送",
  disabled,
  maxRows = 5,
  style,
}) => {
  const { scrollToBottom } = useChatMsg();
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  const handleSend = () => {
    const text = value.trim();
    if (!text) return;

    onSend?.(text);
    setValue("");

    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.style.height = "40px";
        inputRef.current.style.overflowY = "hidden";
      }
      scrollToBottom();
    });
  };

  return (
    <div className={styles.send} style={style}>
      <textarea
        ref={inputRef}
        value={value}
        rows={1}
        onChange={(e) => {
          setValue(e.target.value);
          e.target.style.height = "auto";
          e.target.style.height = `${Math.min(e.target.scrollHeight, maxRows * 20)}px`;
          e.target.style.overflowY =
            e.target.scrollHeight > maxRows * 20 ? "auto" : "hidden";
        }}
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
        disabled={disabled || !value.trim()}
        className={styles.btn}
      >
        {buttonText}
      </button>
    </div>
  );
};

export const ChatMsg = Object.assign(ChatMsgRoot, {
  Meta,
  Content,
  Send,
});