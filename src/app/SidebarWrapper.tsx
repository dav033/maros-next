"use client";

import { AppSidebar } from "@/components/app/AppSidebar";
import { SIDEBAR_CONFIG } from "@/components/sidebar/sidebarConfig";

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh w-full">
      <aside className="sticky top-0 h-svh w-64 border-r bg-background">
        <AppSidebar config={SIDEBAR_CONFIG} />
      </aside>
      <main className="flex-1 overflow-auto p-4 lg:p-6">
        {children}
      </main>
    </div>
  );
}
