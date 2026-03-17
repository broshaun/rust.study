import styles from './Button.module.css';

export const Button = ({ onPressed, label, size = 'medium', width, disabled = false, style, color }) => {
  const classNames = [styles.button, styles[`size-${size}`], disabled ? styles.disabled : ''].join(' ');

  return (
    <button
      className={classNames}
      style={{ 
        width: width ? (typeof width === 'number' ? `${width}px` : width) : 'auto',
        ...(color ? { backgroundColor: color } : {}),
        ...style 
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled && onPressed) onPressed(e);
      }}
      disabled={disabled}
    >
      {label}
    </button>
  );
};