import { memo, useCallback } from "react";
import { SafeAvatar } from "components/flutter"; // 确保路径正确

const Friend = memo(function Friend({
  data,
  virtualRow,
  onSelect,
  onAvatarClick,
  height = 50,
}) {
  // console.log('data?.avatar_url', data?.avatar_url);

  if (!data) return null;

  const name = data.remark || data.nikename || data.email || "未知好友";
  const email = data.email || "未绑定邮箱";

  const wrapperHeight = typeof height === "number" ? `${height}px` : height;

  const handleSelect = useCallback(() => {
    onSelect?.(data);
  }, [data, onSelect]);

  // 头像点击事件
  const handleAvatarClick = useCallback(
    (e) => {
      // 如果 SafeAvatar 内部没处理 stopPropagation，可以在这里处理
      if (e?.stopPropagation) e.stopPropagation();
      onAvatarClick?.(data);
    },
    [data, onAvatarClick]
  );

  return (
    <div
      onClick={handleSelect}
      style={{
        // ✅ 虚拟列表核心定位保持不变
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        transform: `translateY(${virtualRow?.start || 0}px)`,

        cursor: "pointer",
        height: wrapperHeight,
        boxSizing: "border-box",
        padding: "2px 12px", // 稍微加一点边距，更美观
        display: "flex",
        alignItems: "center",
        // 增加一个轻微的底部边框或交互背景（可选）
        borderBottom: "1px solid var(--mantine-color-gray-1)",
      }}
    >
      {/* ✅ 使用 SafeAvatar 替换原有的 div + img */}
      <SafeAvatar
        url={data?.avatar_url}
        size={38}
        radius={8}        // 对应你原有的 8px 圆角
        shadow="xs"       // 加上微弱阴影提升质感
        border="1px solid var(--mantine-color-gray-2)"
        onClick={handleAvatarClick}
      />

      {/* 信息区域 */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          marginLeft: 12, // 代替原来的 marginRight
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
          }}
        >
          {email}
        </span>
      </div>
    </div>
  );
});

export default Friend;