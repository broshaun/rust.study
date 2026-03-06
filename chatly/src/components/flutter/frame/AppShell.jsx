import React, { Children, isValidElement } from 'react';
import styles from './AppShell.module.css';

export const AppShell = ({ children }) => {
  const slots = Children.toArray(children).reduce((acc, child) => {
    if (isValidElement(child)) {
      const type = child.type.displayName;
      if (type === 'Header') acc.header = child;
      else if (type === 'Footer') acc.footer = child;
      else acc.content.push(child);
    }
    return acc;
  }, { header: null, footer: null, content: [] });

  return (
    <div className={styles.appShell}>
      {slots.header && (
        <header className={styles.header} style={{ '--h': slots.header.props.height || 56 }}>
          {slots.header}
        </header>
      )}
      <main className={styles.content}>{slots.content}</main>
      {slots.footer && (
        <footer className={styles.footer} style={{ '--f': slots.footer.props.height || 64 }}>
          {slots.footer}
        </footer>
      )}
    </div>
  );
};

AppShell.Header = Object.assign(({ children }) => <>{children}</>, { displayName: 'Header' });
AppShell.Footer = Object.assign(({ children }) => <>{children}</>, { displayName: 'Footer' });
AppShell.Content = Object.assign(({ children }) => <>{children}</>, { displayName: 'Content' });