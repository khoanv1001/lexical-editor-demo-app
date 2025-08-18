// i18n/index.ts
import { ja } from "./ja";
import type { JaKey } from "./ja";

export const resources = {
    ja,
};

export type Locale = keyof typeof resources;

export function t(key: JaKey, locale: Locale = "ja"): string {
    return resources[locale][key] || key;
}
