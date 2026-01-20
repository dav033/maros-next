"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Contact, ContactPatch } from "../../../domain/models";
import type { ContactFormValue } from "../../../domain/mappers";
import { toContactPatch } from "../../../domain/mappers";
import { contactsKeys } from "@/contact/application";
import { toast } from "sonner";
import { updateContactAction, deleteContactAction } from "../../../actions/contactActions";

export const initialContactFormValue: ContactFormValue = {
  name: "",
  phone: "",
  email: "",
  occupation: "",
  address: "",
  isCustomer: false,
  isClient: false,
  companyId: null,
  note: "",
};

export function useContactMutations() {
  const queryClient = useQueryClient();

  const updateContactMutation = useMutation({
    mutationFn: async (input: { id: number; patch: ContactPatch }) => {
      const result = await updateContactAction(input.id, input.patch);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: contactsKeys.list });
      toast.success("Contact updated successfully!");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Could not update contact";
      toast.error(message);
      throw error;
    },
  });

  const handleDeleteContact = async (contactId: number) => {
    try {
      const result = await deleteContactAction(contactId);
      if (!result.success) {
        throw new Error(result.error);
      }
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: contactsKeys.list });
      toast.success("Contact deleted successfully!");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Could not delete contact";
      toast.error(message);
    }
  };

  return {
    updateContactMutation,
    handleDeleteContact,
    toContactPatch,
  };
}
