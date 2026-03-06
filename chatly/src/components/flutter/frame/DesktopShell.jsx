import React, { Children, isValidElement } from 'react';
import styles from './DesktopShell.module.css';

export const DesktopShell = ({ children }) => {
  const subComponents = Children.toArray(children).reduce((acc, child) => {
    if (isValidElement(child)) {
      if (child.type === DesktopShell.Header) acc.header = child;
      if (child.type === DesktopShell.Content) acc.content = child;
      if (child.type === DesktopShell.Left) acc.left = child;
    }
    return acc;
  }, { header: null, content: null, left: null });

  return (
    <div className={styles.desktopShell}>
      {/* 1. Header 始终横向占满顶端（只要组件存在） */}
      {subComponents.header && (
        <header 
          className={styles.header} 
          style={{ '--header-height': typeof subComponents.header.props.height === 'number' ? `${subComponents.header.props.height}px` : subComponents.header.props.height }}
        >
          {subComponents.header}
        </header>
      )}

      {/* 2. 下方区域：左边栏 + 主内容 */}
      <div className={styles.bottomSection}>
        {subComponents.left && (
          <aside 
            className={styles.sidebar} 
            style={{ '--sidebar-width': typeof subComponents.left.props.width === 'number' ? `${subComponents.left.props.width}px` : subComponents.left.props.width }}
          >
            {subComponents.left}
          </aside>
        )}

        <main className={styles.content}>
          {subComponents.content}
        </main>
      </div>
    </div>
  );
};

DesktopShell.Header = ({ children, height = 64, style }) => (
  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', ...style }}>{children}</div>
);

DesktopShell.Content = ({ children, style }) => (
  <div style={{ width: '100%', height: '100%', ...style }}>{children}</div>
);

DesktopShell.Left = ({ children, width = 80, style }) => (
  <div style={{ width: '100%', height: '100%', overflowY: 'auto', ...style }}>{children}</div>
);