import { useEffect, useRef, useState } from "react";


export function useReady(getter, deps = [], options = {}) {
  const { interval = 150, timeout } = options;
  const [state, setState] = useState({ ready: false, data: null });
  const getterRef = useRef(getter);
  getterRef.current = getter;

  useEffect(() => {
    setState({ ready: false, data: null });
    let timerId;
    let stopped = false;
    const start = Date.now();
    const check = () => {
      if (stopped) return;
      const value = getterRef.current();
      if (value != null) {
        setState({ ready: true, data: value });
        return;
      }

      if (timeout && Date.now() - start > timeout) {
        setState({ ready: false, data: null });
        return;
      }
      timerId = setTimeout(check, interval);
    };
    check();
    return () => {
      stopped = true;
      clearTimeout(timerId);
    };
  }, deps);

  return state;
}