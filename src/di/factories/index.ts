/**
 * Application context factories.
 * Each factory creates and configures a specific feature's dependencies.
 * 
 * This modular approach:
 * - Makes dependencies explicit and testable
 * - Reduces coupling between features
 * - Simplifies the main DiProvider
 * - Enables lazy loading of contexts in the future
 */

export { createContactsAppContext } from "./contactsFactory";
export { createLeadsAppContext } from "./leadsFactory";
export { createProjectTypesAppContext } from "./projectTypesFactory";
export { createCompanyAppContext } from "./companyFactory";
