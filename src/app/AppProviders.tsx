"use client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { DiProvider } from "@/di";
import { ToastProvider } from "@/shared/ui";
import { createQueryClient } from "@/shared/lib/queryClient";

type Props = {
  children: ReactNode;
};

export function AppProviders({ children }: Props) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <DiProvider>
        <ToastProvider>{children}</ToastProvider>
      </DiProvider>
    </QueryClientProvider>
  );
}
