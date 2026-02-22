import { useLocalStorageState } from "ahooks";

/**
 * 全局 apiBase（统一入口）
 * - defaultValue 固定为 ""
 * - 业务层只从这里拿 apiBase，不要重复 useLocalStorageState("apiBase")
 */
export function useApiBase() {
  const [apiBase, setApiBase] = useLocalStorageState("apiBase", { defaultValue: "" });
  return { apiBase: apiBase || "", setApiBase };
}