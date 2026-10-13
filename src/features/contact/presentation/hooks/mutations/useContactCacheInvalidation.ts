"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { contactsKeys } from "@/contact/application";
import { companyKeys } from "@/company/application/keys/companyKeys";
import { leadsKeys } from "@/leads/application";
import { projectsKeys } from "@/project/application";
import { customersKeys } from "@/customers/infra/keys";

/** Contact fields and company membership are embedded in these cached views. */
export function useContactCacheInvalidation() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    for (const queryKey of [contactsKeys.all, companyKeys.all, leadsKeys.all, projectsKeys.all, customersKeys.all]) {
      void queryClient.invalidateQueries({ queryKey });
    }
  }, [queryClient]);
}
