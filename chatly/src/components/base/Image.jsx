import React, { useState, useEffect, useRef, useMemo } from "react"
import styles from './Image.module.css'

const Image = ({
  src,
  alt = '图片',
  fit = 'contain',
  lazy = true,
  maxWidth,
  maxHeight,
  borderRadius = 8,
  showPlaceholder = true,
  onLoad,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(!!src)
  const [isError, setIsError] = useState(false)
  const [realSrc, setRealSrc] = useState(lazy ? '' : (src || ''))

  const boxRef = useRef(null)
  const obRef = useRef(null)

  // src 变化时重置状态
  useEffect(() => {
    setIsError(false)
    setIsLoading(!!src)
    setRealSrc(lazy ? '' : (src || ''))
  }, [src, lazy])

  // 懒加载：observe 容器，而不是 img（避免 display:none 死锁）
  useEffect(() => {
    if (!lazy || !src) return
    const el = boxRef.current
    if (!el) return

    obRef.current?.disconnect()
    obRef.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setRealSrc(src)
        obRef.current?.disconnect()
      }
    }, { rootMargin: '100px' })

    obRef.current.observe(el)

    return () => obRef.current?.disconnect()
  }, [src, lazy])

  const handleLoad = (e) => {
    setIsLoading(false)
    setIsError(false)
    onLoad?.(e)
  }

  const handleError = (e) => {
    setIsLoading(false)
    setIsError(true)
    onError?.(e)
  }

  const containerStyle = useMemo(() => ({
    maxWidth: maxWidth ? `${maxWidth}px` : '100%',
    maxHeight: maxHeight ? `${maxHeight}px` : 'none',
    borderRadius: `${borderRadius}px`
  }), [maxWidth, maxHeight, borderRadius])

  const hideImg = showPlaceholder && (isLoading || isError)

  return (
    <div ref={boxRef} className={styles.imageContainer} style={containerStyle}>
      {showPlaceholder && (isLoading || isError) && (
        <div
          className={`${styles.placeholder} ${isError ? styles.errorPlaceholder : ''}`}
          style={{ borderRadius: `${borderRadius}px` }}
        >
          <span className={styles.placeholderText}>
            {isError ? '图片加载失败' : '图片加载中...'}
          </span>
        </div>
      )}

      <img
        className={styles.image}
        alt={alt}
        src={realSrc}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          objectFit: fit,
          borderRadius: `${borderRadius}px`,
          visibility: hideImg ? 'hidden' : 'visible'
        }}
      />
    </div>
  )
}

export default Image
