// Domain Models
export type { 
  Contact, 
  ContactId, 
  ContactDraft, 
  ContactPatch 
} from "./domain/models";

// For DiProvider - Application Context
export type { ContactsAppContext } from "./application/context";
export { makeContactsAppContext } from "./application/context";

// For DiProvider - Infrastructure Repositories
export { ContactHttpRepository } from "./infra/index";

// Presentation - Pages
export { ContactsPage } from "./presentation/pages";
