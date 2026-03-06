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
      {subComponents.header && (
        <header 
          className={styles.header} 
          style={{ '--header-height': typeof subComponents.header.props.height === 'number' ? `${subComponents.header.props.height}px` : subComponents.header.props.height }}
        >
          {subComponents.header}
        </header>
      )}

      <main className={styles.content}>
        {subComponents.content}
      </main>

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

// --- 子组件挂载 ---
AppShell.Header = ({ children, height = 56, style }) => (
  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', ...style }}>{children}</div>
);

AppShell.Footer = ({ children, height = 64, style }) => (
  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', ...style }}>{children}</div>
);

AppShell.Content = ({ children, style }) => (
  <div style={{ width: '100%', height: '100%', ...style }}>{children}</div>
);

// --- 别名导出 ---
export const Scaffold = AppShell;
Scaffold.Header = AppShell.Header;
Scaffold.Footer = AppShell.Footer;
Scaffold.Content = AppShell.Content;