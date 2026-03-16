import { useStore } from "hooks/store";

export function useApiBase() {
  const [apiBase, setApiBase] = useStore("apiBase", "http://103.186.108.161:5015");
  return { apiBase, setApiBase };
}