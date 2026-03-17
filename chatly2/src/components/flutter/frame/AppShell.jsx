import React, { Children } from "react";
import styles from './AppShell.module.css';

/**
 * AppShell - 全平台沉浸式布局骨架
 * 职责：
 * 1. 只负责 Header / Content / Footer 的结构布局
 * 2. 处理 safe-area
 * 3. 不负责具体内容的对齐方式
 */
export const AppShell = ({ children }) => {
  const childrenArray = Children.toArray(children);

  const header = childrenArray.find(c => c.type === AppShell.Header);
  const footer = childrenArray.find(c => c.type === AppShell.Footer);
  const content =
    childrenArray.find(c => c.type === AppShell.Content) ||
    childrenArray.filter(
      c => c.type !== AppShell.Header && c.type !== AppShell.Footer
    );

  return (
    <div className={styles.appShell}>
      {header && (
        <header
          className={styles.header}
          style={{ '--h': header.props.height || 56 }}
          data-tauri-drag-region
        >
          {header}
        </header>
      )}

      <main className={styles.content}>
        {content}
      </main>

      {footer && (
        <footer
          className={styles.footer}
          style={{ '--f': footer.props.height || 64 }}
        >
          {footer}
        </footer>
      )}
    </div>
  );
};

AppShell.Header = ({ children }) => (
  <div className={styles.innerSlot}>
    {children}
  </div>
);

AppShell.Content = ({ children }) => <>{children}</>;

AppShell.Footer = ({ children }) => (
  <div className={styles.footerInner}>
    {children}
  </div>
);

export const Scaffold = AppShell;
Scaffold.Header = AppShell.Header;
Scaffold.Footer = AppShell.Footer;
Scaffold.Content = AppShell.Content;

export default AppShell;