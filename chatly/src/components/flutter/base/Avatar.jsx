import React, { useMemo } from "react";
import styles from "./Avatar.module.css";
import { useImage } from "hooks/http";

// 常量抽离：便于维护
const DEFAULT_AVATAR = "/favicon.png";
const DEFAULT_ROUNDED_RADIUS = 8;
const DEFAULT_BORDER_COLOR = "#f0f0f0";
const DEFAULT_SHADOW_STYLE = "0 2px 8px rgba(0, 0, 0, 0.06)";
const DEFAULT_BACKGROUND = "#f3f4f6";

// 类型校验：增强代码提示（TS 风格注释，无 TS 也可参考）
/**
 * 通用头像组件（支持自适应、自定义填充、缓存）
 * @param {Object} props
 * @param {string} [props.src] - 头像图片地址/名称（会走 useImage 缓存）
 * @param {string} [props.alt=头像] - 图片替代文本（无障碍）
 * @param {'circle'|'square'|'rounded'} [props.variant=circle] - 头像形状
 * @param {number|'auto'} [props.size=auto] - 尺寸：数字(px) / auto(自适应父容器)
 * @param {'contain'|'cover'} [props.fit=contain] - 图片填充方式：contain(完整) / cover(填满裁切)
 * @param {number} [props.roundedRadius=8] - variant=rounded 时的圆角大小(px)
 * @param {string} [props.className] - 自定义类名
 * @param {string} [props.borderColor=#f0f0f0] - 边框颜色（transparent 为透明）
 * @param {boolean} [props.hasShadow=false] - 是否显示阴影
 * @param {React.CSSProperties} [props.style] - 自定义内联样式
 * @param {string} [props.imageBaseUrl=/imgs] - useImage 的基础路径
 * @param {'none'|'http'|'cacheStorage'} [props.cache=cacheStorage] - 缓存策略
 * @param {string} [props.cacheName=image-cache] - 缓存名称
 * @param {number} [props.expireMs=3600000] - 缓存过期时间(ms)
 * @param {boolean} [props.cacheEnabled=true] - 是否启用缓存
 * @param {boolean} [props.disableHover=false] - 是否禁用 hover 效果
 * @returns {React.ReactElement}
 */
const Avatar = ({
  src,
  alt = "头像",
  variant = "circle",
  size = 50,
  fit = "contain",
  roundedRadius = DEFAULT_ROUNDED_RADIUS,
  className,
  borderColor = DEFAULT_BORDER_COLOR,
  hasShadow = false,
  style = {},
  imageBaseUrl = "",
  cache = "cacheStorage",
  cacheName = "image-cache",
  expireMs = 3600_000,
  cacheEnabled = true,
  disableHover = false, // 新增：禁用 hover 效果（列表场景常用）
}) => {
  // 优化：类名拼接函数抽离 + 空值过滤
  const cx = useMemo(() => (...xs) => xs.filter(Boolean).join(" "), []);


  // 缓存图片加载逻辑
  const { src: cachedSrc, loading, error } = useImage(
    imageBaseUrl,
    src || "",
    {
      enabled: cacheEnabled && !!src,
      cache,
      cacheName,
      expireMs,
    }
  );

  // 优化：最终图片地址 - 优先级：缓存地址 > 传入地址 > 默认头像
  const finalSrc = useMemo(() => {
    if (cacheEnabled && cachedSrc) return cachedSrc;
    if (src) return src;
    return DEFAULT_AVATAR;
  }, [cacheEnabled, cachedSrc, src]);

  // 优化：圆角计算 - 防止非法值
  const borderRadius = useMemo(() => {
    switch (variant) {
      case "circle":
        return "50%";
      case "square":
        return "0";
      case "rounded":
        // 确保圆角是有效数字
        const validRadius = Math.max(0, Number(roundedRadius) || DEFAULT_ROUNDED_RADIUS);
        return `${validRadius}px`;
      default:
        console.warn(`Avatar: 不支持的 variant 类型 ${variant}，默认使用 circle`);
        return "50%";
    }
  }, [variant, roundedRadius]);

  // 优化：尺寸计算 - 校验 size 合法性
  const sizeStyle = useMemo(() => {
    if (size === "auto") {
      return { width: "100%", height: "100%" };
    }
    // 确保 size 是有效数字
    const validSize = Math.max(0, Number(size) || 0);
    return validSize > 0 
      ? { width: `${validSize}px`, height: `${validSize}px` }
      : { width: "100%", height: "100%" }; // 非法值默认自适应
  }, [size]);

  // 优化：合并样式 - 分层处理，优先级：自定义 style > 组件默认 style
  const mergedStyle = useMemo(() => ({
    // 基础尺寸/形状
    ...sizeStyle,
    borderRadius,
    // 边框/阴影
    border: `1px solid ${borderColor}`,
    boxShadow: hasShadow ? DEFAULT_SHADOW_STYLE : "none",
    // 加载状态
    opacity: loading ? 0.65 : 1,
    // 图片展示
    display: "block",
    objectFit: fit,
    objectPosition: "center",
    background: DEFAULT_BACKGROUND,
    // 盒模型（自适应必备）
    boxSizing: "border-box",
    // 防止超出父容器
    maxWidth: "100%",
    maxHeight: "100%",
    // 禁用 hover 时移除过渡
    transition: disableHover ? "none" : "all 0.2s ease",
    // 自定义样式覆盖
    ...style,
  }), [sizeStyle, borderRadius, borderColor, hasShadow, loading, fit, disableHover, style]);

  // 优化：合并类名 - 支持禁用 hover
  const mergedClassName = cx(
    styles.avatar,
    disableHover && styles.noHover, // 新增禁用 hover 的类
    className
  );

  // 优化：错误处理 - 防止重复触发
  const handleError = React.useCallback((e) => {
    if (e.target.src === DEFAULT_AVATAR) return; // 已兜底，不再重复设置
    e.currentTarget.src = DEFAULT_AVATAR;
    e.currentTarget.alt = "默认头像";
  }, []);

  return (
    <img
      src={finalSrc}
      alt={error ? "头像加载失败" : alt}
      className={mergedClassName}
      style={mergedStyle}
      onError={handleError}
      // 无障碍优化：添加角色标识
      role="img"
      aria-label={error ? "头像加载失败" : alt}
    />
  );
};

export default Avatar;