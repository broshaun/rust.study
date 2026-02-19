import React, { useMemo } from 'react';
import styles from './UserChat.module.css';

// 默认头像（avatar为null/加载失败时使用）
const DEFAULT_AVATAR = '/favicon.png';

// 子组件类型映射（避免刷新后静态属性丢失）
const BTN_TYPE_MAP = {
  Msg: 'chatBtn',
  Video: 'videoBtn',
  Delete: 'deleteBtn'
};

// 核心：UserChat 父组件
const UserChat = ({
  friendData = {},
  buildAvatarUrl,
  onClose,
  children // 接收子组件（Msg/Video/Delete）
}) => {
  // 解构并处理空值，适配新apiData结构（useMemo缓存避免刷新重复计算）
  const {
    displayName,
    shortId,
    email,
    avatarUrl
  } = useMemo(() => {
    const {
      remark = null,
      email = '无邮箱',
      nikename = '未知好友',
      avatar_url = null,
      friend_id = '无ID',
      id = ''
    } = friendData;

    // 优先显示nikename，remark为null时兜底
    const displayName = remark || nikename;

    // 处理friend_id切片（同步执行，避免函数调用时机问题）
    const idStr = String(friend_id || id);
    const shortId = idStr.length >= 6 ? idStr.slice(-6) : idStr;

    // 拼接头像URL（同步计算）
    let avatarUrl = DEFAULT_AVATAR;
    if (avatar_url) {
      if (typeof buildAvatarUrl === 'function') {
        avatarUrl = buildAvatarUrl(avatar_url) || DEFAULT_AVATAR;
      } else {
        avatarUrl = `https://your-domain.com/avatars/${avatar_url}`;
      }
    }

    return {
      displayName,
      shortId,
      email,
      avatarUrl
    };
  }, [friendData, buildAvatarUrl]);

  // 收集子组件的props并处理点击逻辑（核心修复：按钮变灰问题）
  const renderChildren = useMemo(() => {
    if (!children) return null;

    return React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return child;

      // 修复：通过组件名称识别类型，替代静态btnType属性
      const childName = child.type.displayName || child.type.name || '';
      const btnType = BTN_TYPE_MAP[childName] || '';
      // 【关键修复1】严格判断loading状态：仅Delete组件且显式传loading=true时才生效
      const loading = childName === 'Delete' && child.props.loading === true;

      // 通用props：注入friendData、阻止冒泡、样式前缀
      const mergedProps = {
        ...child.props, // 保留子组件原有props，避免覆盖
        onClick: (e) => {
          e.stopPropagation();
          // 执行子组件的onClick，传递friendData作为参数
          child.props.onClick?.(friendData);
        },
        className: [
          styles.operBtn,
          btnType ? styles[btnType] : '',
          // 【关键修复2】仅loading为true时才添加loading样式
          loading ? styles.loading : '',
          child.props.className || '' // 保留子组件自定义类名
        ].filter(Boolean).join(' '),
        // 【关键修复3】严格判断disabled：仅loading=true或显式传disabled=true时禁用
        disabled: loading || child.props.disabled === true,
        // 【关键修复4】仅Delete组件且loading=true时才显示"删除中..."
        children: loading ? `${child.props.lable || '删除好友'}中...` : (child.props.lable || child.props.children)
      };

      return React.cloneElement(child, mergedProps);
    });
  }, [children, friendData]);

  // 头像加载失败处理函数（抽离避免刷新后重复创建）
  const handleAvatarError = (e) => {
    e.target.src = DEFAULT_AVATAR;
  };

  return (
    <div className={styles.transitionContainer}>
      {/* 关闭按钮（可选） */}
      {onClose && (
        <button 
          className={styles.closeBtn} 
          onClick={onClose}
          aria-label="关闭"
        >
          ×
        </button>
      )}

      {/* 内容区域（头像+备注） */}
      <div className={styles.contentWrapper}>
        <div className={styles.avatarWrapper}>
          <div className={styles.friendAvatar}>
            <img
              src={avatarUrl}
              alt={displayName}
              className={styles.avatarImg}
              onError={handleAvatarError}
            />
          </div>
        </div>

        <div className={styles.friendInfo}>
          <h2 className={styles.friendName}>{displayName}</h2>
          <p className={styles.friendId}>ID: {shortId}</p>
          <p className={styles.friendEmail}>邮箱: {email}</p>
        </div>
      </div>

      {/* 操作按钮区域 - 渲染子组件 */}
      <div className={styles.btnGroup}>
        {renderChildren}
      </div>
    </div>
  );
};

// 子组件：发起聊天（添加displayName，避免刷新后名称丢失）
const Msg = ({ lable = '发起聊天', ...props }) => {
  return <button {...props}>{lable}</button>;
};
Msg.displayName = 'Msg';

// 子组件：发起视频
const Video = ({ lable = '发起视频', ...props }) => {
  return <button {...props}>{lable}</button>;
};
Video.displayName = 'Video';

// 子组件：删除好友
const Delete = ({ lable = '删除好友', loading = false, ...props }) => {
  return <button {...props}>{lable}</button>;
};
Delete.displayName = 'Delete';

// 挂载子组件到父组件（修复刷新后子组件挂载丢失）
UserChat.Msg = Msg;
UserChat.Video = Video;
UserChat.Delete = Delete;

export default UserChat;