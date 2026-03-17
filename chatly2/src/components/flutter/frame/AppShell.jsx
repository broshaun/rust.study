import React, { Children, isValidElement, useMemo } from "react";
import styles from "./AppShell.module.css";

/**
 * AppShell - 全平台沉浸式布局骨架
 * 职责：
 * 1. 只负责 Header / Content / Footer 的结构布局
 * 2. 处理 safe-area
 * 3. 不负责具体内容的对齐方式
 * 4. 兼容 React 19
 */
export const AppShell = ({ children, className = "", style }) => {
  const { header, footer, content } = useMemo(() => {
    const nodes = Children.toArray(children).filter(isValidElement);

    let headerNode = null;
    let footerNode = null;
    let contentNode = null;
    const restNodes = [];

    for (const node of nodes) {
      if (node.type === AppShell.Header && !headerNode) {
        headerNode = node;
        continue;
      }

      if (node.type === AppShell.Footer && !footerNode) {
        footerNode = node;
        continue;
      }

      if (node.type === AppShell.Content && !contentNode) {
        contentNode = node;
        continue;
      }

      restNodes.push(node);
    }

    return {
      header: headerNode,
      footer: footerNode,
      content: contentNode ?? restNodes,
    };
  }, [children]);

  const headerHeight = Number(header?.props?.height ?? 56);
  const footerHeight = Number(footer?.props?.height ?? 64);

  return (
    <div className={`${styles.appShell} ${className}`.trim()} style={style}>
      {header && (
        <header
          className={styles.header}
          style={{ "--app-shell-header-height": `${headerHeight}px` }}
          data-tauri-drag-region
        >
          {header}
        </header>
      )}

      <main className={styles.content}>{content}</main>

      {footer && (
        <footer
          className={styles.footer}
          style={{ "--app-shell-footer-height": `${footerHeight}px` }}
        >
          {footer}
        </footer>
      )}
    </div>
  );
};

AppShell.Header = function AppShellHeader({
  children,
  className = "",
  style,
  height,
}) {
  return (
    <div
      className={`${styles.innerSlot} ${className}`.trim()}
      style={style}
      data-height={height}
    >
      {children}
    </div>
  );
};

AppShell.Content = function AppShellContent({
  children,
  className = "",
  style,
}) {
  return (
    <div className={`${styles.contentInner} ${className}`.trim()} style={style}>
      {children}
    </div>
  );
};

AppShell.Footer = function AppShellFooter({
  children,
  className = "",
  style,
  height,
}) {
  return (
    <div
      className={`${styles.footerInner} ${className}`.trim()}
      style={style}
      data-height={height}
    >
      {children}
    </div>
  );
};

export const Scaffold = AppShell;
Scaffold.Header = AppShell.Header;
Scaffold.Footer = AppShell.Footer;
Scaffold.Content = AppShell.Content;

export default AppShell;