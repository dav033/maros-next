import { Suspense } from "react";
import { ContactDetailsRoute } from "@/contact/presentation/pages/ContactDetailsRoute";
import { ContactDetailsPageSkeleton } from "@/contact/presentation/components/ContactDetailsPageSkeleton";
import { parsePositiveSafeInteger } from "@/shared/utils/parsePositiveSafeInteger";

async function ContactDetailsPageWithData({ params }: { params: Promise<{ id: string }> }) {
  // Manejar params como Promise o objeto directo
  const resolvedParams = await params;
  const idString = resolvedParams.id;
  
  if (!idString) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
          <h2 className="font-display text-lg font-semibold text-destructive mb-2">Invalid Contact ID</h2>
          <p className="text-sm text-muted-foreground">
            No contact ID provided. Please check the URL and try again.
          </p>
        </div>
      </div>
    );
  }
  
  const contactId = parsePositiveSafeInteger(idString);
  
  if (contactId === null) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
          <h2 className="font-display text-lg font-semibold text-destructive mb-2">Invalid Contact ID</h2>
          <p className="text-sm text-muted-foreground">
            The contact ID "{idString}" is not valid. Please check the URL and try again.
          </p>
        </div>
      </div>
    );
  }
  
  return <ContactDetailsRoute contactId={contactId} />;
}

export default async function ContactDetailsRoutePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<ContactDetailsPageSkeleton />}>
      <ContactDetailsPageWithData params={params} />
    </Suspense>
  );
}
