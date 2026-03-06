import React, { Children, isValidElement } from 'react';
import styles from './AppShell.module.css';

/**
 * 全平台沉浸式 AppShell (Scaffold)
 * 职责：适配 iOS 刘海屏与 macOS 透明标题栏，支持 7 套主题融合。
 */
export const AppShell = ({ children }) => {
  const childrenArray = Children.toArray(children);
  
  // 精准识别插槽组件
  const header = childrenArray.find(c => c.type === AppShell.Header);
  const footer = childrenArray.find(c => c.type === AppShell.Footer);
  const content = childrenArray.find(c => c.type === AppShell.Content) || childrenArray.filter(c => c.type !== AppShell.Header && c.type !== AppShell.Footer);

  return (
    <div className={styles.appShell}>
      {header && (
        <header 
          className={styles.header} 
          style={{ '--h': header.props.height || 56 }}
          data-tauri-drag-region /* 允许在 Mac/Windows 顶栏拖动窗口 */
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

// 定义子组件并设置识别标识
AppShell.Header = ({ children }) => <div className={styles.innerSlot}>{children}</div>;
AppShell.Footer = ({ children }) => <>{children}</>;
AppShell.Content = ({ children }) => <>{children}</>;

// 别名导出（Flutter 习惯）
export const Scaffold = AppShell;
Scaffold.Header = AppShell.Header;
Scaffold.Footer = AppShell.Footer;
Scaffold.Content = AppShell.Content;