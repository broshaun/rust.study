import React from 'react';
import styles from './Login.module.css';

const cx = (...xs) => xs.filter(Boolean).join(' ');

const ALIGN_CLASS = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
  between: styles.alignBetween,
};

export default function Login({ children, className, align = 'start' }) {
  return (
    <div className={cx(styles.container, ALIGN_CLASS[align] || ALIGN_CLASS.start, className)}>
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
