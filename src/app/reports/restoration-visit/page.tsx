"use client";

import { Suspense } from "react";
import { Spinner } from "@dav033/dav-components";
import { RestorationVisitPage } from "@/reports/presentation/pages/RestorationVisitPage";

export default function RestorationVisit() {
  return (
    <Suspense fallback={<Spinner />}>
      <RestorationVisitPage />
    </Suspense>
  );
}







