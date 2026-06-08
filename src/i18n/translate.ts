import type { Messages } from "./messages";

function getNestedValue(messages: Messages, key: string): unknown {
  return key.split(".").reduce<unknown>((value, part) => {
    if (value && typeof value === "object" && part in (value as Record<string, unknown>)) {
      return (value as Record<string, unknown>)[part];
    }
    return undefined;
  }, messages);
}

export function translate(
  messages: Messages,
  key: string,
  vars?: Record<string, string | number>,
  fallbackMessages?: Messages
): string {
  const value = getNestedValue(messages, key);
  const fallbackValue = fallbackMessages ? getNestedValue(fallbackMessages, key) : undefined;
  const resolved = typeof value === "string" ? value : typeof fallbackValue === "string" ? fallbackValue : undefined;
  if (!resolved) {
    return key;
  }

  if (!vars) {
    return resolved;
  }

  return Object.entries(vars).reduce((result, [name, replacement]) => {
    return result.replace(new RegExp(`\\{${name}\\}`, "g"), String(replacement));
  }, resolved);
}
