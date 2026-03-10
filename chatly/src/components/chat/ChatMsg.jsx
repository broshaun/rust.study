import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
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
  // meta 仅用于存储跨组件状态，不触发渲染
  const meta = useRef({ receiveAvatar: null, sendAvatar: null });
  const contentRef = useRef(null);

  // 使用 useCallback 包装，确保 api 对象引用稳定
  const scrollToBottom = useCallback(() => {
    const el = contentRef.current;
    if (el) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth", // 增加平滑滚动体验
      });
    }
  }, []);

  const api = useMemo(
    () => ({
      messageRef: contentRef,
      meta: meta.current,
      scrollToBottom,
    }),
    [scrollToBottom]
  );

  const combinedStyle = useMemo(() => ({
    width: width ?? (fitContainer ? "100%" : undefined),
    height: height,
    flex: fitContainer && height == null ? 1 : undefined,
    minWidth: 0,
    minHeight: 0,
    ...style,
  }), [width, height, fitContainer, style]);

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

  // 仅在头像数据真实变化时同步到 ref
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

  // 优化滚动监听：判断是否接近底部
  const onScroll = useCallback(() => {
    const el = messageRef.current;
    if (!el) return;
    // 阈值设为 50px，容错性更高
    const offset = el.scrollHeight - (el.scrollTop + el.clientHeight);
    isAtBottom.current = offset < 50;
  }, [messageRef]);

  // 当子元素（消息列表）变化时，判定是否自动触底
  useEffect(() => {
    if (autoScroll && isAtBottom.current) {
      // 使用 setTimeout 确保 DOM 渲染完成
      const timer = setTimeout(scrollToBottom, 64);
      return () => clearTimeout(timer);
    }
  }, [children, autoScroll, scrollToBottom]);

  const contentStyle = useMemo(() => ({
    flex: height == null ? "1 1 auto" : `0 0 ${typeof height === "number" ? `${height}px` : height}`,
    minHeight: 0,
    ...style,
  }), [height, style]);

  return (
    <div
      ref={messageRef}
      onScroll={onScroll}
      className={`${styles.content} ${className}`.trim()}
      style={contentStyle}
    >
      {children}
      {/* 锚点用于标记绝对底部 */}
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

  const adjustHeight = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "40px"; // 重置以重新计算 scrollHeight
    const newHeight = Math.min(el.scrollHeight, maxRows * 20 + 20); // 20 为 line-height
    el.style.height = `${newHeight}px`;
    el.style.overflowY = el.scrollHeight > newHeight ? "auto" : "hidden";
  }, [maxRows]);

  const handleSend = () => {
    const text = value.trim();
    if (!text) return;

    onSend?.(text);
    setValue("");

    // 发送后重置样式
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.style.height = "40px";
        inputRef.current.style.overflowY = "hidden";
      }
      scrollToBottom();
    }, 0);
  };

  return (
    <div className={styles.send} style={style}>
      <textarea
        ref={inputRef}
        value={value}
        rows={1}
        onChange={(e) => {
          setValue(e.target.value);
          adjustHeight();
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