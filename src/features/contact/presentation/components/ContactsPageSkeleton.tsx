import { ContactsTableSkeleton } from "../organisms/ContactsTableSkeleton";
import { EntityCrudPageTemplate } from "@/components/custom";

export function ContactsPageSkeleton() {
  return (
    <EntityCrudPageTemplate
      header={
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Contacts</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">Manage your contacts.</p>
        </header>
      }
      toolbar={null}
      isLoading={true}
      loadingContent={<ContactsTableSkeleton />}
      tableContent={null}
      modals={null}
    />
  );
}



