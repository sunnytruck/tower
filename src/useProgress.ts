import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadProgress,
  saveProgress,
  type Progress,
  type SaveStorage,
} from "./progressStore";
function storageAccess(): SaveStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
export function useProgress() {
  const [storage] = useState(storageAccess);
  const [loaded] = useState(() => loadProgress(storage));
  const [progress, setProgress] = useState(loaded.data);
  const current = useRef(progress);
  const [warning, setWarning] = useState(loaded.warning);
  const persist = useCallback(
    (data: Progress) => {
      if (!loaded.canSave || !storage) return;
      try {
        saveProgress(storage, data);
        setWarning(loaded.warning);
      } catch {
        setWarning("保存できません。現在の進行はこのページ内のみ有効です。");
      }
    },
    [loaded.canSave, loaded.warning, storage],
  );
  useEffect(() => persist(current.current), [persist]);
  const update = useCallback(
    (change: (data: Progress) => Progress) => {
      const next = change(current.current);
      if (next === current.current) return false;
      current.current = next;
      // Write immediately, including when a victory is followed by navigation/reload.
      persist(next);
      setProgress(next);
      return true;
    },
    [persist],
  );
  return { progress, update, warning };
}
