
export type { 
  Contact, 
  ContactId, 
  ContactDraft, 
  ContactPatch 
} from "./domain/models";

export type { ContactsAppContext } from "./application/context";
export { makeContactsAppContext } from "./application/context";

export { ContactHttpRepository } from "./infra/index";

export { ContactsPage } from "./presentation/pages";

export { ContactViewModal } from "./presentation/organisms";
export type { ContactViewModalProps } from "./presentation/organisms";