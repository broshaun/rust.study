import { useEffect, useState } from "react";
import { appStore } from "hooks/db";

/**
 * React + Tauri Store
 * 替代 useLocalStorageState
 */
export function useStore(key, defaultValue = null) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    appStore.get(key).then((v) => {
      if (v !== undefined && v !== null) {
        setValue(v);
      }
    });
  }, [key]);

  const update = (v) => {
    setValue(v);

    return appStore
      .set(key, v)
      .then(() => appStore.save());
  };

  const remove = () => {
    setValue(defaultValue);

    return appStore
      .delete(key)
      .then(() => appStore.save());
  };

  return [value, update, { remove }];
}