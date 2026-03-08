import React from 'react';
import styles from './BottomNav.module.css';
import { Row } from '../layout/Row';
import { Center } from '../layout/Alignments';
import { Expanded } from '../layout/Expanded';

/**
 * BottomNav - 移动端底部导航
 * 职责：平分布局，处理激活状态，避让底部安全区。
 */
export const BottomNav = ({ items = [], activeKey, onSelect }) => {
  return (
    <nav className={styles.bottomNav}>
      <Row height="100%">
        {items.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <Expanded key={item.key}>
              <button 
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={() => onSelect?.(item.key)}
              >
                {/* 利用你最习惯的 Center 组件确保内容居中 */}
                <Center height="100%">
                  <div className={styles.iconWrapper}>
                    {item.icon}
                    {item.badge && <span className={styles.badge}>{item.badge}</span>}
                  </div>
                  <span className={styles.label}>{item.label}</span>
                </Center>
              </button>
            </Expanded>
          );
        })}
      </Row>
    </nav>
  );
};