import React, { memo } from "react";
import * as TablerIcons from "@tabler/icons-react";

/**
 * IconTabler - 商务专业版 (Deep Gray Theme)
 */
export const IconTabler = memo(({
  name,
  icon: IconComponent,
  size = 24,
  stroke = 1.6, // 略微增加粗细，商务感更强
  label = "",
  labelPos = "bottom",
  color,
  // 核心色值调优：
  activeColor = "var(--mantine-color-blue-7, #1971c2)", // 深蓝色激活态
  defaultGray = "#495057", // 专业的深灰色 (Mantine gray-7)
  active = false,
  onClick,
  dot = false,
  badgeContent = null,
  style,
  ...others
}) => {
  // 1. 静态逻辑提取
  const SelectedIcon = IconComponent || TablerIcons[name] || TablerIcons.IconHelp;
  // 优先使用自定义 color，否则根据激活状态切换深灰或品牌蓝
  const currentColor = active ? activeColor : (color || defaultGray);
  const isBottom = labelPos === "bottom";
  const hasBadgeText = badgeContent !== null && badgeContent !== 0;

  const handleKeyDown = (e) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...others}
      style={{
        display: "inline-flex",
        flexDirection: isBottom ? "column" : "row",
        alignItems: "center",
        justifyContent: "center",
        gap: isBottom ? 5 : 8, // 增加间距感，更显大气
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        color: currentColor,
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        ...style,
      }}
    >
      <div style={{ position: "relative", display: "flex", flexShrink: 0 }}>
        <SelectedIcon size={size} color="currentColor" stroke={stroke} />

        {(dot || hasBadgeText) && (
          <span
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              transform: "translate(40%, -40%)",
              minWidth: hasBadgeText ? 16 : 9,
              height: hasBadgeText ? 16 : 9,
              padding: hasBadgeText ? "0 4px" : 0,
              fontSize: 10,
              fontWeight: 800,
              borderRadius: 999,
              // 使用更沉稳的深红色
              backgroundColor: "#e03131", 
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid var(--mantine-color-body, #fff)",
              pointerEvents: "none",
              boxSizing: "border-box",
              zIndex: 1,
            }}
          >
            {hasBadgeText && (badgeContent > 99 ? "99+" : badgeContent)}
          </span>
        )}
      </div>

      {label && (
        <span style={{ 
          fontSize: 12, 
          fontWeight: active ? 600 : 500, // 未激活时也保持 500，增加存在感
          lineHeight: 1,
          letterSpacing: "0.02em" // 增加字间距，提升阅读高级感
        }}>
          {label}
        </span>
      )}
    </div>
  );
});

IconTabler.displayName = "IconTabler";