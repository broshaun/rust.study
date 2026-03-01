import { useState, useCallback, useEffect, useRef } from "react";

/**
 * useClick
 *
 * 捕获一次“点击 / 触发”行为，并在 delay 后自动重置为 null
 * - 支持相同 value 连续触发
 * - 自动清理，防止状态残留
 * - 对外 API 极简：只暴露 click / setClick
 */
export function useClick(delay = 100) {
  const [click, setClickState] = useState(null);

  const timerRef = useRef();
  const seqRef = useRef(0);

  const setClick = useCallback(
    (value) => {
      clearTimeout(timerRef.current);

      if (value == null) return;

      // 保证相同 value 也能被视为一次新点击
      seqRef.current += 1;
      setClickState({ value, seq: seqRef.current });

      timerRef.current = setTimeout(() => {
        setClickState(null);
      }, delay);
    },
    [delay]
  );

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return { click, setClick };
}
