import { memo, useCallback } from "react";



const Friend = memo(function Friend({
  data,
  virtualRow,
  onSelect,
  onAvatarClick,
  height = 50,
}) {


  console.log('data?.avatar_url',data?.avatar_url)

  if (!data) return null;

  const name = data.remark || data.nikename || data.email || "未知好友";
  const email = data.email || "未绑定邮箱";



  const wrapperHeight =
    typeof height === "number" ? `${height}px` : height;

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
        // ✅ 虚拟列表核心定位
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        transform: `translateY(${virtualRow?.start || 0}px)`,

        // ✅ 原本样式
        cursor: "pointer",
        height: wrapperHeight,
        boxSizing: "border-box",
        padding: "2px 10px",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* 头像 */}
      <div
        style={{
          position: "relative",
          width: 38,
          height: 38,
          flex: "0 0 auto",
          marginRight: 8,
          borderRadius: "8px",
          overflow: "hidden",
        }}
        onClick={handleAvatarClick}
      >
        <img
          src={data?.avatar_url}
          alt="avatar"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* 信息 */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
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