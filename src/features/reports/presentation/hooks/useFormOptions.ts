import { useMemo } from "react";
import type { Contact } from "@/contact/domain";
import { useInstantContacts, useInstantContactsByCompany } from "@/features/contact/presentation/hooks";
import { useInstantCompanies } from "@/features/company/presentation/hooks/data/useInstantCompanies";
import type { Project } from "@/project/domain";

export const useFormOptions = (
  project: Project | null,
  isCompanyClient: boolean
) => {
  const { contacts: contactsList = [], isFetching: allContactsLoading } =
    useInstantContacts();
  const { companies = [], isFetching: companiesLoading } = useInstantCompanies();

  const activeCompanyId = useMemo(
    () =>
      project?.lead?.contact?.company?.id ??
      project?.lead?.contact?.companyId ??
      null,
    [project]
  );

  const { contacts: companyContacts = [], isFetching: companyContactsLoading } =
    useInstantContactsByCompany(activeCompanyId);

  const effectiveContacts = isCompanyClient && activeCompanyId
    ? companyContacts
    : contactsList;

  const contactsLoading = isCompanyClient && activeCompanyId
    ? companyContactsLoading
    : allContactsLoading;

  const contactOptions = useMemo(
    () =>
      effectiveContacts.map((contact) => ({
        value: contact.id != null ? String(contact.id) : contact.name,
        label: contact.name,
      })),
    [effectiveContacts]
  );

  const contactByValue = useMemo(() => {
    const map = new Map<string, Contact>();
    effectiveContacts.forEach((contact) => {
      const key = contact.id != null ? String(contact.id) : contact.name;
      map.set(key, contact);
    });
    return map;
  }, [effectiveContacts]);

  const companyOptions = useMemo(
    () =>
      companies.map((company) => ({
        value: company.name,
        label: company.name,
      })),
    [companies]
  );

  const languageOptions = useMemo(
    () => [
      { value: "en", label: "English" },
      { value: "es", label: "Spanish" },
    ],
    []
  );

  const clientTypeOptions = useMemo(
    () => [
      { value: "company", label: "Company" },
      { value: "individual", label: "Individual" },
    ],
    []
  );

  return {
    contactOptions,
    contactByValue,
    contactsLoading,
    companyOptions,
    companiesLoading,
    languageOptions,
    clientTypeOptions,
  };
};


