import React from 'react';
import styles from './Login.module.css';

// 核心 Login 组件（根容器）
const Login = ({ children }) => {
  return <div className={styles.container}>{children}</div>;
};

// Head 子组件 - 承载头像和标题
Login.Head = ({ title, avatar, className }) => {
  return (
    <div className={`${styles.head} ${className || ''}`}>
      <img src={avatar} alt="头像" className={styles.avatar} />
      <h2 className={styles.title}>{title}</h2>
    </div>
  );
};

// Input 子组件 - 输入区容器
Login.Input = ({ children, className }) => {
  return (
    <div className={`${styles.inputContainer} ${className || ''}`}>
      {children}
    </div>
  );
};

// Submit 子组件 - 提交按钮容器
Login.Submit = ({ children, className }) => {
  return (
    <div className={`${styles.submitContainer} ${className || ''}`}>
      {children}
    </div>
  );
};

export default Login;



{/* <Login>
  <Login.Head title='登记界面' avatar='./favicon.png' />
  <Login.Input>
    <input/>
  </Login.Input>
  <Login.Submit>
    <button>登录</button>
  </Login.Submit>
</Login> */}