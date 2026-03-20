import { memo, useMemo, useCallback } from "react";
import { useApiBase } from "hooks/http";
import { SafeAvatar } from "components/flutter"; // 请确保路径指向你的 SafeAvatar 组件

/**
 * 时间格式化工具 (保持不变)
 */
const formatDialogTime = (timestamp) => {
  if (!timestamp) return "";
  const safeTimeStr = typeof timestamp === "string" ? timestamp.replace(/-/g, "/") : timestamp;
  const t = new Date(safeTimeStr);
  if (isNaN(t.getTime())) return "";
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDay = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  const diffDays = (today - targetDay) / (1000 * 60 * 60 * 24);
  const isThisYear = t.getFullYear() === now.getFullYear();

  if (diffDays === 0) return t.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
  if (diffDays === 1) return "昨天";
  if (diffDays > 1 && diffDays <= 6) return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][t.getDay()];
  if (isThisYear) return `${t.getMonth() + 1}月${t.getDate()}日`;
  return `${t.getFullYear()}年${t.getMonth() + 1}月`;
};

/**
 * DialogItem 组件
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

  // 拼接完整地址传给 SafeAvatar，让它内部处理缓存逻辑
  const fullAvatarUrl = useMemo(() => {
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
      e.stopPropagation(); // 阻止触发条目点击
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
      {/* 左侧头像区 */}
      <div
        style={{
          position: "relative",
          width: 38,
          height: 38,
          flex: "0 0 auto",
          marginRight: 10,
        }}
      >
        {/* ✅ 使用高性能 SafeAvatar */}
        <SafeAvatar
          url={fullAvatarUrl}
          size={38}
          radius={8}
          cover={true}
          onClick={handleAvatarClick}
        />

        {/* 红点：定位在 SafeAvatar 之上 */}
        {showDot && (
          <span
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: "#ff3b30",
              border: "2px solid var(--panel-bg, #fff)",
              pointerEvents: "none",
              zIndex: 3, // 确保在 SafeAvatar 的图片层之上
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
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <span
          style={{
            fontSize: "14px",
            fontWeight: showDot ? "600" : "500",
            color: "var(--text-primary)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </span>
        <span
          style={{
            fontSize: "11px",
            color: showDot ? "var(--text-primary)" : "var(--text-secondary)",
            opacity: showDot ? 0.9 : 0.72,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {email}
        </span>
      </div>

      {/* 右侧操作区 */}
      <div
        style={{
          flex: "0 0 auto",
          width: 54,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 4,
        }}
      >
        <span style={{ fontSize: "10px", color: "var(--text-secondary)", opacity: 0.45 }}>
          {timeStr}
        </span>
        <div
          onClick={handleClear}
          style={{
            width: 16,
            height: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            color: "var(--text-secondary)",
            opacity: 0.35,
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