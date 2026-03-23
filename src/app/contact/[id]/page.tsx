import { Suspense } from "react";
import { ContactDetailsPage } from "@/contact/presentation/pages/ContactDetailsPage";
import { ContactDetailsPageSkeleton } from "@/contact/presentation/components/ContactDetailsPageSkeleton";
import { loadContactDetailsData } from "@/contact/presentation/data/loadContactDetailsData";

async function ContactDetailsPageWithData({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  // Manejar params como Promise o objeto directo
  const resolvedParams = params instanceof Promise ? await params : params;
  const idString = resolvedParams.id;
  
  if (!idString) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">Invalid Contact ID</h2>
          <p className="text-sm text-muted-foreground">
            No contact ID provided. Please check the URL and try again.
          </p>
        </div>
      </div>
    );
  }
  
  const contactId = parseInt(idString, 10);
  
  if (isNaN(contactId) || contactId <= 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">Invalid Contact ID</h2>
          <p className="text-sm text-muted-foreground">
            The contact ID "{idString}" is not valid. Please check the URL and try again.
          </p>
        </div>
      </div>
    );
  }
  
  const initialData = await loadContactDetailsData(contactId);
  return <ContactDetailsPage contactId={contactId} initialData={initialData} />;
}

export default async function ContactDetailsRoutePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  return (
    <Suspense fallback={<ContactDetailsPageSkeleton />}>
      <ContactDetailsPageWithData params={params} />
    </Suspense>
  );
}
