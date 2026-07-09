export function readJson<T>(key: string) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

export function writeJson<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function readJsonArray<T>(key: string) {
  const value = readJson<T[]>(key);
  return Array.isArray(value) ? value : [];
}

export function writeJsonArray<T>(key: string, items: T[]) {
  writeJson(key, items);
}

export function removeStorageItem(key: string) {
  window.localStorage.removeItem(key);
}
