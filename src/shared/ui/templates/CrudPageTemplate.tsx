"use client";

import type { ReactNode } from "react";

export interface CrudPageTemplateProps {
  header: ReactNode;
  actions?: ReactNode;
  toolbar?: ReactNode;
  content: ReactNode;
  modals?: ReactNode;
}

/**
 * CrudPageTemplate - Template (Atomic Design)
 * 
 * Estructura de página CRUD pura sin lógica de negocio.
 * Solo define layout y slots para organismos.
 */
export function CrudPageTemplate({
  header,
  actions,
  toolbar,
  content,
  modals,
}: CrudPageTemplateProps) {
  return (
    <main className="flex min-h-[calc(100vh-80px)] w-full flex-col gap-3 bg-theme-dark px-3 py-3 pt-16 sm:gap-4 sm:px-4 sm:py-4 md:px-8 md:py-6 lg:pt-6">
      {header}

      {actions && (
        <div className="flex items-center justify-end gap-2">
          {actions}
        </div>
      )}

      {toolbar}

      <section className="mt-2 flex flex-1 flex-col">
        {content}
      </section>

      {modals}
    </main>
  );
}
