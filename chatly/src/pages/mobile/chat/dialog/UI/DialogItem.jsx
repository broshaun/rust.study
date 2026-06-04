import { memo, useCallback, useMemo } from "react";
import { useApiBase } from "utils";
import { SafeAvatar } from "components";

const WEEK_DAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const DAY_MS = 86400000;

const formatDialogTime = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(
    typeof timestamp === "string" ? timestamp.replace(/-/g, "/") : timestamp
  );

  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today - target) / DAY_MS);

  if (diffDays === 0) {
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  if (diffDays === 1) return "昨天";
  if (diffDays > 1 && diffDays <= 6) return WEEK_DAYS[date.getDay()];
  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }

  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
};

export const DialogItem = memo(function DialogItem({
  data,
  onSelect,
  onClear,
  onAvatarClick,
  height = 52,
}) {
  const { apiBase } = useApiBase();

  if (!data) return null;

  const hasNews = data.signal === "news";
  const name = data.remark || data.nickname || data.nickname || data.email || "未知联系人";
  const email = data.email || "未绑定邮箱";
  const time = formatDialogTime(data.timestamp);

  const avatarUrl = useMemo(() => {
    if (!data.avatar_url) return "";

    const base = String(apiBase || "").replace(/\/+$/, "");
    const path = String(data.avatar_url).replace(/^\/+/, "");

    return `${base}/imgs/${path}`;
  }, [apiBase, data.avatar_url]);

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
        height,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 6px",
        borderRadius: 10,
        cursor: "pointer",
        boxSizing: "border-box",
      }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <SafeAvatar
          url={avatarUrl}
          size={34}
          radius={8}
          cover
          onClick={handleAvatarClick}
        />

        {hasNews && (
          <span
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: "#ff3b30",
              border: "2px solid var(--panel-bg, #fff)",
              boxSizing: "border-box",
            }}
          />
        )}
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: hasNews ? 600 : 500,
            color: "var(--text-primary)",
            lineHeight: 1.15,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </span>

        <span
          style={{
            fontSize: 11,
            color: hasNews ? "var(--text-primary)" : "var(--text-secondary)",
            opacity: hasNews ? 0.88 : 0.68,
            lineHeight: 1.15,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {email}
        </span>
      </div>

      <div
        style={{
          width: 42,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 3,
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: "var(--text-secondary)",
            opacity: 0.45,
            lineHeight: 1,
          }}
        >
          {time}
        </span>

        <span
          onClick={handleClear}
          style={{
            width: 16,
            height: 16,
            display: "grid",
            placeItems: "center",
            fontSize: 12,
            color: "var(--text-secondary)",
            opacity: 0.35,
            userSelect: "none",
          }}
        >
          ×
        </span>
      </div>
    </div>
  );
});