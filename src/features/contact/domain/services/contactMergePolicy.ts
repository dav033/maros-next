import type { Contact } from "../models";

function isDefined<T>(v: T | undefined | null): v is T {
  return v !== null && v !== undefined;
}

export function mergeContact(
  local: Contact,
  api?: Partial<Contact> | null
): Contact {
  if (!api) {
    return { ...local };
  }

  const merged: Contact = {
    id: local.id,
    name: isDefined(api.name) ? api.name : local.name,
    occupation: isDefined(api.occupation) ? api.occupation : local.occupation,
    phone: isDefined(api.phone) ? api.phone : local.phone,
    email: isDefined(api.email) ? api.email : local.email,
    address: isDefined(api.address) ? api.address : local.address,
    isCustomer: isDefined(api.isCustomer) ? api.isCustomer : local.isCustomer,
    isClient: isDefined(api.isClient) ? api.isClient : local.isClient,
    notes: isDefined(api.notes) ? api.notes! : local.notes,
  };

  return merged;
}

export function mergeApiUpdateFallback(
  local: Contact,
  apiResult?: Contact | Partial<Contact> | null
): Contact {
  if (!apiResult) {
    return { ...local };
  }
  return mergeContact(local, apiResult);
}

export function mergeContactIntoCollection(
  collection: readonly Contact[],
  updated: Contact
): Contact[] {
  const list = Array.isArray(collection) ? collection : [];
  const index = list.findIndex((c) => c.id === updated.id);

  if (index >= 0) {
    const result = [...list];
    result[index] = updated;
    return result;
  }

  return [updated, ...list];
}
