import React, { useEffect, useState } from 'react';
import { Text, SizedBox, Icon, XBox } from 'components/flutter';

/**
 * InfoTile - 信息行（支持编辑）
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
  };

  return (
    <XBox alignment="center" style={{ width: '100%' }}>

      {/* 图标 */}
      {icon && (
        <SizedBox width={24} height={24}>
          <div
            onClick={startEdit}
            style={{
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: editable ? 'pointer' : 'default'
            }}
          >
            <Icon name={icon} size={18} color="var(--accent-color)" />
          </div>
        </SizedBox>
      )}

      <SizedBox width={12} />

      <XBox alignment="center" style={{ flex: 1, minWidth: 0 }}>

        {/* 非编辑模式 */}
        {!editing && (
          <>
            <SizedBox width={50}>
              <Text size={12} color="var(--text-secondary)" style={{ lineHeight: '24px' }}>
                {label}
              </Text>
            </SizedBox>

            <Text
              size={14}
              weight={500}
              style={{ lineHeight: '24px', flex: 1, minWidth: 0 }}
              ellipsis
            >
              {value || '-'}
            </Text>
          </>
        )}

        {/* 编辑模式 */}
        {editing && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
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
                height: 32,
                padding: '0 10px',
                border: '1px solid var(--border-color,#ddd)',
                borderRadius: 6,
                outline: 'none',
                fontSize: 14,
                boxSizing: 'border-box'
              }}
            />

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={confirm}
              style={{
                height: 32,
                padding: '0 12px',
                border: 'none',
                borderRadius: 6,
                background: 'var(--accent-color)',
                color: '#fff',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
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