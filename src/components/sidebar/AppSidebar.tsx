"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/shared/auth/CurrentUserProvider";
import { NotificationBell } from "@/features/notifications/presentation/organisms/NotificationBell";
import type { Permission } from "@/shared/auth/permissions";
import { logoutAction } from "@/app/actions/auth";
import { SIDEBAR_CONFIG } from "./sidebarConfig";
import type { SidebarDropdownConfig, SidebarSection } from "./sidebarConfig";
import type { SidebarItemProps } from "./sidebarConfig";

const SIDEBAR_GROUPS_STORAGE_KEY = "maros.sidebar.openGroups";

function filterByPermission(
  items: SidebarDropdownConfig[],
  hasPermission: (permission: Permission) => boolean
): SidebarDropdownConfig[] {
  const result: SidebarDropdownConfig[] = [];
  for (const item of items) {
    if ("trigger" in item) {
      const children = filterByPermission(item.items, hasPermission);
      if (children.length > 0) result.push({ ...item, items: children });
      continue;
    }
    if (!item.permission || hasPermission(item.permission)) {
      result.push(item);
    }
  }
  return result;
}

export function AppSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, hasPermission } = useCurrentUser();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const defaults = {
      Leads: true,
      Projects: true,
    };

    if (typeof window === "undefined") {
      return defaults;
    }

    try {
      const raw = window.localStorage.getItem(SIDEBAR_GROUPS_STORAGE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      return {
        ...defaults,
        ...parsed,
      };
    } catch {
      return defaults;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(
        SIDEBAR_GROUPS_STORAGE_KEY,
        JSON.stringify(openGroups),
      );
    } catch {
      // ignore storage write errors
    }
  }, [openGroups]);

  const isActiveRoute = (href: string) => {
    const [hrefPath, hrefQuery] = href.split("?");
    const pathMatches =
      pathname === hrefPath || (hrefPath !== "/" && pathname?.startsWith(hrefPath));

    if (!pathMatches) {
      return false;
    }

    if (!hrefQuery) {
      return true;
    }

    const expectedParams = new URLSearchParams(hrefQuery);
    for (const [key, expectedValue] of expectedParams.entries()) {
      if (searchParams.get(key) !== expectedValue) {
        return false;
      }
    }

    return true;
  };

  const isActiveItem = (item: SidebarItemProps) => {
    // Checked first: when href and activePrefix are the same string (Tasks' "Board"
    // links to /tasks with activePrefix "/tasks"), isActiveRoute below already matches
    // every nested path via its own startsWith, which would make activeExclude
    // unreachable for exactly the sibling routes ("/tasks/mine") it exists to rule out.
    if ((item.activeExclude ?? []).some((prefix) => pathname?.startsWith(prefix))) {
      return false;
    }
    if (isActiveRoute(item.href)) return true;
    return Boolean(item.activePrefix && pathname?.startsWith(item.activePrefix));
  };

  const renderItems = (items: SidebarDropdownConfig[], nested = false) => {
    return items.map((item) => {
      if ("trigger" in item) {
        const TriggerIcon = item.trigger.icon;
        const groupKey = item.trigger.title;
        const isOpen = openGroups[groupKey] ?? true;

        return (
          <div key={`group-${item.trigger.title}`} className="space-y-1">
            <button
              type="button"
              onClick={() =>
                setOpenGroups((prev) => ({
                  ...prev,
                  [groupKey]: !(prev[groupKey] ?? true),
                }))
              }
              className={`flex w-full items-center gap-2 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80 group-data-[collapsible=icon]:hidden ${nested ? "pl-6" : ""}`}
            >
              {TriggerIcon ? <TriggerIcon className="h-3.5 w-3.5" /> : null}
              <span>{item.trigger.title}</span>
              <span className="ml-auto">
                {isOpen ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </span>
            </button>
            {isOpen && item.items.map((child) => {
              const childLink = child as SidebarItemProps;
              const active = isActiveRoute(childLink.href);

              return (
                <SidebarMenuItem key={childLink.title}>
                  <SidebarMenuButton asChild isActive={active}>
                    <Link
                      href={childLink.href}
                      className={nested ? "pl-7 group-data-[collapsible=icon]:pl-0" : "pl-5 text-sm group-data-[collapsible=icon]:pl-0"}
                    >
                      <span>{childLink.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </div>
        );
      }

      const linkItem = item as SidebarItemProps;
      const active = isActiveItem(linkItem);
      const Icon = linkItem.icon;

      return (
        <SidebarMenuItem key={linkItem.title}>
          <SidebarMenuButton asChild isActive={active}>
            <Link href={linkItem.href} className={nested ? "pl-6" : undefined}>
              {Icon ? <Icon className="h-4 w-4" /> : null}
              <span>{linkItem.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="h-14 justify-center px-4">
        <div className="text-xl font-semibold group-data-[collapsible=icon]:hidden" style={{ color: 'hsl(var(--sidebar-accent-foreground))' }}>{SIDEBAR_CONFIG.title || "Maros"}</div>
      </SidebarHeader>

      <SidebarContent>
        {SIDEBAR_CONFIG.top.map((entry, index) => {
          if (!("section" in entry)) return null;

          const visibleItems = filterByPermission(
            (entry as SidebarSection).items,
            hasPermission
          );
          if (visibleItems.length === 0) return null;

          return (
            <SidebarGroup key={`${entry.section}-${index}`}>
              {entry.section && <SidebarGroupLabel>{entry.section}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>{renderItems(visibleItems)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="h-auto flex-1 py-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user?.picture ?? undefined} alt={user?.name ?? user?.email} />
                  <AvatarFallback>
                    {(user?.name ?? user?.email ?? "?").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col items-start group-data-[collapsible=icon]:hidden">
                  <span className="truncate text-sm font-medium">
                    {user?.name ?? user?.email ?? "Unknown"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{user?.role?.name}</span>
                </div>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
                {user?.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => void logoutAction()}>
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="group-data-[collapsible=icon]:hidden">
            <NotificationBell />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
