import type { ChangeEvent } from "react";
import type { CompanyFormValue } from "../CompanyForm";
import type { CompanyType } from "../../../domain/models";
import { isSubcontractorType } from "./companyTypeOptions";

export function useCompanyFormHandlers(
  value: CompanyFormValue,
  onChange: (value: CompanyFormValue) => void
) {
  function handleTextChange(
    event: ChangeEvent<HTMLInputElement>,
    key: keyof Pick<CompanyFormValue, "name" | "address">
  ) {
    onChange({ ...value, [key]: event.target.value });
  }

  function handleTypeChange(newValue: string) {
    const newType = newValue as CompanyType;
    const shouldResetService = !isSubcontractorType(newType as CompanyType);
    onChange({
      ...value,
      type: newValue === "" ? null : newType,
      serviceId: shouldResetService ? null : value.serviceId,
    });
  }

  function handleServiceChange(newValue: string) {
    const serviceId = newValue === "" ? null : Number(newValue);
    onChange({ ...value, serviceId });
  }

  function handleCustomerChange(event: ChangeEvent<HTMLInputElement>) {
    onChange({ ...value, isCustomer: event.target.checked });
  }

  function handleClientChange(event: ChangeEvent<HTMLInputElement>) {
    onChange({ ...value, isClient: event.target.checked });
  }

  function handleContactToggle(contactId: number) {
    const currentIds = value.contactIds || [];
    const newIds = currentIds.includes(contactId)
      ? currentIds.filter((id) => id !== contactId)
      : [...currentIds, contactId];
    onChange({ ...value, contactIds: newIds });
  }

  function handleNoteChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onChange({ ...value, note: event.target.value });
  }

  return {
    handleTextChange,
    handleTypeChange,
    handleServiceChange,
    handleCustomerChange,
    handleClientChange,
    handleContactToggle,
    handleNoteChange,
  };
}
