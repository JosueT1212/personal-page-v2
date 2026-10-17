/** Chunks of 7: one golden spiral per chunk (13, 8, 5, 3, 2, 1, 1). */
export function spirals<T>(items: T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += 7) out.push(items.slice(i, i + 7));
  return out;
}
/** Grid-area per slot within a spiral. */
export const SLOTS = ['a', 'b', 'c', 'd', 'f', 'g', 'h'] as const;

/** Look up a gallery.json `src` among the globbed files, ignoring case. HEIC gets its own error (browsers can't show it). */
export function resolvePhoto<T>(src: string, files: Record<string, T>): T {
  if (/\.heic$/i.test(src)) throw new Error(`gallery.json: "${src}" — HEIC isn't supported — export as JPG`);
  const want = `/src/assets/gallery/${src}`.toLowerCase();
  const key = Object.keys(files).find((k) => k.toLowerCase() === want);
  if (!key) throw new Error(`gallery.json: "${src}" not found in src/assets/gallery/`);
  return files[key];
}
