import React from '.store/react@18.3.1/node_modules/react';
import styles from './Login.module.css';

const cx = (...xs) => xs.filter(Boolean).join(' ');

const ALIGN_CLASS = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
  between: styles.alignBetween,
};

export default function Login({ 
  children, 
  className, 
  align = 'start',
  background, // 新增：控制背景色的属性
  style // 新增：支持自定义样式，用于覆盖背景色
}) {
  // 合并样式：background为true时添加默认背景色，否则透明
  const mergedStyle = {
    // 未传background时，背景透明；传了则用默认白色（可通过style覆盖）
    background: background ? '#fff' : 'transparent',
    ...style // 用户自定义样式优先级更高
  };

  return (
    <div 
      className={cx(
        styles.container, 
        ALIGN_CLASS[align] || ALIGN_CLASS.start, 
        className
      )}
      style={mergedStyle} // 注入背景色样式
    >
      {children}
    </div>
  );
}

Login.Head = function Head({ children, className }) {
  return <div className={cx(styles.head, className)}>{children}</div>;
};

Login.Input = function Input({ children, className }) {
  return <div className={cx(styles.input, className)}>{children}</div>;
};

Login.Submit = function Submit({ children, className }) {
  return <div className={cx(styles.submit, className)}>{children}</div>;
};