"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SIDEBAR_CONFIG } from "./sidebarConfig";

export function AppSidebar() {
  const pathname = usePathname();

  // Transformar la estructura del config para renderizar secciones
  const sections = SIDEBAR_CONFIG.top.map((entry) => {
    if ("section" in entry) {
      const items = entry.items
        .filter((item): item is { title: string; href: string; icon?: import("lucide-react").LucideIcon } => {
          return !("trigger" in item);
        })
        .map((item) => ({
          title: item.title,
          href: item.href,
          icon: item.icon,
        }));
      return {
        title: entry.section,
        items,
      };
    }
    return {
      title: "",
      items: [],
    };
  });

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="h-14 justify-center px-4">
        <div className="text-xl font-semibold group-data-[collapsible=icon]:hidden" style={{ color: 'hsl(var(--sidebar-accent-foreground))' }}>{SIDEBAR_CONFIG.title || "Maros"}</div>
      </SidebarHeader>

      <SidebarContent>
        {sections.map((section) => (
          <SidebarGroup key={section.title}>
            {section.title && <SidebarGroupLabel>{section.title}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/" && pathname?.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={active}>
                        <Link href={item.href}>
                          {Icon ? <Icon className="h-4 w-4" /> : null}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
