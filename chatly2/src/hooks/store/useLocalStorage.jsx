import { useEffect, useRef, useState } from "react";
import { LazyStore } from "@tauri-apps/plugin-store";

const store = new LazyStore("settings.json");

export function useLocalStorage(key, defaultValue) {
  const getDefaultValue =
    typeof defaultValue === "function" ? defaultValue : () => defaultValue;

  const [state, setState] = useState(getDefaultValue);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      const savedValue = await store.get(key);

      if (!mounted) return;

      if (savedValue !== null && savedValue !== undefined) {
        setState(savedValue);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [key]);

  const setStoreState = async (value) => {
    const nextValue =
      typeof value === "function" ? value(stateRef.current) : value;

    setState(nextValue);
    stateRef.current = nextValue;

    await store.set(key, nextValue);
    await store.save();

    return nextValue;
  };

  return [state, setStoreState];
}