const SVG_BASE_URL = "static/svg/";

/**
 * Icon - 稳健版 + 红点角标
 */
export const Icon = (props) => {
  const currentColor = () =>
    props.active
      ? props.activeColor || "var(--accent-color, #007aff)"
      : props.color || "var(--text-secondary, #666)";

  const validBadge = () => {
    if (
      props.badgeContent !== null &&
      props.badgeContent !== undefined &&
      props.badgeContent !== 0
    ) {
      return props.badgeContent;
    }

    if (props.badge !== null && props.badge !== undefined && props.badge !== 0) {
      return props.badge;
    }

    return null;
  };

  const showBadge = () => !!props.dot || validBadge() !== null;

  const iconSize = () =>
    typeof props.size === "number" ? `${props.size}px` : (props.size || 24);

  return (
    <div
      onClick={props.onClick}
      style={{
        display: "inline-flex",
        "flex-direction": (props.labelPos || "bottom") === "bottom" ? "column" : "row",
        "align-items": "center",
        "justify-content": "center",
        gap: "6px",
        width: "auto",
        height: "auto",
        cursor: props.onClick ? "pointer" : "default",
        transition: "all var(--transition-speed, 0.3s) ease",
        ...(props.style || {}),
      }}
    >
      <div style={{ position: "relative", display: "inline-block" }}>
        <i
          style={{
            width: iconSize(),
            height: iconSize(),
            "background-color": currentColor(),
            "-webkit-mask": `url(${SVG_BASE_URL}${props.name}.svg) no-repeat center / contain`,
            mask: `url(${SVG_BASE_URL}${props.name}.svg) no-repeat center / contain`,
            display: "inline-block",
            "flex-shrink": 0,
            "-webkit-mask-size": "contain",
            "mask-size": "contain",
          }}
        />

        {showBadge() && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              "min-width": validBadge() ? "16px" : "8px",
              height: validBadge() ? "16px" : "8px",
              padding: validBadge() ? "0 4px" : 0,
              background: "#ff3b30",
              color: "#fff",
              "font-size": "10px",
              "line-height": "16px",
              "border-radius": "999px",
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
              transform: "translate(50%, -50%)",
              "white-space": "nowrap",
              "pointer-events": "none",
            }}
          >
            {validBadge() !== null ? (validBadge() > 99 ? "99+" : validBadge()) : null}
          </span>
        )}
      </div>

      {props.label && (
        <span
          style={{
            "font-size": "12px",
            color: currentColor(),
            "line-height": 1,
            "font-weight": props.active ? "600" : "normal",
          }}
        >
          {props.label}
        </span>
      )}
    </div>
  );
};