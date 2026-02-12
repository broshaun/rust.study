import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useEffect,
  useState,
} from "react";
import styles from "./ChatBox.module.css";

const ChatBoxContext = createContext(null);

function useChatBox() {
  const ctx = useContext(ChatBoxContext);
  if (!ctx) throw new Error("ChatBox.* 必须放在 <ChatBox> 内部使用");
  return ctx;
}

function isMsgObject(x) {
  return (
    x &&
    typeof x === "object" &&
    !Array.isArray(x) &&
    ("msg" in x || "from" in x || "timestamp" in x)
  );
}

function isMsgArray(children) {
  return (
    Array.isArray(children) &&
    (children.length === 0 || isMsgObject(children[0]))
  );
}

/** Root：外层容器（自适应父级） */
function ChatBoxRoot({
  children,
  className,
  userId = "698d51f3d63d2413753b8bdd",
  nickname = "用户",
}) {
  const messageRef = useRef(null);

  // 用户是否贴底（用 ref 避免频繁 re-render）
  const stickToBottomRef = useRef(true);

  const api = useMemo(
    () => ({
      messageRef,
      stickToBottomRef,
      userId,
      nickname,
      scrollToBottom: () => {
        const el = messageRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
      },
    }),
    [userId, nickname]
  );

  return (
    <ChatBoxContext.Provider value={api}>
      <div className={`${styles.wrapper} ${className || ""}`.trim()}>
        {children}
      </div>
    </ChatBoxContext.Provider>
  );
}

/** Head：顶部冻结 */
function Head({ children, className }) {
  return (
    <div className={`${styles.head} ${className || ""}`.trim()}>
      {children}
    </div>
  );
}

/**
 * Message：中部唯一滚动容器
 * - children 若是 msgs（对象数组） => 自动渲染气泡
 * - children 若是任意 JSX => 原样渲染
 */
function Message({ children, className, autoScroll = true }) {
  const { messageRef, stickToBottomRef, userId, nickname, scrollToBottom } =
    useChatBox();

  const onScroll = () => {
    const el = messageRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
    stickToBottomRef.current = distanceToBottom < 24;
  };

  // children 更新：仅贴底时自动滚到底
  useEffect(() => {
    if (!autoScroll) return;
    if (!stickToBottomRef.current) return;
    requestAnimationFrame(scrollToBottom);
  }, [children, autoScroll, scrollToBottom, stickToBottomRef]);

  const renderMsgsAsBubbles = (arr) => {
    return arr.map((m, i) => {
      const isSelf = String(m.from) === String(userId);
      const avatar = isSelf ? (nickname?.[0] || "我") : "客";
      const key = `${i}_${m.timestamp || ""}_${m.from || ""}`;

      return (
        <div
          key={key}
          className={`${styles.msgItem} ${isSelf ? styles.selfMsg : styles.otherMsg}`}
        >
          <div className={styles.avatar}>{avatar}</div>

          <div className={styles.bubbleWrap}>
            <div className={styles.msgContent}>{String(m.msg ?? "")}</div>
            {!!m.timestamp && <div className={styles.time}>{m.timestamp}</div>}
          </div>
        </div>
      );
    });
  };

  const content = isMsgArray(children) ? renderMsgsAsBubbles(children) : children;

  return (
    <div
      ref={messageRef}
      onScroll={onScroll}
      className={`${styles.message} ${className || ""}`.trim()}
    >
      {content}
      <div className={styles.bottomAnchor} />
    </div>
  );
}

/** Send：底部冻结输入框 */
function Send({
  onSend,
  className,
  placeholder = "输入消息...",
  buttonText = "发送",
  disabled,
}) {
  const { stickToBottomRef, scrollToBottom } = useChatBox();
  const [value, setValue] = useState("");

  const doSend = () => {
    const text = value.trim();
    if (!text) return;

    if (typeof onSend === "function") onSend(text);

    setValue("");

    // 发送后强制贴底
    stickToBottomRef.current = true;
    requestAnimationFrame(scrollToBottom);
  };

  const onKeyDown = (e) => {
    // Enter 发送；Shift+Enter 换行
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      doSend();
    }
  };

  const isBtnDisabled = disabled ?? !value.trim();

  return (
    <div className={`${styles.send} ${className || ""}`.trim()}>
      <textarea
        className={styles.input}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={1}
      />
      <button
        className={styles.btn}
        onClick={doSend}
        disabled={isBtnDisabled}
        type="button"
      >
        {buttonText}
      </button>
    </div>
  );
}

export const ChatBox = Object.assign(ChatBoxRoot, {
  Head,
  Message,
  Send,
});
