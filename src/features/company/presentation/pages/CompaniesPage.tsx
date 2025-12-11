"use client";

import { useCompaniesPageLogic } from "../hooks";
import { CompaniesPageView } from "./CompaniesPageView";

export default function CompaniesPage() {
  const logic = useCompaniesPageLogic();

  return <CompaniesPageView logic={logic} />;
}
