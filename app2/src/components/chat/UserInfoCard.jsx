import React, { useState, useCallback } from 'react';
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
 * 信息展示子组件
 */
const Info = ({ children, className, style }) => {
  const renderContent = () => {
    // 如果 children 是一个普通对象（apiData），则按字段映射渲染
    if (
      typeof children === 'object' &&
      children !== null &&
      !Array.isArray(children) &&
      !React.isValidElement(children)
    ) {
      const fieldMap = {
        昵称: { key: 'nikename', default: '未设置' },
        邮箱: { key: 'email', default: '未绑定' },
      };

      return Object.entries(fieldMap).map(([label, { key, default: defVal }]) => (
        <div className="info-item" key={label}>
          <span className="info-label">{label}：</span>
          <span className="info-value">{children[key] || defVal}</span>
        </div>
      ));
    }
    return children;
  };

  return (
    <div className={`card-info-content ${className || ''}`} style={style}>
      {renderContent()}
    </div>
  );
};

/**
 * 用户信息卡片（按钮点击成功后变灰不可点，不隐藏组件）
 */
const UserInfoCard = ({
  title = '用户核心信息',
  onClick,
  clickable = true,
  onAddFriend,
  refuseAdd,
  refuseLoading = false,
  refuseDisabled = false,
  refuseText = '拒绝',
  addFriendLoading = false,
  addFriendDisabled = false,
  children,
  background = '',
  butText = '添加好友',
}) => {
  // ✅ 成功后“已处理”状态：按钮变灰且不可点（不隐藏）
  const [handled, setHandled] = useState(false);

  // 处理卡片点击（不影响按钮逻辑）
  const handleCardClick = (e) => {
    if (clickable && typeof onClick === 'function') {
      onClick(e);
    }
  };

  // 获取用户ID
  const getUserId = () => {
    let userId = '';
    React.Children.forEach(children, (child) => {
      if (child?.type === Info) {
        const infoData = child?.props?.children;
        if (infoData?.id) userId = infoData.id;
      }
    });
    return userId;
  };

  // 通过请求：成功后按钮变灰不可点
  const handleAddFriend = useCallback(
    async (e) => {
      e.stopPropagation();
      if (addFriendLoading || handled || addFriendDisabled) return;

      try {
        const userId = getUserId();
        await onAddFriend?.({ id: userId });
        setHandled(true);
      } catch (err) {
        console.error('通过请求失败：', err);
      }
    },
    [onAddFriend, addFriendLoading, handled, addFriendDisabled]
  );

  // 拒绝请求：成功后按钮变灰不可点
  const handleRefuseAdd = useCallback(
    async (e) => {
      e.stopPropagation();
      if (refuseLoading || handled || refuseDisabled) return;

      try {
        const userId = getUserId();
        await refuseAdd?.({ id: userId });
        setHandled(true);
      } catch (err) {
        console.error('拒绝请求失败：', err);
      }
    },
    [refuseAdd, refuseLoading, handled, refuseDisabled]
  );

  // 背景样式处理（保留原有逻辑）
  const cardStyle = {};
  const bgStr = String(background).trim();
  if (bgStr) {
    const isImageUrl = bgStr.includes('http') || bgStr.includes('url(');
    if (isImageUrl) {
      cardStyle.backgroundImage = bgStr.startsWith('url(') ? bgStr : `url(${bgStr})`;
      cardStyle.backgroundSize = 'cover';
      cardStyle.backgroundPosition = 'center';
      cardStyle.backgroundRepeat = 'no-repeat';
      cardStyle.color = '#ffffff';
    } else {
      cardStyle.backgroundColor = bgStr;
    }
  }

  return (
    <div
      className={`info-card ${clickable ? 'clickable' : ''}`}
      onClick={handleCardClick}
      style={{
        cursor: clickable ? 'pointer' : 'default',
        ...cardStyle,
      }}
    >
      <div className="card-title">{title}</div>

      {/* ✅ 按钮始终显示：成功后变灰且不可点 */}
      <div className="card-btn-group">
        <button
          className={`add-friend-btn ${addFriendLoading ? 'loading' : ''} ${handled ? 'disabled' : ''}`}
          onClick={handleAddFriend}
          disabled={addFriendLoading || addFriendDisabled || handled}
        >
          {handled ? '已处理' : addFriendLoading ? '处理中...' : butText}
        </button>

        {typeof refuseAdd === 'function' && (
          <button
            className={`refuse-friend-btn ${refuseLoading ? 'loading' : ''} ${handled ? 'disabled' : ''}`}
            onClick={handleRefuseAdd}
            disabled={refuseLoading || refuseDisabled || handled}
          >
            {handled ? '已处理' : refuseLoading ? '拒绝中...' : refuseText}
          </button>
        )}
      </div>

      {/* 内容区域始终显示 */}
      <div className="card-content-wrapper">{children}</div>
    </div>
  );
};

UserInfoCard.Avatar = Avatar;
UserInfoCard.Info = Info;

export { UserInfoCard };