import React, { useEffect } from "react";
import styles from "./Drawer.module.css";

/**
 * 通用主题适配 Drawer
 * 适配规则：
 * 1. 只使用全局通用主题变量，不引入 drawer 专属主题变量
 * 2. 支持 left / right
 * 3. 支持 ESC 关闭
 * 4. 支持自定义宽度
 * 5. 保持结构简洁，方便所有主题统一继承
 */
export const Drawer = ({
  isOpen,
  onClose,
  children,
  width = 250,
  side = "left",
  style = {},
  className = "",
}) => {
  const drawerWidth = typeof width === "number" ? `${width}px` : width;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      className={`${styles.container} ${isOpen ? styles.open : ""} ${className}`}
      data-side={side}
      aria-hidden={!isOpen}
    >
      <div className={styles.mask} onClick={onClose} />

      <aside
        className={styles.aside}
        style={{
          "--drawer-width": drawerWidth,
          ...style,
        }}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.scrollArea}>{children}</div>
      </aside>
    </div>
  );
};