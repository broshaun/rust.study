import React, { useState, useCallback } from 'react';
import styles from './Scaffold.module.css';
import { IconSvg } from '../base/IconSvg';

/**
 * Flutter 风格 AppBar
 */
export const AppBar = ({ title, iconDrawer = 'menu', onDrawerClick, showDrawerBtn }) => (
  <div className={styles.appBar}>
    <div className={styles.safeArea} />
    <div className={styles.appBarInner}>
      <div className={styles.actionSlot}>
        {showDrawerBtn && (
          <button className={styles.iconBtn} onClick={onDrawerClick}>
            <IconSvg name={iconDrawer} size={24} />
          </button>
        )}
      </div>
      <div className={styles.title}>{title}</div>
      <div className={styles.actionSlot} /> 
    </div>
  </div>
);

/**
 * Flutter 风格 Scaffold
 */
export const Scaffold = ({ appBar, drawerMenu = [], drawerTitle = "控制台", body }) => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const hasDrawer = drawerMenu.length > 0;

  const toggleDrawer = useCallback(() => {
    if (hasDrawer) setDrawerOpen(prev => !prev);
  }, [hasDrawer]);

  return (
    <div className={styles.scaffold}>
      {/* 1. AppBar 区域 */}
      {appBar && React.cloneElement(appBar, { 
        onDrawerClick: toggleDrawer,
        showDrawerBtn: hasDrawer 
      })}

      {/* 2. Drawer 区域 */}
      {hasDrawer && (
        <>
          <div 
            className={`${styles.drawerMask} ${isDrawerOpen ? styles.open : ''}`} 
            onClick={toggleDrawer} 
          />
          <aside className={`${styles.drawerContent} ${isDrawerOpen ? styles.open : ''}`}>
            <header className={styles.drawerHeader}>
              <strong>{drawerTitle}</strong>
            </header>
            <nav className={styles.drawerNav}>
              {drawerMenu.filter(i => i.display !== false).map((item) => (
                <button 
                  key={item.key} 
                  className={styles.menuItem} 
                  onClick={() => {
                    setDrawerOpen(false);
                    if (item.onTap) item.onTap();
                  }}
                >
                  <IconSvg name={item.icon.name} size={22} />
                  <span className={styles.menuLabel}>{item.icon.label}</span>
                </button>
              ))}
            </nav>
          </aside>
        </>
      )}

      {/* 3. Body 区域 */}
      <main className={styles.body}>{body}</main>
    </div>
  );
};