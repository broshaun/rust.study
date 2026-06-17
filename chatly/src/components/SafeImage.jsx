import { useEffect, useMemo, useRef, useState, memo } from "react";
import {
  Box,
  Skeleton,
  Image,
  Modal,
  UnstyledButton,
  Group,
  ActionIcon,
  Divider,
  Center,
} from "@mantine/core";
import {
  IconZoomIn,
  IconMaximize,
  IconRotateClockwise,
  IconX,
} from "@tabler/icons-react";
import { useCachedImage, apiImgs } from "utils";

const IMAGE_BASE_PATH = "images";

function SafeImageComponent({
  url,
  previewUrl,
  width,
  height,
  radius = "sm",
  fit = "fill",
  allowPreview = true,
  alt = "Image",
}) {
  const joinPath = (PATH) => apiImgs.join(IMAGE_BASE_PATH,PATH);
  const finalUrl = url ? joinPath(url) : "";
  const finalPreviewUrl = previewUrl ? joinPath(previewUrl) : finalUrl;

  const [opened, setOpened] = useState(false);
  const [ratio, setRatio] = useState(null);
  const [isDrag, setIsDrag] = useState(false);
  const [view, setView] = useState({ s: 1, x: 0, y: 0, r: 0 });

  const dragStart = useRef({ x: 0, y: 0 });

  const { src, loading } = useCachedImage(finalUrl);
  const { src: previewSrc } = useCachedImage(opened ? finalPreviewUrl : "");

  const size = useMemo(() => {
    if (width !== undefined && height !== undefined) {
      return { w: width, h: height };
    }

    const toNumber = (value) => parseFloat(value) || 0;

    if (width !== undefined) {
      return { w: width, h: ratio ? toNumber(width) / ratio : 50 };
    }

    if (height !== undefined) {
      return { w: ratio ? toNumber(height) * ratio : 50, h: height };
    }

    return { w: "100%", h: "auto" };
  }, [width, height, ratio]);

  const borderRadius =
    typeof radius === "number"
      ? radius
      : `var(--mantine-radius-${radius})`;

  useEffect(() => {
    if (!opened) {
      setView({ s: 1, x: 0, y: 0, r: 0 });
      setIsDrag(false);
    }
  }, [opened]);

  return (
    <>
      <Box
        component={allowPreview ? UnstyledButton : "div"}
        onClick={(event) => {
          if (!allowPreview || !src) return;

          event.stopPropagation();
          event.preventDefault();
          setOpened(true);
        }}
        style={{
          width: size.w,
          height: size.h,
          position: "relative",
          overflow: "hidden",
          lineHeight: 0,
          borderRadius,
          backgroundColor: "transparent",
          display: "inline-block",
          verticalAlign: "middle",
          cursor: allowPreview && src ? "zoom-in" : "default",
          flexShrink: 0,
        }}
      >
        {loading && (
          <Skeleton
            animate
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
            }}
          />
        )}

        {!loading && src && (
          <Image
            src={src}
            alt={alt}
            onLoad={(event) => {
              const { naturalWidth, naturalHeight } = event.currentTarget;

              if (naturalWidth && naturalHeight) {
                setRatio(naturalWidth / naturalHeight);
              }
            }}
            styles={{
              root: {
                width: "100%",
                height: "100%",
              },
              image: {
                width: "100%",
                height: "100%",
                objectFit: fit,
                borderRadius: "inherit",
              },
            }}
          />
        )}

        {!loading && !src && (
          <Center
            style={{
              width: size.w,
              height: size.h,
              minWidth: 50,
              minHeight: 50,
              background: "#f5f5f5",
            }}
          >
            <span
              style={{
                fontSize: 20,
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

      {allowPreview && (
        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          size="100%"
          padding={0}
          centered
          withCloseButton={false}
          overlayProps={{
            blur: 15,
            opacity: 0.9,
            color: "#000",
          }}
          styles={{
            content: {
              background: "transparent",
              height: "100vh",
              boxShadow: "none",
            },
            body: {
              height: "100%",
              display: "flex",
              flexDirection: "column",
              padding: 0,
            },
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <Box
            onWheel={(event) => {
              setView((current) => ({
                ...current,
                s: Math.min(
                  Math.max(
                    current.s + (event.deltaY > 0 ? -0.2 : 0.2),
                    0.8
                  ),
                  5
                ),
              }));
            }}
            onMouseDown={(event) => {
              if (view.s <= 1) return;

              setIsDrag(true);
              dragStart.current = {
                x: event.clientX - view.x,
                y: event.clientY - view.y,
              };
            }}
            onMouseMove={(event) => {
              if (!isDrag) return;

              setView((current) => ({
                ...current,
                x: event.clientX - dragStart.current.x,
                y: event.clientY - dragStart.current.y,
              }));
            }}
            onMouseUp={() => setIsDrag(false)}
            onMouseLeave={() => setIsDrag(false)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              cursor: isDrag ? "grabbing" : view.s > 1 ? "grab" : "default",
            }}
          >
            {previewSrc && (
              <Image
                src={previewSrc}
                alt={alt}
                fit="contain"
                style={{
                  transform: `translate(${view.x}px, ${view.y}px) scale(${view.s}) rotate(${view.r}deg)`,
                  transition: isDrag
                    ? "none"
                    : "transform 0.2s cubic-bezier(0, 0, 0.2, 1)",
                  userSelect: "none",
                  maxHeight: "90vh",
                  maxWidth: "95vw",
                  pointerEvents: "none",
                }}
              />
            )}
          </Box>

          <Box
            py="md"
            style={{
              flexShrink: 0,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Group
              gap={8}
              px={12}
              py={4}
              wrap="nowrap"
              style={{
                backgroundColor: "rgba(40,40,40,0.8)",
                borderRadius: 8,
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <ActionIcon
                variant="subtle"
                color="gray.2"
                size="md"
                onClick={() =>
                  setView((current) => ({
                    ...current,
                    s: Math.min(current.s + 0.5, 5),
                  }))
                }
              >
                <IconZoomIn size={18} />
              </ActionIcon>

              <ActionIcon
                variant="subtle"
                color="gray.2"
                size="md"
                onClick={() => setView({ s: 1, x: 0, y: 0, r: 0 })}
              >
                <IconMaximize size={18} />
              </ActionIcon>

              <ActionIcon
                variant="subtle"
                color="gray.2"
                size="md"
                onClick={() =>
                  setView((current) => ({
                    ...current,
                    r: current.r + 90,
                  }))
                }
              >
                <IconRotateClockwise size={18} />
              </ActionIcon>

              <Divider
                orientation="vertical"
                color="rgba(255,255,255,0.15)"
                h={14}
              />

              <ActionIcon
                variant="subtle"
                color="red.6"
                size="md"
                onClick={() => setOpened(false)}
              >
                <IconX size={18} />
              </ActionIcon>
            </Group>
          </Box>
        </Modal>
      )}
    </>
  );
}

/**
 * SafeImage
 *
 * 基于 useCachedImage 的安全图片组件。
 * - 图片自动缓存到本地
 * - url / previewUrl 会通过 useImgApiBase 拼接
 * - 仅 version 变化时重新渲染
 */
export const SafeImage = memo(
  SafeImageComponent,
  (prev, next) => prev.version === next.version
);

SafeImage.displayName = "SafeImage";