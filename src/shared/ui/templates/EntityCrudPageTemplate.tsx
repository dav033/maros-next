"use client";

import type { ReactNode } from "react";

export interface EntityCrudPageTemplateProps {
  header: ReactNode;
  toolbar?: ReactNode;
  isLoading: boolean;
  loadingContent: ReactNode;
  isEmpty: boolean;
  emptyContent: ReactNode;
  tableContent: ReactNode;
  modals?: ReactNode;
  className?: string;
}

/**
 * Generic template for entity CRUD pages.
 * Provides consistent layout: header → toolbar → content area → modals.
 * Reduces boilerplate and ensures UI consistency across pages.
 */
export function EntityCrudPageTemplate({
  header,
  toolbar,
  isLoading,
  loadingContent,
  isEmpty,
  emptyContent,
  tableContent,
  modals,
  className = "",
}: EntityCrudPageTemplateProps) {
  return (
    <main
      className={`flex min-h-[calc(100vh-80px)] w-full flex-col gap-3 bg-theme-dark px-3 py-3 pt-16 sm:gap-4 sm:px-4 sm:py-4 md:px-8 md:py-6 lg:pt-6 ${className}`}
    >
      {header}
      {toolbar}
      <section className="mt-2 flex flex-1 flex-col">
        {isLoading ? loadingContent : isEmpty ? emptyContent : tableContent}
      </section>
      {modals}
    </main>
  );
}
