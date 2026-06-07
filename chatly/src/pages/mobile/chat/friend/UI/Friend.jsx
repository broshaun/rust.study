import { memo } from "react";
import { SafeAvatar } from "components";

export const Friend = memo(
  function Friend({
    data,
    onSelect,
    onAvatarClick,
  }) {
    if (!data) return null;

    const name =
      data.remark ||
      data.nickname ||
      data.email ||
      "未知好友";

    return (
      <div
        onClick={() => onSelect?.(data)}
        style={{
          height: 52,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 6px",
          borderRadius: 10,
          cursor: "pointer",
        }}
      >
        <SafeAvatar
          url={data.avatar_url}
          size={34}
          radius={8}
          shadow="xs"
          border="1px solid var(--mantine-color-gray-2)"
          onClick={(e) => {
            e.stopPropagation();
            onAvatarClick?.(data);
          }}
        />

        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
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
              opacity: 0.68,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {data.email || "未绑定邮箱"}
          </div>
        </div>
      </div>
    );
  },
  (prev, next) =>
    prev.version === next.version &&
    prev.onSelect === next.onSelect &&
    prev.onAvatarClick === next.onAvatarClick
);