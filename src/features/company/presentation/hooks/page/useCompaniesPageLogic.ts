// useCompaniesPageLogic.ts
"use client";

import {
  useCompaniesData,
  useCompaniesTableLogic,
  useCompanyContactModal,
  useCompanyCreateModal,
  useCompanyEditModal,
  useCompanyMutations,
  useCompanyNotesLogic,
  useCompanyQuickContactLogic,
  useManageServicesModal,
} from "..";
import type { Company } from "../../../domain/models";

export interface UseCompaniesPageLogicReturn {
  data: ReturnType<typeof useCompaniesData>;
  modals: {
    create: ReturnType<typeof useCompanyCreateModal>;
    edit: ReturnType<typeof useCompanyEditModal>;
    services: ReturnType<typeof useManageServicesModal>;
    contact: ReturnType<typeof useCompanyContactModal>;
  };
  table: ReturnType<typeof useCompaniesTableLogic>;
  quickContact: ReturnType<typeof useCompanyQuickContactLogic>;
  notes: {
    modalProps: ReturnType<typeof useCompanyNotesLogic>["modalProps"];
  };
}

export function useCompaniesPageLogic(): UseCompaniesPageLogicReturn {
  // 1) Datos
  const data = useCompaniesData();
  const { companies, contacts, services } = data;

  // 2) Modales “puros”
  const createModal = useCompanyCreateModal();
  const editModal = useCompanyEditModal({ contacts });
  const servicesModal = useManageServicesModal();
  const contactModal = useCompanyContactModal({
    setCreateFormValue: createModal.setFormValue,
    setEditFormValue: editModal.setFormValue,
  });

  // 3) Negocio
  const { deleteMutation } = useCompanyMutations();
  const notesLogic = useCompanyNotesLogic();
  const quickContact = useCompanyQuickContactLogic({ contactModal });

  // 4) Estado/UI de tabla
  const table = useCompaniesTableLogic({
    companies,
    services,
    onEdit: (company: Company) => editModal.open(company),
    onDelete: async (id: number) => {
      await deleteMutation.mutateAsync(id);
    },
    onOpenNotes: notesLogic.openFromCompany,
  });

  return {
    data,
    modals: {
      create: createModal,
      edit: editModal,
      services: servicesModal,
      contact: contactModal,
    },
    table,
    quickContact,
    notes: {
      modalProps: notesLogic.modalProps,
    },
  };
}
