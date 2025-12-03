/**
 * Creates a patch object containing only changed fields between current and updated values
 * @param current - The current entity state
 * @param updates - The updated values from form
 * @param normalizers - Optional field-specific normalizers (e.g., trimming, empty to undefined)
 * @returns Patch object with only changed fields
 */
export function createPatch<T extends Record<string, any>>(
  current: T,
  updates: Partial<T>,
  normalizers?: Partial<Record<keyof T, (val: any) => any>>
): Partial<T> {
  const patch: Partial<T> = {};

  for (const key in updates) {
    if (!Object.prototype.hasOwnProperty.call(updates, key)) {
      continue;
    }

    const updateValue = updates[key];
    const currentValue = current[key];
    
    const normalizer = normalizers?.[key];
    const normalizedUpdate = normalizer ? normalizer(updateValue) : updateValue;
    const normalizedCurrent = normalizer ? normalizer(currentValue) : currentValue;

    const areEqual = 
      normalizedUpdate === normalizedCurrent ||
      (normalizedUpdate == null && normalizedCurrent == null);

    if (!areEqual) {
      patch[key] = normalizedUpdate;
    }
  }

  return patch;
}

/**
 * Checks if a patch object contains any changes
 */
export function hasChanges<T>(patch: Partial<T>): boolean {
  return Object.keys(patch).length > 0;
}

/**
 * Trims all string fields in an object
 * Useful for normalizing form input before processing
 */
export function trimStringFields<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };
  for (const key in result) {
    if (typeof result[key] === "string") {
      result[key] = (result[key] as string).trim() as any;
    }
  }
  return result;
}

/**
 * Removes null and undefined values from an object
 */
export function removeNullish<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key in obj) {
    if (obj[key] != null) {
      result[key] = obj[key];
    }
  }
  return result;
}


