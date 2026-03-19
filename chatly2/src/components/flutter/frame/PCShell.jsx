import React, { Children, isValidElement, useMemo } from "react";
import styles from "./PCShell.module.css";

/**
 * PCShell - PC 端沉浸式布局容器
 * 职责：
 * 1. 管理 Header / Left / Content 的空间分配
 * 2. 保持结构骨架纯粹，不负责具体内容对齐
 * 3. 兼容 React 19
 */
export const PCShell = ({ children, className = "", style }) => {
  const { header, content, left } = useMemo(() => {
    const nodes = Children.toArray(children).filter(isValidElement);

    let headerNode = null;
    let contentNode = null;
    let leftNode = null;

    for (const node of nodes) {
      if (node.type === PCShell.Header && !headerNode) {
        headerNode = node;
        continue;
      }

      if (node.type === PCShell.Content && !contentNode) {
        contentNode = node;
        continue;
      }

      if (node.type === PCShell.Left && !leftNode) {
        leftNode = node;
      }
    }

    return {
      header: headerNode,
      content: contentNode,
      left: leftNode,
    };
  }, [children]);

  const headerHeight = header?.props?.height ?? 64;
  const sidebarWidth = left?.props?.width ?? 80;

  const resolvedHeaderHeight =
    typeof headerHeight === "number" ? `${headerHeight}px` : headerHeight;
  const resolvedSidebarWidth =
    typeof sidebarWidth === "number" ? `${sidebarWidth}px` : sidebarWidth;

  return (
    <div className={`${styles.pcShell} ${className}`.trim()} style={style}>
      {header && (
        <header
          className={styles.header}
          style={{ "--pc-shell-header-height": resolvedHeaderHeight }}
        >
          {header}
        </header>
      )}

      <div className={styles.bottomSection}>
        {left && (
          <aside
            className={styles.sidebar}
            style={{ "--pc-shell-sidebar-width": resolvedSidebarWidth }}
          >
            {left}
          </aside>
        )}

        <main className={styles.content}>{content}</main>
      </div>
    </div>
  );
};

PCShell.Header = function PCShellHeader({
  children,
  height = 64,
  style,
  className = "",
}) {
  return (
    <div
      className={`${styles.headerInner} ${className}`.trim()}
      style={style}
      data-height={height}
    >
      {children}
    </div>
  );
};

PCShell.Content = function PCShellContent({
  children,
  style,
  className = "",
}) {
  return (
    <div className={`${styles.contentInner} ${className}`.trim()} style={style}>
      {children}
    </div>
  );
};

PCShell.Left = function PCShellLeft({
  children,
  width = 80,
  style,
  className = "",
}) {
  return (
    <div
      className={`${styles.sidebarInner} ${className}`.trim()}
      style={style}
      data-width={width}
    >
      {children}
    </div>
  );
};

export default PCShell;