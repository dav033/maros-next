"use client";

import { Suspense } from "react";
import { LeadsInReviewPageClient } from "./LeadsInReviewPageClient";

export default function LeadsInReviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LeadsInReviewPageClient />
    </Suspense>
  );
}
