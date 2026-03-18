import { useLocalStorage } from "@mantine/hooks";

/**
 * 全局 apiBase（统一入口）
 * - defaultValue 固定为 ""
 * - 业务层只从这里拿 apiBase，不要重复 useLocalStorage("apiBase")
 */
export function useApiBase() {
  const [apiBase, setApiBase] = useLocalStorage({ key: "apiBase", defaultValue: "http://103.186.108.161:5015" });
  return { apiBase: apiBase || "", setApiBase };
}

