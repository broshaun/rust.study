import { memo, useMemo, useCallback } from "react";
import { useApiBase } from "hooks/http";

/**
 * 时间格式化工具
 */
const formatDialogTime = (timestamp) => {
  if (!timestamp) return "";

  const safeTimeStr =
    typeof timestamp === "string" ? timestamp.replace(/-/g, "/") : timestamp;

  const t = new Date(safeTimeStr);
  if (isNaN(t.getTime())) return "";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDay = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  const diffDays = (today - targetDay) / (1000 * 60 * 60 * 24);
  const isThisYear = t.getFullYear() === now.getFullYear();

  if (diffDays === 0) {
    return t.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  if (diffDays === 1) return "昨天";

  if (diffDays > 1 && diffDays <= 6) {
    return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][t.getDay()];
  }

  if (isThisYear) return `${t.getMonth() + 1}月${t.getDate()}日`;

  return `${t.getFullYear()}年${t.getMonth() + 1}月`;
};

/**
 * DialogItem
 * signal === 'news' 时显示红点
 */
export const DialogItem = memo(function DialogItem({
  data,
  virtualRow,
  onSelect,
  onClear,
  onAvatarClick,
  height = 50,
}) {
  const { apiBase } = useApiBase();

  if (!data) return null;

  const name = data.remark || data.nikename || data.email || "未知联系人";
  const email = data.email || "未绑定邮箱";
  const timeStr = formatDialogTime(data.timestamp);
  const showDot = data.signal === "news";

  const avatarSrc = useMemo(() => {
    if (!data?.avatar_url) return "";
    const base = String(apiBase || "").replace(/\/+$/, "");
    const avatarPath = String(data.avatar_url).replace(/^\/+/, "");
    return `${base}/imgs/${avatarPath}`;
  }, [apiBase, data?.avatar_url]);

  const wrapperHeight = typeof height === "number" ? `${height}px` : height;

  const handleSelect = useCallback(() => {
    onSelect?.(data);
  }, [data, onSelect]);

  const handleAvatarClick = useCallback(
    (e) => {
      e.stopPropagation();
      onAvatarClick?.(data);
    },
    [data, onAvatarClick]
  );

  const handleClear = useCallback(
    (e) => {
      e.stopPropagation();
      onClear?.(data);
    },
    [data, onClear]
  );

  return (
    <div
      onClick={handleSelect}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        transform: `translateY(${virtualRow?.start || 0}px)`,

        cursor: "pointer",
        height: wrapperHeight,
        boxSizing: "border-box",
        padding: "2px 10px",
        display: "flex",
        alignItems: "center",
        background: "transparent",
      }}
    >
      {/* 左侧头像 */}
      <div
        style={{
          position: "relative",
          width: 38,
          height: 38,
          flex: "0 0 auto",
          marginRight: 8,
          background: "transparent",
        }}
        onClick={handleAvatarClick}
      >
        {/* 头像本体容器：负责圆角裁剪 */}
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "8px",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
          }}
        >
          <img
            src={avatarSrc}
            alt="avatar"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>

        {/* 红点：放在外层，不会被裁掉 */}
        {showDot && (
          <span
            style={{
              position: "absolute",
              top: -1,
              right: -1,
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: "#ff3b30",
              border: "2px solid var(--panel-bg, #fff)",
              pointerEvents: "none",
              zIndex: 2,
              boxSizing: "border-box",
            }}
          />
        )}
      </div>

      {/* 中间信息区 */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 1,
          background: "transparent",
        }}
      >
        <span
          style={{
            width: "100%",
            fontSize: "14px",
            fontWeight: showDot ? "600" : "500",
            color: "var(--text-primary)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: "17px",
          }}
        >
          {name}
        </span>

        <span
          style={{
            width: "100%",
            fontSize: "11px",
            color: showDot ? "var(--text-primary)" : "var(--text-secondary)",
            opacity: showDot ? 0.9 : 0.72,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: "13px",
          }}
        >
          {email}
        </span>
      </div>

      {/* 右侧操作区 */}
      <div
        style={{
          flex: "0 0 auto",
          width: 48,
          height: "100%",
          marginLeft: 8,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-end",
          gap: 2,
          background: "transparent",
        }}
      >
        <span
          style={{
            width: "100%",
            textAlign: "right",
            fontSize: "10px",
            color: "var(--text-secondary)",
            opacity: 0.45,
            lineHeight: "12px",
            whiteSpace: "nowrap",
          }}
        >
          {timeStr}
        </span>

        <div
          onClick={handleClear}
          style={{
            width: 14,
            height: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            color: "var(--text-secondary)",
            opacity: 0.35,
            background: "transparent",
            flex: "0 0 auto",
            userSelect: "none",
          }}
        >
          ✕
        </div>
      </div>
    </div>
  );
});

export default DialogItem;