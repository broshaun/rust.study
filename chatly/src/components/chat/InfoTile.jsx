import React, { useEffect, useState, memo } from "react";
import * as TablerIcons from "@tabler/icons-react";

/**
 * InfoTile - 极致精简商务版
 * 核心：70px标签、Slate 700配色、Flex居中对齐
 */
export const InfoTile = memo(({ icon, label, value, onConfirm, tone = "light", style }) => {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(value || "");
  const editable = typeof onConfirm === "function";

  useEffect(() => setTemp(value || ""), [value]);

  const isDark = tone === "dark";
  const clr = {
    lbl: isDark ? "#909296" : "#5c5f66",
    val: isDark ? "#e8e8e8" : "#212529",
    border: isDark ? "#2c2e33" : "#f1f3f5",
    btn: "#334155" // 专业石墨蓝
  };

  const Icon = TablerIcons[icon?.startsWith("Icon") ? icon : `Icon${icon?.charAt(0).toUpperCase()}${icon?.slice(1)}`] || TablerIcons.IconInfoCircle;

  const confirm = () => { onConfirm?.(temp); setEditing(false); };

  // 公共居中样式
  const centerStyle = { display: "flex", alignItems: "center" };

  return (
    <div style={{ ...centerStyle, width: "100%", minHeight: 32, padding: "2px 0", borderBottom: `1px solid ${clr.border}`, position: "relative", ...style }}>
      {!editing ? (
        <div onClick={() => editable && setEditing(true)} style={{ ...centerStyle, width: "100%", cursor: editable ? "pointer" : "default" }}>
          {/* 左侧：70px 标签 */}
          <div style={{ ...centerStyle, width: 70, flexShrink: 0 }}>
            <Icon size={14} stroke={2.2} color={clr.lbl} />
            <span style={{ fontSize: 12, color: clr.lbl, fontWeight: 500, marginLeft: 4, lineHeight: 1 }}>{label}</span>
          </div>
          {/* 右侧：Value (极致贴近且居中) */}
          <div style={{ ...centerStyle, flex: 1, paddingLeft: 2, overflow: "hidden" }}>
            <span style={{ fontSize: 13, color: clr.val, fontWeight: 600, lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {value || "-"}
            </span>
          </div>
          {editable && <TablerIcons.IconChevronRight size={12} color={clr.lbl} style={{ opacity: 0.3, marginLeft: "auto" }} />}
        </div>
      ) : (
        <div style={{ ...centerStyle, position: "absolute", inset: 0, gap: 4, background: isDark ? "#1a1a1a" : "#fff", zIndex: 5 }}>
          <input
            autoFocus
            value={temp}
            onChange={e => setTemp(e.target.value)}
            onKeyDown={e => e.key === "Enter" && confirm()}
            onBlur={() => setTimeout(() => setEditing(false), 200)}
            style={{ flex: 1, height: 26, border: `1px solid ${isDark ? "#373a40" : "#dee2e6"}`, borderRadius: 3, padding: "0 8px", fontSize: 13, outline: "none", background: "transparent", color: clr.val }}
          />
          <button
            onClick={confirm}
            onMouseDown={e => e.preventDefault()}
            style={{ ...centerStyle, justifyContent: "center", height: 26, padding: "0 10px", backgroundColor: clr.btn, color: "#fff", border: "none", borderRadius: 3, fontSize: 11, fontWeight: 600, cursor: "pointer" }}
          >
            确认
          </button>
        </div>
      )}
    </div>
  );
});

export default InfoTile;