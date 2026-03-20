import React, { useEffect, useState } from "react";
import { Text, Icon, XBox } from "components/flutter";

/**
 * InfoTile - 信息行（支持编辑）
 * 对外新增:
 *  - tone: "light" | "dark"
 */
export const InfoTile = ({
  icon,
  label,
  value,
  onConfirm,
  tone = "light"
}) => {
  const editable = typeof onConfirm === "function";

  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || "");

  useEffect(() => {
    setTempValue(value || "");
  }, [value]);

  const startEdit = () => {
    if (!editable) return;
    setTempValue(value || "");
    setEditing(true);
  };

  const confirm = () => {
    setEditing(false);
    onConfirm?.(tempValue);
  };

  const cancel = () => {
    setTempValue(value || "");
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") confirm();
    if (e.key === "Escape") cancel();
  };

  const palette =
    tone === "dark"
      ? {
          editBg: "#1f1f1f",
          valueColor: "#e8e8e8",
          inputBg: "#2a2a2a",
          inputColor: "#f5f5f5",
          inputBorder: "#4a4a4a",
          buttonBg: "#f5f5f5",
          buttonColor: "#1f1f1f"
        }
      : {
          editBg: "#ffffff",
          valueColor: "#222222",
          inputBg: "#ffffff",
          inputColor: "#222222",
          inputBorder: "#d9d9d9",
          buttonBg: "#222222",
          buttonColor: "#ffffff"
        };

  return (
    <XBox
      alignment="center"
      style={{
        width: "100%",
        position: "relative",
        minHeight: 32
      }}
    >
      {!editing && (
        <>
          {/* 左侧：图标 + 标题 */}
          <div
            onClick={startEdit}
            style={{
              display: "flex",
              alignItems: "center",
              cursor: editable ? "pointer" : "default",
              flexShrink: 0
            }}
          >
            <Icon
              name={icon}
              label={label}
              labelPos="right"
              size={18}
            />
          </div>

          {/* 右侧：值 */}
          <XBox
            alignment="center"
            style={{
              flex: 1,
              minWidth: 0,
              marginLeft: 8
            }}
          >
            <Text
              size={14}
              weight={500}
              style={{
                lineHeight: "24px",
                flex: 1,
                minWidth: 0,
                color: palette.valueColor
              }}
              ellipsis
            >
              {value || "-"}
            </Text>
          </XBox>
        </>
      )}

      {/* 编辑态：输入框覆盖整行，包含标题区域 */}
      {editing && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            zIndex: 2,
            background: palette.editBg
          }}
        >
          <input
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={cancel}
            autoFocus
            style={{
              flex: 1,
              minWidth: 0,
              height: 28,
              padding: "0 8px",
              border: `1px solid ${palette.inputBorder}`,
              borderRadius: 6,
              outline: "none",
              fontSize: 13,
              boxSizing: "border-box",
              background: palette.inputBg,
              color: palette.inputColor
            }}
          />

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={confirm}
            style={{
              height: 28,
              padding: "0 10px",
              border: "none",
              borderRadius: 6,
              background: palette.buttonBg,
              color: palette.buttonColor,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              fontSize: 13,
              fontWeight: 500
            }}
          >
            确认
          </button>
        </div>
      )}
    </XBox>
  );
};

export default InfoTile;