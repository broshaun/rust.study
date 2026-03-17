import React, { Children, isValidElement } from "react";
import styles from './PCShell.module.css';

/**
 * PCShell - PC端沉浸式布局容器
 * 职责：管理 Header、Sidebar (Left) 和 Content 的空间分配。
 */
export const PCShell = ({ children }) => {
  const subComponents = Children.toArray(children).reduce((acc, child) => {
    if (isValidElement(child)) {
      if (child.type === PCShell.Header) acc.header = child;
      if (child.type === PCShell.Content) acc.content = child;
      if (child.type === PCShell.Left) acc.left = child;
    }
    return acc;
  }, { header: null, content: null, left: null });

  const headerHeight = subComponents.header?.props.height || 64;
  const sidebarWidth = subComponents.left?.props.width || 80;

  return (
    <div className={styles.pcShell}>
      {/* 1. Header 绝对定位或横向占满（透明背景） */}
      {subComponents.header && (
        <header 
          className={styles.header} 
          style={{ height: typeof headerHeight === 'number' ? `${headerHeight}px` : headerHeight }}
        >
          {subComponents.header}
        </header>
      )}

      <div className={styles.bottomSection}>
        {/* 2. Sidebar (Left) */}
        {subComponents.left && (
          <aside 
            className={styles.sidebar} 
            style={{ width: typeof sidebarWidth === 'number' ? `${sidebarWidth}px` : sidebarWidth }}
          >
            {subComponents.left}
          </aside>
        )}

        {/* 3. Main Content */}
        <main className={styles.content}>
          {subComponents.content}
        </main>
      </div>
    </div>
  );
};

PCShell.Header = ({ children, height = 64, style }) => (
  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', background: 'transparent', ...style }}>
    {children}
  </div>
);

PCShell.Content = ({ children, style }) => (
  <div style={{ width: '100%', height: '100%', ...style }}>{children}</div>
);

PCShell.Left = ({ children, width = 80, style }) => (
  <div style={{ width: '100%', height: '100%', overflowY: 'auto', ...style }}>{children}</div>
);