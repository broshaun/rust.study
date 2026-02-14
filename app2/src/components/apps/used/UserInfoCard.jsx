import React from 'react';
import './UserInfoCard.css';

/**
 * 用户信息展示卡片组件
 * @param {Object} props - 组件属性
 * @param {string} props.email - 用户邮箱
 * @param {string} props.id - 用户ID
 * @param {string} [props.title=用户核心信息] - 卡片标题
 * @param {Function} [props.onClick] - 卡片点击事件回调
 * @param {boolean} [props.clickable=true] - 是否可点击（控制卡片交互状态）
 * @param {Function} [props.onAddFriend] - 添加好友按钮点击事件（新增）
 * @param {boolean} [props.addFriendLoading=false] - 添加好友按钮加载状态（新增）
 * @param {boolean} [props.addFriendDisabled=false] - 添加好友按钮禁用状态（新增）
 * @returns {JSX.Element} 渲染后的组件
 */
const UserInfoCard = ({
  email,
  id,
  title = '用户核心信息',
  onClick,
  clickable = true,
  onAddFriend,
  addFriendLoading = false,
  addFriendDisabled = false
}) => {
  // 处理卡片点击事件
  const handleCardClick = (e) => {
    // 仅当传入onClick且可点击时执行
    if (clickable && typeof onClick === 'function') {
      onClick({ email, id });
    }
  };

  // 处理添加好友按钮点击
  const handleAddFriend = (e) => {
    // 阻止事件冒泡到卡片，避免触发卡片的onClick
    e.stopPropagation();
    if (!addFriendDisabled && !addFriendLoading && typeof onAddFriend === 'function') {
      onAddFriend({ email, id });
    }
  };

  return (
    <div 
      className={`info-card ${clickable ? 'clickable' : ''}`}
      onClick={handleCardClick}
      style={{ 
        cursor: clickable ? 'pointer' : 'default'
        // 移除内联的position:relative，移到CSS中统一管理
      }}
    >
      {/* 卡片标题 */}
      <div className="card-title">{title}</div>

      {/* 新增：右上角添加好友按钮 */}
      <button
        className={`add-friend-btn ${addFriendLoading ? 'loading' : ''} ${addFriendDisabled ? 'disabled' : ''}`}
        onClick={handleAddFriend}
        disabled={addFriendDisabled || addFriendLoading}
      >
        {addFriendLoading ? '添加中...' : '添加好友'}
      </button>

      {/* 信息项 */}
      <div className="info-item">
        <span className="info-label">邮箱：</span>
        <span className="info-value">{email}</span>
      </div>
      <div className="info-item">
        <span className="info-label">ID：</span>
        <span className="info-value">{id}</span>
      </div>
    </div>
  );
};

export { UserInfoCard };