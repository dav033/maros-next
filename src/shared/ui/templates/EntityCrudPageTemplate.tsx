"use client";

import type { ReactNode } from "react";

export interface EntityCrudPageTemplateProps {
  /**
   * Page header section (title + description + optional actions)
   */
  header: ReactNode;

  /**
   * Toolbar section (search + filters + actions)
   */
  toolbar?: ReactNode;

  /**
   * Loading state content (skeleton)
   */
  isLoading: boolean;
  loadingContent: ReactNode;

  /**
   * Empty state content (when no data)
   */
  isEmpty: boolean;
  emptyContent: ReactNode;

  /**
   * Main table/list content
   */
  tableContent: ReactNode;

  /**
   * Modals and overlays (create/edit/delete/related entities)
   */
  modals?: ReactNode;

  /**
   * Optional additional className for main container
   */
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
      {/* Page Header */}
      {header}

      {/* Toolbar (search, filters, actions) */}
      {toolbar}

      {/* Content Area */}
      <section className="mt-2 flex flex-1 flex-col">
        {isLoading ? loadingContent : isEmpty ? emptyContent : tableContent}
      </section>

      {/* Modals */}
      {modals}
    </main>
  );
}
