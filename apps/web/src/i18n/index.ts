import en from "./en.json";

export type TranslationKey = keyof typeof en;

export function t(path: string): string {
  const parts = path.split(".");
  let current: any = en;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return path;
    }
  }
  return typeof current === "string" ? current : path;
}

export { en };
