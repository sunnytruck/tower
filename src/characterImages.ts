import { CHARACTER_ASSETS, type SpriteKind } from "./characterAssets.ts";
export interface CharacterImageState {
  status: "loading" | "ready" | "missing";
  image: HTMLImageElement;
}
const cache = new Map<string, CharacterImageState>();
const listeners = new Set<() => void>();
export function onCharacterImageChanged(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
export function getCharacterImage(kind: SpriteKind): CharacterImageState {
  const source = CHARACTER_ASSETS[kind].image;
  const cached = cache.get(source);
  if (cached) return cached;
  const image = new Image();
  const state: CharacterImageState = { status: "loading", image };
  cache.set(source, state);
  const notify = () => listeners.forEach((cb) => cb());
  image.onload = () => {
    state.status =
      image.naturalWidth && image.naturalHeight ? "ready" : "missing";
    notify();
  };
  image.onerror = () => {
    state.status = "missing";
    notify();
  };
  image.src = source;
  return state;
}
