import React from 'react';
import styles from './Login.module.css';

const cx = (...xs) => xs.filter(Boolean).join(' ');

const Login = ({ children, className }) => (
  <div className={cx(styles.container, className)}>{children}</div>
);

Login.Head = ({ title, avatar, className }) => (
  <div className={cx(styles.head, className)}>
    {avatar && <img src={avatar} alt="" className={styles.avatar} />}
    {title && <h2 className={styles.title}>{title}</h2>}
  </div>
);

Login.Input = ({ children, className }) => (
  <div className={cx(styles.inputContainer, className)}>{children}</div>
);

Login.Submit = ({ children, className }) => (
  <div className={cx(styles.submitContainer, className)}>{children}</div>
);

export default Login;
