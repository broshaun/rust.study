import React, { useState, useCallback } from 'react';

/**
 * 交互式图标按钮组件（含悬浮/旋转/变色/标签布局）
 * @param {string} name - SVG文件名（存放于static/svg/目录）
 * @param {number} size - 图标尺寸（px，默认24）
 * @param {Function} onClick - 点击回调
 * @param {string} color - 基础颜色（仅单色SVG生效，默认#666）
 * @param {string} hoverColor - 悬浮颜色（仅单色SVG生效，默认#007aff）
 * @param {'right' | 'bottom'} labelPos - 标签位置（默认bottom）
 * @param {string} label - 标签文字
 * @param {number} rotate - 旋转角度（deg，默认0）
 * @param {boolean} hoverScale - 是否悬浮放大（默认true）
 * @param {number} scaleRatio - 悬浮放大比例（默认1.1）
 */
export const Icon = ({
    name,
    size = 24,
    onClick,
    color = '#666',
    hoverColor = '#007aff',
    labelPos = 'bottom',
    label = '',
    rotate = 0,
    hoverScale = true,
    scaleRatio = 1.1,
}) => {
    const [isHovered, setIsHovered] = useState(false);

    // 防抖处理点击事件（优化性能）
    const handleClick = useCallback((e) => {
        onClick && onClick(e);
    }, [onClick]);

    // 计算变换样式（减少重复计算）
    const transformStyle = {
        transform: `rotate(${rotate}deg) scale(${hoverScale ? (isHovered ? scaleRatio : 1) : 1})`,
        transition: 'transform 0.2s ease-in-out',
    };

    // 颜色滤镜（仅单色SVG生效，提取为常量）
    const getColorFilter = (targetColor) => {
        const hex = targetColor.replace('#', '');
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return `brightness(0) saturate(100%) invert(${(r / 255) * 100}%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%) filter: drop-shadow(0 0 0 rgb(${r},${g},${b}))`;
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: labelPos === 'bottom' ? 'column' : 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: onClick ? 'pointer' : 'default',
                userSelect: 'none',
            }}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* 图标容器（复用IconSvg核心逻辑，内置无需单独引入） */}
            <div
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    flexShrink: 0,
                    display: 'inline-block',
                    ...transformStyle,
                }}
            >
                <img
                    src={`static/svg/${name}.svg`}
                    alt={name || 'icon'}
                    decoding="async"
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        objectFit: 'contain',
                        filter: isHovered ? getColorFilter(hoverColor) : getColorFilter(color),
                        transition: 'filter 0.2s ease-in-out',
                    }}
                />
            </div>

            {/* 标签文字（有值才渲染） */}
            {label && (
                <span
                    style={{
                        fontSize: 14,
                        color: isHovered ? hoverColor : color,
                        transition: 'color 0.2s ease-in-out',
                    }}
                >
                    {label}
                </span>
            )}
        </div>
    );
};