export { applyContactPatch } from "./applyContactPatch";
export { buildContactDraft } from "./buildContactDraft";
export {
  mergeApiUpdateFallback,
  mergeContact,
  mergeContactIntoCollection,
} from "./contactMergePolicy";
export type { ApiContactDTO } from "./contactReadMapper";
export {
  mapContactFromDTO,
  mapContactsFromDTO,
} from "./contactReadMapper";
export {
  buildIdentityIndex,
  ensureUniqueness,
  findDuplicate,
  toUniquenessCandidate,
} from "./contactUniquenessPolicy";
export { searchByName } from "./contactQueries";
export {
  areContactsPotentialDuplicates,
  makeContactIdentityKey,
  normalizeName,
} from "./contactIdentityPolicy";
export { ensureContactDraftIntegrity } from "./ensureContactDraftIntegrity";
export { ensureContactIntegrity, isContactIntegrityOK } from "./ensureContactIntegrity";
export {
  assertNoValidationIssues,
  collectContactValidationIssues,
  validateOrThrow,
} from "./contactValidation";
