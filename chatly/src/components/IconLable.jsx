import React, { memo, useMemo } from "react";
import * as TablerIcons from "@tabler/icons-react";

export const IconLabel = memo(function IconLabel({
  name,
  icon: IconComponent,
  size = 24,
  stroke = 1.6,
  label = "",
  labelPos = "bottom",
  color,
  activeColor = "var(--mantine-color-blue-7, #1971c2)",
  defaultGray = "light-dark(#495057, #ced4da)",
  active = false,
  onClick,
  onClearBadge,
  dot = false,
  badgeContent = null,
  style,
  ...others
}) {
  const SelectedIcon = useMemo(() => {
    return IconComponent || TablerIcons[name] || TablerIcons.IconHelp;
  }, [IconComponent, name]);

  const isBottom = labelPos === "bottom";
  const hasBadge = dot || (badgeContent !== null && badgeContent !== 0);

  const handleClick = (e) => {
    onClick?.(e);

    if (hasBadge) {
      onClearBadge?.(e);
    }
  };

  const handleKeyDown = (e) => {
    if (!onClick) return;

    if (["Enter", " "].includes(e.key)) {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <div
      onClick={onClick ? handleClick : undefined}
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
        color: active ? activeColor : color || defaultGray,
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        WebkitTapHighlightColor: "transparent",
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
            {badgeContent > 99 ? "99+" : badgeContent}
          </span>
        )}
      </div>

      {label && (
        <span
          style={{
            fontSize: 12,
            fontWeight: active ? 600 : 500,
            lineHeight: 1,
            letterSpacing: "0.02em",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
});

IconLabel.displayName = "IconLabel";