import React from "react";
import styles from './SizedBox.module.css';

/**
 * SizedBox - 纯净空间调节器
 * 职责：强制锁定物理尺寸。既可作为内容的容器，也可作为纯粹的间距占位。
 * * @param {Object} props
 * @param {React.ReactNode} [props.children] - 子元素
 * @param {number|string} [props.width] - 宽度，数字默认 px
 * @param {number|string} [props.height] - 高度，数字默认 px
 */
export const SizedBox = ({ children, width, height }) => {
  const f = (v) => typeof v === 'number' ? `${v}px` : v;

  const style = {
    '--sb-w': width !== undefined ? f(width) : undefined,
    '--sb-h': height !== undefined ? f(height) : undefined,
  };

  return (
    <div className={styles.sizedBox} style={style}>
      {children}
    </div>
  );
};