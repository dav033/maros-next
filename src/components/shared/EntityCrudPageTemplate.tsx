"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface EntityCrudPageTemplateProps {
  header: ReactNode;
  toolbar?: ReactNode;
  isLoading: boolean;
  loadingContent: ReactNode;
  isEmpty?: boolean;
  emptyContent?: ReactNode;
  tableContent: ReactNode;
  modals?: ReactNode;
  className?: string;
}

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
    <div
      className={cn(
        "flex w-full flex-1 flex-col gap-3 sm:gap-4",
        className
      )}
    >
      {header}
      {toolbar}
      <section className="dashboard-section-enter mt-2 flex flex-1 flex-col" style={{ animationDelay: "120ms" }}>
        {isLoading ? loadingContent : (isEmpty && emptyContent) ? emptyContent : tableContent}
      </section>
      {modals}
    </div>
  );
}
