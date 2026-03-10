import React from 'react';
import { Row, Text, SizedBox, Icon } from 'components/flutter';

/**
 * InfoTile - 纯净信息行
 * 职责：只负责横向排列 图标、标签 和 值。不包含任何内外边距和背景。
 * @param {string} icon - 图标名称
 * @param {string} label - 标签文本 (如: 名称, 邮箱)
 * @param {string} value - 实际内容
 */
export const InfoTile = ({ icon, label, value }) => {
    return (
        // 直接用 Row 作为最外层，100% 宽度，没有任何额外的 padding/margin
        <Row alignment="center" style={{ width: '100%' }}>
            
            {/* 1. 图标区 (固定宽度对齐) */}
            {icon && (
                <SizedBox width={24} height={24}>
                    <Icon name={icon} size={18} color="var(--accent-color)" />
                </SizedBox>
            )}
            
            <SizedBox width={12} />
            
            <Row alignment="center" style={{ flex: 1 }}>
                {/* 2. 标签区 (固定宽度 50，确保垂直对齐) */}
                <SizedBox width={50}>
                    <Text size={12} color="var(--text-secondary)" style={{ lineHeight: '24px' }}>
                        {label}
                    </Text>
                </SizedBox>

                {/* 3. 内容区 (占据剩余空间，超长自动省略) */}
                <Row alignment="center" style={{ flex: 1 }}>
                    <Text size={14} weight={500} style={{ lineHeight: '24px' }} ellipsis>
                        {value || '-'}
                    </Text>
                </Row>
            </Row>

        </Row>
    );
};