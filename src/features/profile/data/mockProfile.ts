// src/features/profile/data/mockProfile.ts

export function deepCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
