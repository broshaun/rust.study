import { useRef } from 'react'
import { useEventListener } from 'ahooks'

export function useSwipe(ref, { onLeft, onRight, threshold = 60 } = {}) {
  const startX = useRef(0)
  const startY = useRef(0)

  useEventListener(
    'touchstart',
    (e) => {
      const t = e.touches[0]
      startX.current = t.clientX
      startY.current = t.clientY
    },
    { target: ref }
  )

  useEventListener(
    'touchend',
    (e) => {
      const t = e.changedTouches[0]
      const dx = t.clientX - startX.current
      const dy = t.clientY - startY.current

      // 横向位移大于纵向才触发
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
        if (dx > 0) onRight?.()
        else onLeft?.()
      }
    },
    { target: ref }
  )
}