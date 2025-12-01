import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Contact } from "../../domain/models";
import type { ContactFormValue, ContactPatch } from "../../domain/mappers";
import { toContactPatch } from "../../domain/mappers";
import { patchContact, deleteContact, contactsKeys } from "@/contact";
import { useContactsApp } from "@/di";
import { useToast } from "@/shared/ui";

export const initialContactFormValue: ContactFormValue = {
  name: "",
  phone: "",
  email: "",
  occupation: "",
  address: "",
  isCustomer: false,
  isClient: false,
  companyId: null,
};

export function useContactMutations() {
  const contactsApp = useContactsApp();
  const queryClient = useQueryClient();
  const toast = useToast();

  const updateContactMutation = useMutation({
    mutationFn: (input: { id: number; patch: ContactPatch }) =>
      patchContact(contactsApp, input.id, input.patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: contactsKeys.lists() });
      toast.showSuccess("Contact updated successfully!");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Could not update contact";
      toast.showError(message);
      throw error;
    },
  });

  const handleDeleteContact = async (contactId: number) => {
    try {
      await deleteContact(contactsApp, contactId);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: contactsKeys.lists() });
      toast.showSuccess("Contact deleted successfully!");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Could not delete contact";
      toast.showError(message);
    }
  };

  return {
    updateContactMutation,
    handleDeleteContact,
    toContactPatch,
  };
}
