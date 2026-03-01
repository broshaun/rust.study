import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useEffect,
  useState,
} from ".store/react@18.3.1/node_modules/react";
import styles from "./ChatMsg.module.css";
import { IconCustomColor } from "components/icon";

const HEAD_RATIO = { leftIcon: 0.39, titleFont: 0.37 };

const ChatMsgContext = createContext(null);

function useChatMsg() {
  const ctx = useContext(ChatMsgContext);
  if (!ctx) throw new Error("ChatMsg.* 必须放在 <ChatMsg> 内部使用");
  return ctx;
}

function ChatMsgRoot({ 
  children, 
  className, 
  width, 
  height,
  // 新增：自定义头像配置
  friendAvatar, // 对方头像（函数/React元素）
  oneselfAvatar, // 自己头像（函数/React元素）
}) {
  const messageRef = useRef(null);
  const stickToBottomRef = useRef(true);

  const api = useMemo(
    () => ({
      messageRef,
      stickToBottomRef,
      scrollToBottom: () => {
        const el = messageRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
      },
      // 把头像配置传入上下文，让 Message 子组件可访问
      friendAvatar,
      oneselfAvatar,
    }),
    [friendAvatar, oneselfAvatar] // 依赖项添加头像配置
  );

  const wrapperStyle = useMemo(() => {
    const style = {};
    if (width) style.width = typeof width === "number" ? `${width}px` : width;
    if (height) style.height = typeof height === "number" ? `${height}px` : height;
    return style;
  }, [width, height]);

  return (
    <ChatMsgContext.Provider value={api}>
      <div
        className={`${styles.wrapper} ${className || ""}`.trim()}
        style={wrapperStyle}
      >
        {children}
      </div>
    </ChatMsgContext.Provider>
  );
}

function Head({ title = "", leftIcon = "", onClick, className }) {
  const headH = 56;
  const iconSize = Math.round(headH * HEAD_RATIO.leftIcon);
  const titleSize = Math.round(headH * HEAD_RATIO.titleFont);

  return (
    <div className={`${styles.head} ${className || ""}`.trim()}>
      <button
        type="button"
        className={`${styles.headBtn} ${
          leftIcon ? "" : styles.headBtnHidden
        }`.trim()}
        onClick={onClick}
        aria-label="header-left-action"
      >
        {leftIcon ? <IconCustomColor name={leftIcon} size={iconSize} /> : null}
      </button>

      <div
        className={styles.headTitle}
        style={{ fontSize: `${titleSize}px` }}
        title={title}
      >
        {title}
      </div>

      <div className={styles.headRightPlaceholder} />
    </div>
  );
}

function Message({
  children,
  className,
  autoScroll = true,
  // 兼容：保留原有的默认头像配置，优先级低于上下文的配置
  selfAvatar = "我",
  otherAvatar = "客",
}) {
  const { 
    messageRef, 
    stickToBottomRef, 
    scrollToBottom,
    // 从上下文获取自定义头像配置
    friendAvatar: ctxFriendAvatar,
    oneselfAvatar: ctxOneselfAvatar
  } = useChatMsg();

  const onScroll = () => {
    const el = messageRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
    stickToBottomRef.current = distanceToBottom < 24;
  };

  useEffect(() => {
    if (!autoScroll) return;
    if (!stickToBottomRef.current) return;
    requestAnimationFrame(scrollToBottom);
  }, [children, autoScroll, scrollToBottom]);

  const isMsgObject = (x) =>
    x &&
    typeof x === "object" &&
    !Array.isArray(x) &&
    ("msg" in x || "signal" in x);

  const isMsgArray = (x) =>
    Array.isArray(x) && (x.length === 0 || isMsgObject(x[0]));

  const normalize = (m, index) => {
    const isSelf = m?.signal === "send";

    return {
      id: String(m?.id ?? `${index}_${m?.timestamp ?? ""}`),
      isSelf,
      msg: String(m?.msg ?? ""),
      timestamp: String(m?.timestamp ?? ""),
    };
  };

  // 新增：渲染头像的核心函数
  const renderAvatar = (isSelf) => {
    // 优先级：上下文自定义头像 > 组件props头像 > 默认文本
    if (isSelf) {
      // 自己的头像：上下文oneselfAvatar > selfAvatar
      if (ctxOneselfAvatar) {
        // 支持函数式（如 () => <Avatar />）或直接传React元素
        return typeof ctxOneselfAvatar === 'function' ? ctxOneselfAvatar() : ctxOneselfAvatar;
      }
      return selfAvatar;
    } else {
      // 对方的头像：上下文friendAvatar > otherAvatar
      if (ctxFriendAvatar) {
        return typeof ctxFriendAvatar === 'function' ? ctxFriendAvatar() : ctxFriendAvatar;
      }
      return otherAvatar;
    }
  };

  const renderList = (arr) => {
    const list = arr.map(normalize);

    return list.map((m) => (
      <div
        key={m.id}
        className={`${styles.chatRow} ${
          m.isSelf ? styles.selfRow : styles.otherRow
        }`}
      >
        {/* 替换原有文本头像为自定义头像渲染 */}
        <div className={styles.avatar}>
          {renderAvatar(m.isSelf)}
        </div>

        <div className={styles.bubbleWrap}>
          <div
            className={`${styles.bubble} ${
              m.isSelf ? styles.selfBubble : styles.otherBubble
            }`}
          >
            {m.msg}
          </div>

          {m.timestamp ? (
            <div className={styles.time}>{m.timestamp}</div>
          ) : null}
        </div>
      </div>
    ));
  };

  const content = isMsgArray(children) ? renderList(children) : children;

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

function Send({
  onSend,
  className,
  placeholder = "输入消息...",
  buttonText = "发送",
  disabled,
  maxRows = 5,
}) {
  const { stickToBottomRef, scrollToBottom } = useChatMsg();
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  const autoResize = () => {
    const el = inputRef.current;
    if (!el) return;

    const lineHeight = 20;
    const maxHeight = lineHeight * maxRows;

    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  };

  useEffect(() => {
    autoResize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doSend = () => {
    const text = value.trim();
    if (!text) return;

    onSend?.(text);

    setValue("");
    stickToBottomRef.current = true;

    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (el) {
        el.style.height = "40px";
        el.style.overflowY = "hidden";
      }
      scrollToBottom();
    });
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      doSend();
    }
  };

  const isBtnDisabled = disabled ?? !value.trim();

  return (
    <div className={`${styles.send} ${className || ""}`.trim()}>
      <textarea
        ref={inputRef}
        className={styles.input}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          requestAnimationFrame(autoResize);
        }}
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

export const ChatMsg = Object.assign(ChatMsgRoot, {
  Head,
  Message,
  Send,
});