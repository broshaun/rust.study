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
 * 整合了 AppBar, Drawer, Body, bottomNavigationBar 和 backgroundColor
 */
export const Scaffold = ({ 
  appBar, 
  drawerMenu = [], 
  drawerTitle = "控制台", 
  body, 
  bottomNavigationBar, 
  backgroundColor 
}) => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const hasDrawer = drawerMenu.length > 0;

  const toggleDrawer = useCallback(() => {
    if (hasDrawer) setDrawerOpen(prev => !prev);
  }, [hasDrawer]);

  // 动态背景样式处理
  const scaffoldStyle = {
    backgroundColor: backgroundColor || '#fafafa'
  };

  return (
    <div className={styles.scaffold} style={scaffoldStyle}>
      {/* 1. AppBar 区域 */}
      {appBar && React.cloneElement(appBar, { 
        onDrawerClick: toggleDrawer,
        showDrawerBtn: hasDrawer 
      })}

      {/* 2. Drawer 侧边栏 */}
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

      {/* 3. Body 内容区域 */}
      <main className={styles.body}>
        {body}
      </main>

      {/* 4. BottomNavigationBar 底部导航区域 */}
      {bottomNavigationBar && (
        <footer className={styles.bottomBar}>
          {bottomNavigationBar}
          <div className={styles.safeAreaBottom} />
        </footer>
      )}
    </div>
  );
};