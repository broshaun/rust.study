import React, { Children, isValidElement } from 'react';
import styles from './AppShell.module.css';

export const AppShell = ({ children }) => {
  const subComponents = Children.toArray(children).reduce((acc, child) => {
    if (isValidElement(child)) {
      if (child.type === AppShell.Header) acc.header = child;
      if (child.type === AppShell.Footer) acc.footer = child;
      if (child.type === AppShell.Content) acc.content = child;
    }
    return acc;
  }, { header: null, footer: null, content: null });

  return (
    <div className={styles.appShell}>
      {/* 1. Header 支持自定义高度 */}
      {subComponents.header && (
        <header 
          className={styles.header} 
          style={{ '--header-height': typeof subComponents.header.props.height === 'number' ? `${subComponents.header.props.height}px` : subComponents.header.props.height }}
        >
          {subComponents.header}
        </header>
      )}

      {/* 2. 主内容区 */}
      <main className={styles.content}>
        {subComponents.content}
      </main>

      {/* 3. Footer 支持自定义高度 */}
      {subComponents.footer && (
        <footer 
          className={styles.footer} 
          style={{ '--footer-height': typeof subComponents.footer.props.height === 'number' ? `${subComponents.footer.props.height}px` : subComponents.footer.props.height }}
        >
          {subComponents.footer}
        </footer>
      )}
    </div>
  );
};

// 子组件定义
AppShell.Header = ({ children, height = 56, style }) => (
  <div style={{ width: '100%', height: '100%', ...style }}>{children}</div>
);

AppShell.Footer = ({ children, height = 64, style }) => (
  <div style={{ width: '100%', height: '100%', ...style }}>{children}</div>
);

AppShell.Content = ({ children, style }) => (
  <div style={{ width: '100%', height: '100%', ...style }}>{children}</div>
);