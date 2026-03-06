import React, { Children, isValidElement } from 'react';
import styles from './AppShell.module.css';

/**
 * Scaffold (AppShell) - 移动端精简脚手架
 * 职责：适配刘海屏安全区，支持动态高度。
 */
export const AppShell = ({ children }) => {
  const sub = Children.toArray(children).reduce((acc, child) => {
    if (isValidElement(child)) {
      if (child.type === AppShell.Header) acc.header = child;
      if (child.type === AppShell.Footer) acc.footer = child;
      if (child.type === AppShell.Content) acc.content = child;
    }
    return acc;
  }, { header: null, footer: null, content: null });

  return (
    <div className={styles.appShell}>
      {sub.header && (
        <header 
          className={styles.header} 
          style={{ '--h': sub.header.props.height || 56 }}
        >
          {sub.header}
        </header>
      )}

      <main className={styles.content}>
        {sub.content}
      </main>

      {sub.footer && (
        <footer 
          className={styles.footer} 
          style={{ '--f': sub.footer.props.height || 64 }}
        >
          {sub.footer}
        </footer>
      )}
    </div>
  );
};

// 子组件挂载
AppShell.Header = ({ children, height = 56 }) => <>{children}</>;
AppShell.Footer = ({ children, height = 64 }) => <>{children}</>;
AppShell.Content = ({ children }) => <>{children}</>;

// 别名导出
export const Scaffold = AppShell;
Scaffold.Header = AppShell.Header;
Scaffold.Footer = AppShell.Footer;
Scaffold.Content = AppShell.Content;