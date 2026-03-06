import React from 'react';
import styles from './AppShell.module.css';

/**
 * AppShell - 万能皮肤适配器
 * 只要 theme.css 中定义了对应的变量，它就能自动变身
 */
export const AppShell = ({ children, style }) => (
  <div className={styles.shell} style={{ 
    background: 'var(--app-bg)', 
    transition: 'all 0.4s ease', // 确保切换风格时全站丝滑过渡
    ...style 
  }}>
    {children}
  </div>
);

AppShell.Header = ({ children, style }) => (
  <header className={styles.header} style={{
    backgroundColor: 'var(--panel-bg)',
    backdropFilter: 'var(--panel-blur)',
    WebkitBackdropFilter: 'var(--panel-blur)',
    borderBottom: 'var(--panel-border)',
    boxShadow: 'var(--panel-shadow)',
    zIndex: 100,
    transition: 'all 0.4s ease',
    ...style
  }}>
    {children}
  </header>
);

AppShell.Content = ({ children, padding = 0, style }) => (
  <main className={styles.content} style={{ 
    padding: typeof padding === 'number' ? `${padding}px` : padding,
    color: 'var(--text-primary)',
    transition: 'color 0.4s ease',
    ...style 
  }}>
    {children}
  </main>
);

AppShell.Footer = ({ children, style }) => (
  <footer className={styles.footer} style={{
    backgroundColor: 'var(--panel-bg)',
    backdropFilter: 'var(--panel-blur)',
    WebkitBackdropFilter: 'var(--panel-blur)',
    borderTop: 'var(--panel-border)',
    boxShadow: 'var(--panel-shadow)',
    transition: 'all 0.4s ease',
    ...style
  }}>
    {children}
    <div className={styles.safeAreaBottom} />
  </footer>
);