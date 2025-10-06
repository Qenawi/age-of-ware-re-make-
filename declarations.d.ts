// Allow importing image assets (Vite will handle these)
declare module '*.png' {
  const src: string;
  export default src;
}
declare module '*.svg' {
  const src: string;
  export default src;
}
declare module '*.json' {
  const value: any;
  export default value;
}

// Vite glob import typing
// Minimal declaration to silence TS errors for import.meta.glob usage
interface ImportMeta {
  glob(pattern: string, options?: { eager?: boolean }): Record<string, { default: string } | string>;
}
