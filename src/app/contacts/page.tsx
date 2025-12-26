import { Suspense } from "react";
import { ContactsPage } from "@/contact";
import { ContactsPageSkeleton } from "@/contact/presentation/components/ContactsPageSkeleton";
import { loadContactsData } from "@/contact/presentation/data/loadContactsData";

async function ContactsPageWithData() {
  const initialData = await loadContactsData();
  return <ContactsPage initialData={initialData} />;
}

export default function ContactsRoutePage() {
  return (
    <Suspense fallback={<ContactsPageSkeleton />}>
      <ContactsPageWithData />
    </Suspense>
  );
}
