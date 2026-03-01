import React, { useState, useCallback, useRef, memo, useEffect } from '.store/react@18.3.1/node_modules/react'
import styles from './ImageUpload.module.css'

const ImageUpload = memo(({
  onConfirm,
  maxSize = 5,
  acceptTypes = ['image/jpeg', 'image/png'],
  btnText = '上传',
  size = '32px',
  previewWidth = '38px',
  onError
}) => {
  const [previewUrl, setPreviewUrl] = useState('')
  const [file, setFile] = useState(null)
  const [error, setError] = useState(false)
  const inputRef = useRef(null)

  // 清理 objectURL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const validate = useCallback((f) => {
    if (!acceptTypes.includes(f.type)) {
      onError?.({ type: 'format', message: '格式不支持' })
      setError(true)
      return false
    }
    if (f.size > maxSize * 1024 * 1024) {
      onError?.({ type: 'size', message: `不能超过${maxSize}MB` })
      setError(true)
      return false
    }
    return true
  }, [acceptTypes, maxSize, onError])

  const clear = useCallback(() => {
    if (inputRef.current) inputRef.current.value = ''
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(null)
    setPreviewUrl('')
    setError(false)
  }, [previewUrl])

  // ✅ 点击“上传”后也回到上传按钮（你要求点上传也要回到上传按钮）
  // 实际上：上传按钮本来就在初始态，所以这里的意思是：每次点上传前先清空旧状态
  const pick = useCallback(() => {
    clear()
    inputRef.current?.click()
  }, [clear])

  const onChange = useCallback((e) => {
    const f = e.target.files?.[0]
    if (!f) return

    setError(false)
    if (!validate(f)) return

    if (previewUrl) URL.revokeObjectURL(previewUrl)

    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
  }, [validate, previewUrl])

  // ✅ 确定后回到上传按钮
  const confirm = useCallback(async () => {
    if (!file) return
    try {
      await onConfirm?.(file) // 支持 onConfirm 返回 Promise
    } finally {
      clear()
    }
  }, [file, onConfirm, clear])

  // ✅ 取消后回到上传按钮
  const cancel = useCallback(() => {
    clear()
  }, [clear])

  return (
    <div className={styles.uploadContainer} style={{ height: size }}>
      <div className={styles.uploadWrapper} style={{ height: size }}>
        <input
          ref={inputRef}
          type="file"
          accept={acceptTypes.join(',')}
          onChange={onChange}
          className={styles.fileInput}
        />

        {!previewUrl ? (
          <button
            className={`${styles.uploadBtn} ${error ? styles.errorBtn : ''}`}
            onClick={pick}
            style={{ height: size }}
          >
            {btnText}
          </button>
        ) : (
          <div className={styles.previewContainer}>
            <div
              className={styles.previewWrapper}
              style={{ height: size, width: previewWidth }}
            >
              <img src={previewUrl} className={styles.previewImg} alt="预览" />
            </div>

            <div className={styles.btnGroup}>
              <button
                className={styles.confirmBtn}
                onClick={confirm}
                style={{ height: size }}
                title="确定"
              >
                ✓
              </button>
              <button
                className={styles.clearBtn}
                onClick={cancel}
                style={{ height: size }}
                title="取消"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className={styles.errorTip}>图片格式/大小错误</div>
      )}
    </div>
  )
})

export default ImageUpload