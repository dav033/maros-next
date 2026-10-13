import { Suspense } from "react";
import { ContactsPage } from "@/contact";
import { ContactsPageSkeleton } from "@/contact/presentation/components/ContactsPageSkeleton";

export default function ContactsRoutePage() {
  return (
    <Suspense fallback={<ContactsPageSkeleton />}>
      <ContactsPage />
    </Suspense>
  );
}
