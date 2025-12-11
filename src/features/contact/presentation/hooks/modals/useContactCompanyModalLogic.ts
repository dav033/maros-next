"use client";

import * as React from "react";
import {
  initialCompanyFormValue,
  toDraft as toCompanyDraft,
} from "@/features/company/presentation/helpers/companyFormHelpers";
import type { CompanyFormValue } from "@/features/company/presentation/molecules/CompanyForm";
import {
  ContactsCrudReturn,
  useCompanyMutations,
} from "@/features/company/presentation/hooks";

export interface UseContactCompanyModalLogicReturn {
  isCompanyModalOpen: boolean;
  companyFormValue: CompanyFormValue;
  companyServerError: string | null;
  isCompanySubmitting: boolean;
  openCompanyModal: () => void;
  closeCompanyModal: () => void;
  handleCompanyFormChange: (value: CompanyFormValue) => void;
  handleCompanySubmit: () => Promise<void>;
}

interface UseContactCompanyModalLogicProps {
  crud: ContactsCrudReturn;
}

export function useContactCompanyModalLogic(
  props: UseContactCompanyModalLogicProps
): UseContactCompanyModalLogicReturn {
  const { crud } = props;
  const { createMutation: createCompanyMutation } = useCompanyMutations();

  const [isCompanyModalOpen, setIsCompanyModalOpen] = React.useState(false);
  const [companyFormValue, setCompanyFormValue] =
    React.useState<CompanyFormValue>(initialCompanyFormValue);
  const [companyServerError, setCompanyServerError] =
    React.useState<string | null>(null);

  const openCompanyModal = React.useCallback(() => {
    setCompanyFormValue(initialCompanyFormValue);
    setCompanyServerError(null);
    setIsCompanyModalOpen(true);
  }, []);

  const closeCompanyModal = React.useCallback(() => {
    if (createCompanyMutation.isPending) return;
    setIsCompanyModalOpen(false);
    setCompanyServerError(null);
    setCompanyFormValue(initialCompanyFormValue);
  }, [createCompanyMutation.isPending]);

  const handleCompanyFormChange = React.useCallback(
    (value: CompanyFormValue) => {
      setCompanyFormValue(value);
    },
    []
  );

  const handleCompanySubmit = React.useCallback(async () => {
    const draft = toCompanyDraft(companyFormValue);

    if (!draft.name) {
      setCompanyServerError("Name is required");
      return;
    }

    try {
      const created = await createCompanyMutation.mutateAsync({ draft });

      // Vinculamos la nueva compañía al formulario del contacto actual
      crud.handleFormChange({
        ...crud.formValue,
        companyId: (created as any).id,
      });

      setIsCompanyModalOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not create company";
      setCompanyServerError(message);
    }
  }, [companyFormValue, createCompanyMutation, crud]);

  return {
    isCompanyModalOpen,
    companyFormValue,
    companyServerError,
    isCompanySubmitting: createCompanyMutation.isPending,
    openCompanyModal,
    closeCompanyModal,
    handleCompanyFormChange,
    handleCompanySubmit,
  };
}
