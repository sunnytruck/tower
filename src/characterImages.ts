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
export function getCharacterImage(
  kind: SpriteKind,
  source = CHARACTER_ASSETS[kind].image,
): CharacterImageState {
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

const warmed = new WeakSet<object>();
/** Warm all action frames before combat; cached failures never cause retry loops. */
export function warmCharacterImages(kind: SpriteKind) {
  const asset = CHARACTER_ASSETS[kind];
  if (warmed.has(asset)) return;
  warmed.add(asset);
  getCharacterImage(kind);
  for (const clip of Object.values(asset.clips ?? {}))
    for (const source of clip.frames) getCharacterImage(kind, source);
}
