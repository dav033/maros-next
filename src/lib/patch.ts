/**
 * Utility functions for creating patches and trimming strings
 */

/**
 * Trims all string fields in an object
 */
export function trimStringFields<T extends object>(obj: T): T {
  const result = { ...obj } as Record<string, unknown>;
  for (const key in result) {
    if (typeof result[key] === "string") {
      result[key] = (result[key] as string).trim();
    }
  }
  return result as T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NormalizerFn = (value: any) => any;
type Normalizers<T> = Partial<Record<keyof T, NormalizerFn>>;

/**
 * Creates a patch object containing only the changed fields between current and updated objects
 * @param current - The current state of the object
 * @param updated - The updated state of the object
 * @param normalizers - Optional normalizer functions for specific fields
 * @returns An object containing only the changed fields
 */
export function createPatch<T extends object>(
  current: T,
  updated: Partial<T>,
  normalizers?: Normalizers<T>
): Partial<T> {
  const patch: Partial<T> = {};
  const currentObj = current as Record<string, unknown>;
  const updatedObj = updated as Record<string, unknown>;

  for (const key in updatedObj) {
    if (!Object.prototype.hasOwnProperty.call(updatedObj, key)) continue;

    let currentValue = currentObj[key];
    let updatedValue = updatedObj[key];

    // Apply normalizer if exists
    const normalizer = normalizers?.[key as keyof T];
    if (normalizer) {
      currentValue = normalizer(currentValue);
      updatedValue = normalizer(updatedValue);
    }

    // Compare values (deep comparison for objects/arrays)
    const currentStr = JSON.stringify(currentValue);
    const updatedStr = JSON.stringify(updatedValue);

    if (currentStr !== updatedStr) {
      (patch as Record<string, unknown>)[key] = updatedObj[key];
    }
  }

  return patch;
}
