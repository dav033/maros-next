"use client";

import type { Contact } from "@/contact/domain";
import {
  useContactCompanyModalLogic,
  type UseContactCompanyModalLogicReturn,
  useContactViewCompanyModal,
  useContactsNotesLogic,
  useContactsTableLogic,
  type UseContactsTableLogicReturn,
} from "..";
import {
  ContactsCrudReturn,
  useContactsCrud,
  UseContactsDataReturn,
  useContactsData,
} from "@/features/company/presentation/hooks";

export interface UseContactsPageLogicReturn {
  data: UseContactsDataReturn;
  crud: ContactsCrudReturn;
  table: UseContactsTableLogicReturn;
  companyModal: UseContactCompanyModalLogicReturn;
  notesModal: {
    isOpen: boolean;
    title: string;
    notes: string[];
    onChangeNotes: (notes: string[]) => void;
    onClose: () => void;
    onSave: () => Promise<void>;
    loading: boolean;
  };
  companyDetailsModal: {
    isOpen: boolean;
    company: ReturnType<typeof useContactViewCompanyModal>["company"];
    open: (company: NonNullable<ReturnType<typeof useContactViewCompanyModal>["company"]>) => void;
    close: () => void;
  };
}

export function useContactsPageLogic(): UseContactsPageLogicReturn {
  // 1) Datos
  const data = useContactsData();

  // 2) CRUD de contactos
  const crud = useContactsCrud();

  // 3) Negocio
  const notesLogic = useContactsNotesLogic();
  const companyDetailsModal = useContactViewCompanyModal();

  // 5) Tabla (búsqueda, filtrado e interacciones)
  const table = useContactsTableLogic({
    contacts: data.contacts,
    onEdit: (contact) => {
      if (typeof contact.id === "number") {
        crud.openEdit(contact as Contact & { id: number });
      }
    },
    onDelete: (contactId) => {
      crud.handleDelete(contactId);
    },
    onOpenNotesModal: notesLogic.openFromContact,
    onOpenCompanyModal: companyDetailsModal.open,
  });

  // 6) Modal de creación de compañía desde el contacto
  const companyModal = useContactCompanyModalLogic({ crud });

  return {
    data,
    crud,
    table,
    companyModal,
    notesModal: notesLogic.modalProps,
    companyDetailsModal: {
      isOpen: companyDetailsModal.isOpen,
      company: companyDetailsModal.company,
      open: companyDetailsModal.open,
      close: companyDetailsModal.close,
    },
  };
}
