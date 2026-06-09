// src/shared/mock-db/cloneDeep.ts

export function cloneDeep<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
