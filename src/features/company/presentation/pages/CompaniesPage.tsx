"use client";

import { useCompaniesPageLogic } from "../hooks";
import { CompaniesPageView } from "./CompaniesPageView";
import type { CompaniesPageData } from "../data/loadCompaniesData";

export interface CompaniesPageProps {
  initialData?: CompaniesPageData;
}

export default function CompaniesPage({ initialData }: CompaniesPageProps = {}) {
  const logic = useCompaniesPageLogic(initialData);

  return <CompaniesPageView logic={logic} />;
}
