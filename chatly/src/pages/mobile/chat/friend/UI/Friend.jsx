import { memo, useCallback } from "react";
import { SafeAvatar } from "components";

export const Friend = memo(function Friend({
  data,
  onSelect,
  onAvatarClick,
  height = 52,
}) {
  if (!data) return null;

  const name = data.remark || data.nickname || data.nikename || data.email || "未知好友";
  const email = data.email || "未绑定邮箱";

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
      <SafeAvatar
        url={data.avatar_url}
        size={34}
        radius={8}
        shadow="xs"
        border="1px solid var(--mantine-color-gray-2)"
        onClick={handleAvatarClick}
      />

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
            fontWeight: 500,
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
            color: "var(--text-secondary)",
            opacity: 0.68,
            lineHeight: 1.15,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {email}
        </span>
      </div>
    </div>
  );
});