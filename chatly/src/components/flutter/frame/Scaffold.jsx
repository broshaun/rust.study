import React, { useState, useCallback } from 'react';
import styles from './Scaffold.module.css';
import { IconSvg } from '../base/IconSvg';
/**
 * AppBar 组件
 * @param {boolean} showDrawerBtn - 是否显示抽屉按钮
 */
export const AppBar = ({ title, iconDrawer, onDrawerClick, showDrawerBtn }) => (
  <div className={styles.appBarInner}>
    {showDrawerBtn ? (
      <button 
        onClick={onDrawerClick}
        style={{ border: 'none', background: 'transparent', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
      >
        <IconSvg name={iconDrawer || 'menu'} size={24} />
      </button>
    ) : (
      <div style={{ width: '40px' }} /> // 保持间距平衡
    )}
    <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: '17px' }}>{title}</div>
    <div style={{ width: '40px' }} /> 
  </div>
);

/**
 * Scaffold 组件
 * @param {string} drawerTitle - 抽屉顶部的标题名称
 */
export const Scaffold = ({ appBar, drawerMenu, drawerTitle = "控制台", body }) => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const hasDrawer = drawerMenu && drawerMenu.length > 0;

  const toggleDrawer = useCallback(() => {
    if (hasDrawer) setDrawerOpen(prev => !prev);
  }, [hasDrawer]);

  return (
    <div className={styles.scaffold}>
      {/* 1. AppBar 区域 */}
      {appBar && (
        <nav className={styles.appBar}>
          {React.cloneElement(appBar, { 
            onDrawerClick: toggleDrawer,
            showDrawerBtn: hasDrawer // 只有存在抽屉数据时才显示按钮
          })}
        </nav>
      )}

      {/* 2. Drawer 区域 (仅在 hasDrawer 为 true 时渲染) */}
      {hasDrawer && (
        <>
          <div 
            className={`${styles.drawerMask} ${isDrawerOpen ? styles.open : ''}`} 
            onClick={toggleDrawer} 
          />
          <aside className={`${styles.drawerContent} ${isDrawerOpen ? styles.open : ''}`}>
            <div style={{ padding: '24px 20px', borderBottom: '1px solid #eee' }}>
              <strong style={{ fontSize: '18px', color: '#007AFF' }}>{drawerTitle}</strong>
            </div>
            <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
              {drawerMenu.filter(item => item.display !== false).map((item) => (
                <button 
                  key={item.key} 
                  className={styles.menuItem} 
                  onClick={() => {
                    setDrawerOpen(false);
                    const action = item.onTap || item.onConTaplick;
                    if (action) action();
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
    </div>
  );
};