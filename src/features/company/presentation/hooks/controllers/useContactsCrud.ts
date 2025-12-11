"use client";

import { useCrudPage } from "@dav033/dav-components";
import { useContactsApp } from "@/di";
import { toContactDraft, toContactFormValue, toContactPatch, type Contact, type ContactDraft, type ContactFormValue, type ContactPatch } from "@/contact/domain";
import {
  contactsKeys,
  createContact,
  patchContact,
} from "@/contact/application";


const initialFormValue: ContactFormValue = {
  name: "",
  phone: "",
  email: "",
  occupation: "",
  address: "",
  isCustomer: false,
  isClient: false,
  companyId: null,
};

export type ContactsCrudReturn = ReturnType<
  typeof useCrudPage<
    Contact & { id: number },
    ContactFormValue,
    ContactDraft,
    ContactPatch
  >
>;

export function useContactsCrud(): ContactsCrudReturn {
  const app = useContactsApp();

  const crud = useCrudPage<
    Contact & { id: number },
    ContactFormValue,
    ContactDraft,
    ContactPatch
  >({
    queryKey: [contactsKeys.list, ["customers"]],
    createFn: async (draft) => {
      const res = await createContact(app, draft);
      if (typeof res.id !== "number") {
        throw new Error("Created contact has no id");
      }
      return res as Contact & { id: number };
    },
    updateFn: async (id, patch) => {
      const res = await patchContact(app, id, patch);
      if (typeof res.id !== "number") {
        throw new Error("Updated contact has no id");
      }
      return res as Contact & { id: number };
    },
    toDraft: toContactDraft,
    toPatch: toContactPatch,
    initialFormValue,
    toFormValue: toContactFormValue,
    successMessages: {
      create: "Contact created successfully!",
      update: "Contact updated successfully!",
    },
  });

  return crud;
}
