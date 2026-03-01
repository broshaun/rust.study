import React from '.store/react@18.3.1/node_modules/react';
import { IconItem } from '../icon';
// 引入 CSS Modules 样式文件，命名为 styles
import styles from './Desktop.module.css';

export const Desktop = ({
  desktopData = [
    {
      label: '默认图标',
      iconName: 'home',
      onClick: () => { console.log('点击回调') }
    }
  ],
  title = '应用中心'
}) => {
  return (
    // 所有类名通过 styles.xxx 调用，连字符转驼峰
    <div className={styles.desktopContainer}>
      {/* 应用中心标题 + 分隔线 */}
      <div className={styles.desktopTitleSection}>
        <h1 className={styles.desktopMainTitle}>{title}</h1>
        <div className={styles.desktopDivider}></div>
      </div>
      
      {/* 白色圆角卡片容器 */}
      <div className={styles.desktopAppsWrapper}>
        {/* 图标网格布局 */}
        <div className={styles.desktopIconGrid}>
          {desktopData.length > 0 ? (
            desktopData.map((item, index) => {
              const { label, iconName, onClick } = item;
              return (
                <div key={index} className={styles.desktopIconItem} onClick={onClick}>
                  {/* 图标容器（核心交互） */}
                  <div className={styles.desktopIcon}>
                    <IconItem name={iconName} size={48}/>
                  </div>
                  {/* 文字标签 */}
                  <span className={styles.desktopIconLabel}>{label}</span>
                </div>
              );
            })
          ) : (
            // 空数据提示
            <div className={styles.desktopEmpty}>暂无应用图标</div>
          )}
        </div>
      </div>
    </div>
  );
};