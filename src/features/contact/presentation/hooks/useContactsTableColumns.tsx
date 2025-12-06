"use client";

import * as React from "react";
import type { Contact } from "@/contact";
import { ContactRoleLabels } from "@/contact/domain";
import type { Company } from "@/company";
import type { SimpleTableColumn } from "@/shared/ui";
import { StatusBadge } from "@/shared/ui";
import { NotesButton } from "@/shared/ui/molecules/NotesButton";
import { CompanyCell } from "../atoms/CompanyCell";

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
          <span className="text-theme-light">{contact.name}</span>
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
        key: "role",
        header: "Role",
        className: "w-[200px]",
        render: (contact: Contact) => (
          <span className="text-gray-300">
            {contact.role ? ContactRoleLabels[contact.role] : "—"}
          </span>
        ),
        sortable: true,
        sortValue: (contact: Contact) => contact.role ? ContactRoleLabels[contact.role] : "",
      },
      {
        key: "occupation",
        header: "Custom Occupation",
        className: "w-[150px]",
        render: (contact: Contact) => (
          <span className="text-gray-300">{contact.occupation ?? "—"}</span>
        ),
        sortable: true,
        sortValue: (contact: Contact) => contact.occupation ?? "",
      },
      {
        key: "phone",
        header: "Phone",
        className: "w-[180px]",
        render: (contact: Contact) => (
          <span className="text-gray-300">{contact.phone ?? "—"}</span>
        ),
        sortable: true,
        sortValue: (contact: Contact) => contact.phone ?? "",
      },
      {
        key: "email",
        header: "Email",
        className: "w-[200px]",
        render: (contact: Contact) => (
          <span className="text-gray-300">{contact.email ?? "—"}</span>
        ),
        sortable: true,
        sortValue: (contact: Contact) => contact.email ?? "",
      },
      {
        key: "isCustomer",
        header: "Customer",
        className: "w-[100px] text-right",
        render: (contact: Contact) => (
          <StatusBadge status={contact.isCustomer} />
        ),
        sortable: true,
        sortValue: (contact: Contact) => (contact.isCustomer ? "Yes" : "No"),
      },
      {
        key: "isClient",
        header: "Client",
        className: "w-[100px] text-right",
        render: (contact: Contact) => <StatusBadge status={contact.isClient} />,
        sortable: true,
        sortValue: (contact: Contact) => (contact.isClient ? "Yes" : "No"),
      },
    ];
  }, [companies, onOpenCompanyModal, onOpenNotesModal]);
}
