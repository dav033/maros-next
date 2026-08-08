"use client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { DiProvider } from "@/di";
import { createQueryClient } from "@/shared/lib/queryClient";
import { GlobalAuthHandler } from "@/shared/auth/GlobalAuthHandler";
import { CurrentUserProvider } from "@/shared/auth/CurrentUserProvider";
import type { CurrentUser } from "@/shared/auth/currentUser";

type Props = {
  currentUser: CurrentUser | null;
  children: ReactNode;
};

export function AppProviders({ currentUser, children }: Props) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <CurrentUserProvider user={currentUser}>
        <DiProvider>
          <GlobalAuthHandler />
          {children}
        </DiProvider>
      </CurrentUserProvider>
    </QueryClientProvider>
  );
}
