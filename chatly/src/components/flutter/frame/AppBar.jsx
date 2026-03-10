import React from 'react';
import styles from './AppBar.module.css';
import { Center, Left, Right } from '../layout/Align';

/**
 * AppBar - 材质适配导航栏
 * 职责：自适应 Mac 红绿灯，确保标题物理居中。
 */
export const AppBar = ({ title, leading, actions, style }) => (
  <nav className={styles.appBar} style={style}>
    {/* 左侧：避让区 */}
    <Left alignment="center" style={{ width: 'auto', flex: 1 }}>
      {leading}
    </Left>

    {/* 中间：绝对居中标题 */}
    <div className={styles.titleContainer}>
      <Center alignment="center">
        <h1 className={styles.titleText}>{title}</h1>
      </Center>
    </div>

    {/* 右侧：动作区 */}
    <Right alignment="center" style={{ width: 'auto', flex: 1 }}>
      {actions}
    </Right>
  </nav>
);