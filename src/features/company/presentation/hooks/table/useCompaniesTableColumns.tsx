"use client";

import { Badge } from "@/components/ui/badge";
import type { SimpleTableColumn } from "@/types/table";
import { Check, X } from "lucide-react";
import Link from "next/link";

import * as React from "react";
import type { Company } from "../../../domain/models";
import { NotesButton } from "@/components/shared";
import { CompanyTypeBadge } from "../../atoms/CompanyTypeBadge";
import { ServiceBadge } from "../../atoms/ServiceBadge";

interface UseCompaniesTableColumnsProps {
  services: Array<{ id: number; name: string; color?: string | null }>;
  onOpenNotesModal: (company: Company) => void;
}

export function useCompaniesTableColumns({
  services,
  onOpenNotesModal,
}: UseCompaniesTableColumnsProps): SimpleTableColumn<Company>[] {
  return React.useMemo<SimpleTableColumn<Company>[]>(() => {
    return [
      {
        key: "notes",
        header: "Notes",
        className: "w-[80px] text-center",
        render: (company: Company) => {
          const notesArray = Array.isArray(company.notes) ? company.notes : [];
          return (
            <NotesButton
              hasNotes={notesArray.length > 0}
              notesCount={notesArray.length}
              onClick={() => onOpenNotesModal(company)}
              title="View notes"
            />
          );
        },
        sortable: false,
      },
      {
        key: "name",
        header: "Name",
        className: "w-[200px]",
        render: (company: Company) => (
          <Link 
            href={`/company/${company.id}`}
            className="text-foreground hover:underline"
          >
            {company.name}
          </Link>
        ),
        sortable: true,
        sortValue: (company: Company) => company.name ?? "",
      },
      {
        key: "address",
        header: "Address",
        className: "w-[250px]",
        render: (company: Company) => (
          <span className="text-foreground">{company.address ?? "—"}</span>
        ),
        sortable: true,
        sortValue: (company: Company) => company.address ?? "",
      },
      {
        key: "type",
        header: "Type",
        className: "w-[120px]",
        render: (company: Company) => <CompanyTypeBadge type={company.type} />,
        sortable: true,
        sortValue: (company: Company) => company.type ?? "",
      },
      {
        key: "service",
        header: "Service",
        className: "w-[150px]",
        render: (company: Company) => {
          const service = services.find((s) => s.id === company.serviceId);
          if (!service) {
            return <span className="text-muted-foreground">—</span>;
          }
          return <ServiceBadge service={service} />;
        },
        sortable: true,
        sortValue: (company: Company) => {
          const service = services.find((s) => s.id === company.serviceId);
          return service?.name ?? "";
        },
      },
      {
        key: "isCustomer",
        header: "Customer",
        className: "w-[100px] text-right",
        render: (company: Company) => {
          if (company.isCustomer === null || company.isCustomer === undefined) {
            return <span className="text-muted-foreground">—</span>;
          }
          return company.isCustomer ? (
            <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30">
              <Check className="size-3" />
              Yes
            </Badge>
          ) : (
            <Badge className="gap-1 bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30">
              <X className="size-3" />
              No
            </Badge>
          );
        },
        sortable: true,
        sortValue: (company: Company) => (company.isCustomer ? "Yes" : "No"),
      },
      {
        key: "isClient",
        header: "Client",
        className: "w-[100px] text-right",
        render: (company: Company) => {
          if (company.isClient === null || company.isClient === undefined) {
            return <span className="text-muted-foreground">—</span>;
          }
          return company.isClient ? (
            <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30">
              <Check className="size-3" />
              Yes
            </Badge>
          ) : (
            <Badge className="gap-1 bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30">
              <X className="size-3" />
              No
            </Badge>
          );
        },
        sortable: true,
        sortValue: (company: Company) => (company.isClient ? "Yes" : "No"),
      },
    ];
  }, [services, onOpenNotesModal]);
}
