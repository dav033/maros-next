"use client";

import { Badge } from "@/components/ui/badge";
import type { SimpleTableColumn } from "@/types/table";
import { Check, X } from "lucide-react";

import * as React from "react";
import type { Contact } from "@/contact";
import { ContactRoleLabels } from "@/contact/domain";
import type { Company } from "@/company";
import { NotesButton } from "@/components/shared";
import { CompanyCell } from "../../atoms/CompanyCell";

interface UseContactsTableColumnsProps {
  companies: Company[];
  onOpenCompanyModal: (company: Company) => void;
  onOpenNotesModal: (contact: Contact) => void;
}

export function useContactsTableColumns({
  companies,
  onOpenCompanyModal,
  onOpenNotesModal,
}: UseContactsTableColumnsProps): SimpleTableColumn<Contact>[] {
  return React.useMemo<SimpleTableColumn<Contact>[]>(() => {
    return [
      {
        key: "notes",
        header: "Notes",
        className: "w-[80px] text-center",
        render: (contact: Contact) => {
          const notesArray = Array.isArray(contact.notes) ? contact.notes : [];
          return (
            <NotesButton
              hasNotes={notesArray.length > 0}
              notesCount={notesArray.length}
              onClick={() => onOpenNotesModal(contact)}
              title="View notes"
            />
          );
        },
        sortable: false,
      },
      {
        key: "name",
        header: "Name",
        className: "w-[180px]",
        render: (contact: Contact) => (
          <span className="text-foreground">{contact.name}</span>
        ),
        sortable: true,
        sortValue: (contact: Contact) => contact.name ?? "",
      },
      {
        key: "company",
        header: "Company",
        className: "w-[140px]",
        render: (contact: Contact) => {
          const company = contact.company || companies.find((c) => c.id === contact.companyId);
          return (
            <CompanyCell
              company={company}
              onOpenCompanyModal={onOpenCompanyModal}
            />
          );
        },
        sortable: false,
      },
      {
        key: "phone",
        header: "Phone",
        className: "w-[180px]",
        render: (contact: Contact) => (
          <span className="text-foreground">{contact.phone ?? "—"}</span>
        ),
        sortable: true,
        sortValue: (contact: Contact) => contact.phone ?? "",
      },
      {
        key: "email",
        header: "Email",
        className: "w-[200px]",
        render: (contact: Contact) => (
          <span className="text-foreground">{contact.email ?? "—"}</span>
        ),
        sortable: true,
        sortValue: (contact: Contact) => contact.email ?? "",
      },
      {
        key: "isCustomer",
        header: "Customer",
        className: "w-[100px] text-right",
        render: (contact: Contact) => {
          if (contact.isCustomer === null || contact.isCustomer === undefined) {
            return <span className="text-muted-foreground">—</span>;
          }
          return contact.isCustomer ? (
            <Badge variant="outline" className="gap-1" style={{ borderColor: "#22c55e", color: "#22c55e" }}>
              <Check className="size-3" />
              Yes
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1" style={{ borderColor: "#6b7280", color: "#6b7280" }}>
              <X className="size-3" />
              No
            </Badge>
          );
        },
        sortable: true,
        sortValue: (contact: Contact) => (contact.isCustomer ? "Yes" : "No"),
      },
      {
        key: "isClient",
        header: "Client",
        className: "w-[100px] text-right",
        render: (contact: Contact) => {
          if (contact.isClient === null || contact.isClient === undefined) {
            return <span className="text-muted-foreground">—</span>;
          }
          return contact.isClient ? (
            <Badge variant="outline" className="gap-1" style={{ borderColor: "#22c55e", color: "#22c55e" }}>
              <Check className="size-3" />
              Yes
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1" style={{ borderColor: "#6b7280", color: "#6b7280" }}>
              <X className="size-3" />
              No
            </Badge>
          );
        },
        sortable: true,
        sortValue: (contact: Contact) => (contact.isClient ? "Yes" : "No"),
      },
    ];
  }, [companies, onOpenCompanyModal, onOpenNotesModal]);
}
