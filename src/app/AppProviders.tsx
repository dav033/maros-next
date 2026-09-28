"use client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
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
    // Dark is the default and the only palette so far; the light one lands in a
    // later step, so the OS preference stays out of it for now.
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <CurrentUserProvider user={currentUser}>
          <DiProvider>
            <GlobalAuthHandler />
            {children}
          </DiProvider>
        </CurrentUserProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
