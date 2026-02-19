import React from 'react';
import './UserInfoCard.css';

// 默认头像（兜底使用）
const DEFAULT_AVATAR = 'https://q1.qlogo.cn/g?b=qq&nk=0&s=640';

/**
 * 头像子组件
 */
const Avatar = ({ children, className, style }) => {
  return (
    <div className={`card-avatar ${className || ''}`} style={style}>
      {children}
    </div>
  );
};

/**
 * 信息展示子组件：自动解析传入的对象并渲染为信息项
 */
const Info = ({ children, className, style }) => {
  // 核心：如果children是对象，自动解析为信息项；否则直接渲染
  const renderContent = () => {
    // 判断是否是纯对象（排除数组、React元素等）
    if (typeof children === 'object' && children !== null && !Array.isArray(children) && !React.isValidElement(children)) {
      // 定义字段映射：{ 展示标签: 对象key, 默认值 }
      const fieldMap = {
        '昵称': { key: 'nikename', default: '未设置' },
        '邮箱': { key: 'email', default: '未绑定' },
      };

      // 遍历字段映射生成信息项
      return Object.entries(fieldMap).map(([label, { key, default: defVal }], index) => (
        <div className="info-item" key={index}>
          <span className="info-label">{label}：</span>
          <span className="info-value">{children[key] || defVal}</span>
        </div>
      ));
    }
    // 非对象则直接渲染（兼容字符串/React元素等）
    return children;
  };

  return (
    <div className={`card-info-content ${className || ''}`} style={style}>
      {renderContent()}
    </div>
  );
};

/**
 * 用户信息展示卡片组件（支持直接传入对象到Info子组件）
 */
const UserInfoCard = ({
  title = '用户核心信息',
  onClick,
  clickable = true,
  onAddFriend,
  addFriendLoading = false,
  addFriendDisabled = false,
  children
}) => {
  // 处理卡片点击事件
  const handleCardClick = (e) => {
    if (clickable && typeof onClick === 'function') {
      onClick(e);
    }
  };

  // 处理添加好友按钮点击（传递用户ID）
  const handleAddFriend = (e) => {
    e.stopPropagation();
    if (!addFriendDisabled && !addFriendLoading && typeof onAddFriend === 'function') {
      // 从Info子组件的children中提取用户ID（兼容你的apiData结构）
      let userId = '';
      // 遍历子组件找到Info，提取其中的对象
      React.Children.forEach(children, (child) => {
        if (child?.type === Info) {
          const infoData = child?.props?.children;
          if (infoData?.id) userId = infoData.id;
        }
      });
      // 调用回调并传递ID
      onAddFriend({ id: userId });
    }
  };

  return (
    <div 
      className={`info-card ${clickable ? 'clickable' : ''}`}
      onClick={handleCardClick}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
    >
      {/* 卡片标题 */}
      <div className="card-title">{title}</div>

      {/* 添加好友按钮 */}
      <button
        className={`add-friend-btn ${addFriendLoading ? 'loading' : ''} ${addFriendDisabled ? 'disabled' : ''}`}
        onClick={handleAddFriend}
        disabled={addFriendDisabled || addFriendLoading}
      >
        {addFriendLoading ? '添加中...' : '添加好友'}
      </button>

      {/* 核心：渲染自定义子组件（Avatar + Info） */}
      <div className="card-content-wrapper">
        {children}
      </div>
    </div>
  );
};

// 挂载子组件到主组件上
UserInfoCard.Avatar = Avatar;
UserInfoCard.Info = Info;

export { UserInfoCard };