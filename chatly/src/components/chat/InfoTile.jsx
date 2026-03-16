import React, { useEffect, useState } from 'react';
import { Text, Icon, XBox } from 'components/flutter';

/**
 * InfoTile - 信息行（支持编辑）
 * 说明：
 * 1. 图标和标题(label)交给 Icon 内部渲染
 * 2. InfoTile 只负责右侧 value / 编辑态
 */
export const InfoTile = ({ icon, label, value, onConfirm }) => {
  const editable = typeof onConfirm === 'function';

  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || '');

  useEffect(() => {
    setTempValue(value || '');
  }, [value]);

  const startEdit = () => {
    if (!editable) return;
    setTempValue(value || '');
    setEditing(true);
  };

  const confirm = () => {
    setEditing(false);
    onConfirm?.(tempValue);
  };

  const cancel = () => {
    setTempValue(value || '');
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') confirm();
    if (e.key === 'Escape') cancel();
  };

  return (
    <XBox alignment="center" style={{ width: '100%' }}>
      {/* 左侧：图标 + 标题 */}
      <div
        onClick={startEdit}
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: editable ? 'pointer' : 'default',
          flexShrink: 0
        }}
      >
        <Icon
          name={icon}
          label={label}
          labelPos="right"
          size={18}
          color="var(--accent-color)"
        />
      </div>

      {/* 右侧：值 / 编辑 */}
      <XBox alignment="center" style={{ flex: 1, minWidth: 0, marginLeft: 8 }}>
        {!editing && (
          <Text
            size={14}
            weight={500}
            style={{
              lineHeight: '24px',
              flex: 1,
              minWidth: 0
            }}
            ellipsis
          >
            {value || '-'}
          </Text>
        )}

        {editing && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              minWidth: 0
            }}
          >
            <input
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={cancel}
              autoFocus
              style={{
                flex: 1,
                minWidth: 0,
                height: 28,
                padding: '0 8px',
                border: '1px solid var(--border-color, #ddd)',
                borderRadius: 6,
                outline: 'none',
                fontSize: 13,
                boxSizing: 'border-box'
              }}
            />

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={confirm}
              style={{
                height: 28,
                padding: '0 10px',
                border: 'none',
                borderRadius: 6,
                background: 'var(--accent-color)',
                color: '#fff',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              确认
            </button>
          </div>
        )}
      </XBox>
    </XBox>
  );
};

export default InfoTile;