"use client";

import { useCallback } from "react";

import { useEntityCrud } from "@/shared/presentation";
import type { EntityKeys } from "@/shared/query/createEntityKeys";
import { contactsKeys } from "@/contact/application";
import { useContactCacheInvalidation } from "./useContactCacheInvalidation";

import type { Contact, ContactPatch } from "../../../domain/models";
import type { ContactFormValue } from "../../../domain/mappers";
import { toContactPatch } from "../../../domain/mappers";
import {
  deleteContactAction,
  updateContactAction,
} from "../../../actions/contactActions";

const contactsEntityKeys: EntityKeys = {
  all: contactsKeys.all,
  lists: contactsKeys.lists,
  list: contactsKeys.lists,
  details: contactsKeys.details,
  detail: contactsKeys.detail,
};

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
  const invalidateContact = useContactCacheInvalidation();
  const { updateMutation, removeMutation, queryClient } = useEntityCrud<
    Contact,
    never,
    ContactPatch,
    number
  >({
    entityLabel: "Contact",
    keys: contactsEntityKeys,
    optimistic: true,
    actions: {
      update: async (id, patch) => {
        const result = await updateContactAction(id, patch);
        if (result.success) invalidateContact();
        return result;
      },
      remove: async (id) => {
        const result = await deleteContactAction(id);
        if (result.success) invalidateContact();
        return result;
      },
    },
  });

  const handleDeleteContact = useCallback(
    async (contactId: number) => {
      await removeMutation.mutateAsync(contactId);
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    [removeMutation, queryClient],
  );

  return {
    updateContactMutation: updateMutation,
    handleDeleteContact,
    toContactPatch,
  };
}
