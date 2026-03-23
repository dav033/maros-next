"use client";

import * as React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger, SidebarRail } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/AppSidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarRail />
      <SidebarInset className="min-h-svh flex flex-col w-full">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:px-6 md:hidden">
          <SidebarTrigger className="-ml-1" />
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 w-full">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
