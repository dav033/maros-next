"use client";




import { Loader } from "lucide-react";
import { Suspense } from "react";

import { RestorationVisitPage } from "@/reports/presentation/pages/RestorationVisitPage";

export default function RestorationVisit() {
  return (
    <Suspense fallback={<Loader className="size-6 animate-spin text-primary" />}>
      <RestorationVisitPage />
    </Suspense>
  );
}







