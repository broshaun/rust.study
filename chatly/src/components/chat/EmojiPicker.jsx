import React, { memo, useEffect, useRef, useState } from "react";
import { IconMoodSmile, IconX } from "@tabler/icons-react";

const EMOJI_GROUPS = [
  { key: "common", label: "常用", items: ["😀", "😄", "😊", "😉", "👍", "👌", "🙏", "👏", "🙌", "✨", "🔥", "💯", "🌹", "🤝"] },
  { key: "business", label: "商务", items: ["💼", "📊", "📈", "📉", "📑", "📋", "📅", "🗓️", "📝", "📌", "📎", "💡", "🏢", "🤝"] },
  { key: "trade", label: "贸易", items: ["📦", "🚢", "🚚", "✈️", "🌍", "💰", "💵", "💶", "🧾", "🏭", "⚓", "📤", "📥", "🛃"] },
  { key: "medical", label: "医疗", items: ["🏥", "💉", "🧬", "🧪", "🌡️", "🩺", "🩹", "💊", "💧", "🔬", "🛡️", "🩸", "🚑", "👨‍⚕️"] },
  { key: "message", label: "沟通", items: ["💬", "✉️", "📩", "📨", "📞", "☎️", "📢", "📣", "🔔", "📍", "❗", "❓", "✅", "⏳"] },
  { key: "mood", label: "情绪", items: ["😃", "😁", "😎", "🤔", "😮", "😌", "🥳", "🚀", "🎉", "🎈", "🤗", "😇", "🙂", "🙃"] }
];

const POSITIONS = {
  "top-end": { bottom: "calc(100% + 8px)", right: 0 },
  "bottom-start": { top: "calc(100% + 8px)", left: 0 },
  "bottom-end": { top: "calc(100% + 8px)", right: 0 },
  "top-start": { bottom: "calc(100% + 8px)", left: 0 },
};

export const EmojiPicker = memo(({ onSelect, tone = "light", placement = "top-start" }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const isDark = tone === "dark";
  const theme = {
    bg: isDark ? "#1a1b1e" : "#fff",
    border: isDark ? "#373a40" : "#dee2e6",
    muted: isDark ? "#909296" : "#495057",
    text: isDark ? "#f8f9fa" : "#212529",
    hover: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
    primary: "var(--mantine-color-blue-6, #228be6)",
    shadow: isDark ? "0 10px 30px rgba(0,0,0,0.35)" : "0 10px 30px rgba(0,0,0,0.12)",
  };

  useEffect(() => {
    if (!open) return;

    const handleEvent = (e) => {
      if (
        e.key === "Escape" ||
        (e.type === "mousedown" && !rootRef.current?.contains(e.target))
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleEvent);
    document.addEventListener("keydown", handleEvent);

    return () => {
      document.removeEventListener("mousedown", handleEvent);
      document.removeEventListener("keydown", handleEvent);
    };
  }, [open]);

  const select = (emoji) => {
    onSelect?.(emoji);
    setOpen(false);
  };

  return (
    <div ref={rootRef} style={styles.root}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          ...styles.btn,
          color: open ? theme.primary : theme.muted,
        }}
      >
        <IconMoodSmile size={22} stroke={1.9} />
      </button>

      {open && (
        <div
          style={{
            ...styles.panel,
            ...(POSITIONS[placement] || POSITIONS["top-start"]),
            background: theme.bg,
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadow,
          }}
        >
          <div
            style={{
              ...styles.header,
              borderBottom: `1px solid ${theme.border}`,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>
              选择表情
            </span>

            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ ...styles.btn, color: theme.muted }}
            >
              <IconX size={16} stroke={2} />
            </button>
          </div>

          <div style={styles.scroll}>
            {EMOJI_GROUPS.map(({ key, label, items }) => (
              <div key={key} style={{ marginBottom: 10 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: theme.muted,
                    margin: "6px 2px 8px",
                  }}
                >
                  {label}
                </div>

                <div style={styles.grid}>
                  {items.map((emoji) => (
                    <button
                      key={`${key}-${emoji}`}
                      type="button"
                      onClick={() => select(emoji)}
                      style={{ ...styles.emoji, color: theme.text }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme.hover;
                        e.currentTarget.style.transform = "scale(1.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

const styles = {
  root: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    width: "100%",
    minWidth: 0,
  },

  btn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    borderRadius: 8,
  },

  panel: {
    position: "absolute",
    width: "100%",
    minWidth: 260,
    borderRadius: 12,
    overflow: "hidden",
    zIndex: 1000,
  },

  header: {
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 10px 0 12px",
  },

  scroll: {
    maxHeight: "calc(70vh - 40px)",
    overflowY: "auto",
    padding: "8px 10px 10px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(40px, 1fr))",
    gap: 4,
  },

  emoji: {
    border: "none",
    background: "transparent",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 22,
    aspectRatio: "1",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.1s ease",
  },
};