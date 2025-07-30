// useAutoSave.js
// hook لتنفيذ دالة تلقائياً عند تغير القيم مع دعم التأخير (debounce)
import { useEffect, useRef } from "react";
import { useDebounce } from "./useDebounce";

export function useAutoSave(value, onSave, delay = 1000) {
  const debouncedValue = useDebounce(value, delay);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    onSave(debouncedValue);
  }, [debouncedValue, onSave]);
}
