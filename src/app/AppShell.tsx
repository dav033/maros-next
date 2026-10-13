"use client";

import * as React from "react";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import { LayoutGroup, motion } from "motion/react";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { NotificationBell } from "@/features/notifications/presentation/organisms/NotificationBell";
import { PwaRegistration } from "./PwaRegistration";
import { GlobalCommandPalette } from "./GlobalCommandPalette";
import { RouteTransition } from "./RouteTransition";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // /login has no session yet; /p/<token> is a published note read by someone who has
  // no account at all. Neither should be wrapped in the CRM's navigation.
  if (
    pathname === "/login" ||
    pathname === "/about" ||
    pathname === "/privacy-policy" ||
    pathname.startsWith("/p/")
  ) {
    return <>{children}</>;
  }

  return (
    <>
      <PwaRegistration />
      {/* Shared layout IDs span route layers and Radix portals. */}
      <LayoutGroup id="maros-app">
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <SidebarRail />
          {/* min-w-0: this is a flex child of SidebarProvider's row, where the default
            `min-width: auto` lets it grow to fit its widest descendant. A table wider
            than the viewport would stretch the whole page and drag the header and each
            page's toolbar sideways with it; pinning the minimum keeps that scrolling
            inside the table's own container. */}
          <SidebarInset className="min-h-svh flex min-w-0 flex-col w-full">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:px-6">
              <SidebarTrigger className="-ml-1" />
              <div className="min-w-0 flex-1 md:max-w-md">
                <Suspense fallback={null}>
                  <GlobalCommandPalette />
                </Suspense>
              </div>
              <div className="ml-auto md:hidden">
                <NotificationBell instance="header" />
              </div>
            </header>
            <motion.main tabIndex={-1} layoutScroll data-app-route-scroll className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 w-full">
              <RouteTransition pathname={pathname ?? ""}>{children}</RouteTransition>
            </motion.main>
          </SidebarInset>
        </SidebarProvider>
      </LayoutGroup>
    </>
  );
}
