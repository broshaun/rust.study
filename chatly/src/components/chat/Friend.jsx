import { memo, useCallback } from "react";
import { SafeAvatar } from "components/flutter";

const Friend = memo(function Friend({
  data,
  virtualRow,
  onSelect,
  onAvatarClick,
  height = 58,
}) {
  if (!data) return null;

  const name = data.remark || data.nikename || data.email || "未知好友";
  const email = data.email || "未绑定邮箱";

  const wrapperHeight = typeof height === "number" ? `${height}px` : height;

  const handleSelect = useCallback(() => {
    onSelect?.(data);
  }, [data, onSelect]);

  const handleAvatarClick = useCallback(
    (e) => {
      e?.stopPropagation?.();
      onAvatarClick?.(data);
    },
    [data, onAvatarClick]
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
        height: wrapperHeight,
        boxSizing: "border-box",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 4px",
          borderRadius: 10,
          boxSizing: "border-box",
        }}
      >
        <SafeAvatar
          url={data?.avatar_url}
          size={38}
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
            justifyContent: "center",
            marginLeft: 12,
            gap: 2,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "var(--text-primary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: 1.2,
            }}
          >
            {name}
          </span>

          <span
            style={{
              fontSize: 11,
              color: "var(--text-secondary)",
              opacity: 0.72,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: 1.2,
            }}
          >
            {email}
          </span>
        </div>
      </div>
    </div>
  );
});

export default Friend;