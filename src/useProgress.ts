import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadProgress,
  saveProgress,
  migrateProgress,
  SAVE_KEY,
  SAVE_VERSION,
  type Progress,
  type SaveStorage,
} from "./progressStore";
import { durableChange } from "./gacha";
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
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== SAVE_KEY || !event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue);
        if (parsed.version > SAVE_VERSION) return;
        current.current = migrateProgress(parsed);
        setProgress(current.current);
      } catch { /* Keep the valid in-memory save. */ }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const transact = useCallback(async (change: (data: Progress) => Progress): Promise<Progress | null> => {
    const commit = () => {
      if (!loaded.canSave || !storage) {
        setWarning("保存できないためガチャを実行できません。通貨は消費していません。");
        return null;
      }
      try {
        // Refresh under the origin-wide lock, including pulls from another tab.
        const latest = loadProgress(storage);
        if (!latest.canSave) { setWarning(latest.warning); return null; }
        const base = latest.data;
        const next = durableChange(storage, SAVE_KEY, base, change);
        current.current = next;
        setProgress(next);
        setWarning(loaded.warning);
        return next === base ? null : next;
      } catch {
        setWarning("結果を保存できませんでした。ガチャの通貨消費・入手は行っていません。");
        return null;
      }
    };
    return navigator.locks ? navigator.locks.request(SAVE_KEY, commit) : commit();
  }, [loaded.canSave, loaded.warning, storage]);
  return { progress, update, transact, warning };
}
