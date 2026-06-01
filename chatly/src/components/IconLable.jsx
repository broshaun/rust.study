import React, { memo } from "react";
import * as TablerIcons from "@tabler/icons-react";

export const IconLable = memo(({
  name,
  icon: IconComponent,
  size = 24,
  stroke = 1.6,
  label = "",
  labelPos = "bottom",
  color,
  activeColor = "var(--mantine-color-blue-7, #1971c2)",
  defaultGray = "light-dark(#495057, #ced4da)", // 支持暗色模式
  active = false,
  onClick,
  dot = false,
  badgeContent = null,
  style,
  ...others
}) => {
  const SelectedIcon = IconComponent || TablerIcons[name] || TablerIcons.IconHelp;
  const currentColor = active ? activeColor : (color || defaultGray);
  const isBottom = labelPos === "bottom";
  const hasBadge = dot || (badgeContent !== null && badgeContent !== 0);

  const handleKeyDown = (e) => {
    if (onClick && ["Enter", " "].includes(e.key)) {
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
        gap: isBottom ? 5 : 8,
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        color: currentColor,
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        ...style,
      }}
    >
      <div style={{ position: "relative", display: "flex", flexShrink: 0 }}>
        <SelectedIcon size={size} color="currentColor" stroke={stroke} />

        {hasBadge && (
          <span
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              transform: "translate(40%, -40%)",
              minWidth: badgeContent ? 16 : 9,
              height: badgeContent ? 16 : 9,
              padding: badgeContent ? "0 4px" : 0,
              fontSize: 10,
              fontWeight: 800,
              borderRadius: 999,
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
            {badgeContent && (badgeContent > 99 ? "99+" : badgeContent)}
          </span>
        )}
      </div>

      {label && (
        <span style={{ 
          fontSize: 12, 
          fontWeight: active ? 600 : 500, 
          lineHeight: 1,
          letterSpacing: "0.02em"
        }}>
          {label}
        </span>
      )}
    </div>
  );
});
