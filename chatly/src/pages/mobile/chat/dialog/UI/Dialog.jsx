import { memo } from "react";
import { useApiBase } from "utils";
import { SafeAvatar } from "components";

const WEEK_DAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const DAY_MS = 86400000;

function formatDialogTime(timestamp) {
  if (!timestamp) return "";

  const date = new Date(
    typeof timestamp === "string"
      ? timestamp.replace(/-/g, "/")
      : timestamp
  );

  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();

  const diffDays = Math.floor(
    (
      new Date(now.getFullYear(), now.getMonth(), now.getDate()) -
      new Date(date.getFullYear(), date.getMonth(), date.getDate())
    ) / DAY_MS
  );

  if (diffDays === 0) {
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  if (diffDays === 1) return "昨天";

  if (diffDays <= 6) {
    return WEEK_DAYS[date.getDay()];
  }

  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }

  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

export const Dialog = memo(
  function Dialog({
    data,
    onSelect,
    onClear,
    onAvatarClick,
    height = 52,
  }) {
    const { apiBase } = useApiBase();

    if (!data) return null;

    const hasNews = data.signal === "news";

    const name =
      data.remark ||
      data.nickname ||
      data.email ||
      "未知联系人";

    const avatarUrl = data.avatar_url
      ? `${String(apiBase).replace(/\/+$/, "")}/imgs/${String(
          data.avatar_url
        ).replace(/^\/+/, "")}`
      : "";

    return (
      <div
        onClick={() => onSelect?.(data)}
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
            onClick={(e) => {
              e.stopPropagation();
              onAvatarClick?.(data);
            }}
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
                border: "2px solid var(--panel-bg,#fff)",
              }}
            />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: hasNews ? 600 : 500,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {name}
          </div>

          <div
            style={{
              fontSize: 11,
              opacity: hasNews ? 0.88 : 0.68,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {data.email || "未绑定邮箱"}
          </div>
        </div>

        <div style={{ width: 42, flexShrink: 0, textAlign: "right" }}>
          <div style={{ fontSize: 10, opacity: 0.45 }}>
            {formatDialogTime(data.timestamp)}
          </div>

          <div
            onClick={(e) => {
              e.stopPropagation();
              onClear?.(data);
            }}
            style={{
              fontSize: 12,
              opacity: 0.35,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            ×
          </div>
        </div>
      </div>
    );
  },
  (prev, next) => 
    prev.version === next.version &&
    prev.onSelect === next.onSelect &&
    prev.onClear === next.onClear &&
    prev.onAvatarClick === next.onAvatarClick
);