"use client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { DiProvider } from "@/di";
import { Toaster } from "@/components/ui/sonner";
import { createQueryClient } from "@/shared/lib/queryClient";

type Props = {
  children: ReactNode;
};

export function AppProviders({ children }: Props) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <DiProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            className: "bg-card border-border text-foreground",
            duration: 4000,
          }}
          richColors
        />
      </DiProvider>
    </QueryClientProvider>
  );
}
