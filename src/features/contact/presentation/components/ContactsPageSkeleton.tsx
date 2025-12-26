import { ContactsTableSkeleton } from "../organisms/ContactsTableSkeleton";
import { EntityCrudPageTemplate, SimplePageHeader } from "@dav033/dav-components";

export function ContactsPageSkeleton() {
  return (
    <EntityCrudPageTemplate
      header={
        <SimplePageHeader
          title="Contacts"
          description="Manage your contacts."
        />
      }
      toolbar={null}
      isLoading={true}
      loadingContent={<ContactsTableSkeleton />}
      tableContent={null}
      modals={null}
    />
  );
}



