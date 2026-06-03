import { memo } from "react";
import { Box, Skeleton, Image, Center } from "@mantine/core";
import { useCachedImage, useImgApiBase } from "utils";

const RADIUS = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  circle: "50%",
  square: 0,
};

function getRadius(radius) {
  if (typeof radius === "number") return radius;
  return RADIUS[radius] ?? radius;
}

const IMAGE_BASE_PATH = "avatar";

function SafeAvatarComponent({
  url,
  size = 40,
  radius = "circle",
  cover = true,
  stretch = false,
  onClick,
}) {
  const { joinPath } = useImgApiBase(IMAGE_BASE_PATH);

  const finalUrl = url ? joinPath(url) : "";
  const { src, loading } = useCachedImage(finalUrl);

  const fit = stretch ? "fill" : cover ? "cover" : "contain";

  const imageStyle = {
    width: "100%",
    height: "100%",
    display: "block",
    objectFit: fit,
  };

  return (
    <Box
      onClick={onClick}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        position: "relative",
        overflow: "hidden",
        borderRadius: getRadius(radius),
        cursor: onClick ? "pointer" : "default",
        boxSizing: "border-box",
        flexShrink: 0,
        background: "#f5f5f5",
      }}
    >
      {loading && (
        <Skeleton animate style={{ position: "absolute", inset: 0 }} />
      )}

      {!loading && src && (
        <Image
          src={src}
          alt="Avatar"
          draggable={false}
          style={imageStyle}
          styles={{ image: imageStyle }}
        />
      )}

      {!loading && !src && (
        <Center
          style={{
            width: "100%",
            height: "100%",
            background: "#f5f5f5",
          }}
        >
          <span
            style={{
              fontSize: Math.max(12, size * 0.32),
              lineHeight: 1,
              color: "#999",
              userSelect: "none",
            }}
          >
            ?
          </span>
        </Center>
      )}
    </Box>
  );
}
/**
 * SafeAvatar
 *
 * 基于 useCachedImage 的头像组件。
 * - 图片自动缓存到本地
 * - url 会通过 useImgApiBase("avatar") 拼接
 * - 仅 version 变化时重新渲染
 */
export const SafeAvatar = memo(
  SafeAvatarComponent,
  (prev, next) => prev.version === next.version
);

SafeAvatar.displayName = "SafeAvatar";