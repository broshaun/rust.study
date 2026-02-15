import React, { memo, useCallback } from 'react';
import styles from './Button.module.css';

const cx = (...xs) => xs.filter(Boolean).join(' ');

/**
 * Button（只管自身，不管在父容器里怎么摆）
 * @param size: { width, height }
 * @param content: 'left' | 'center' | 'right'  // 按钮内部内容对齐
 */
const Button = memo(({
  onClick,
  size = { width: '100px', height: '40px' },
  content = 'center',
  disabled = false,
  children,
  className,
}) => {
  const handleClick = useCallback((e) => {
    if (disabled || !onClick) return;
    onClick(e);
  }, [onClick, disabled]);

  const { width, height } = size;
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <button
      type="button"
      className={cx(styles.button, styles[`content-${content}`], className)}
      style={style}
      disabled={disabled}
      onClick={handleClick}
    >
      {children}
    </button>
  );
});

export default Button;
