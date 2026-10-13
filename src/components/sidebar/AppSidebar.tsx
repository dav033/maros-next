"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, LogOut } from "lucide-react";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/shared/presentation/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";
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
  useSidebar,
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
import { sharedEntityNameTransition } from "@/shared/presentation/motionTransitions";

const SIDEBAR_GROUPS_STORAGE_KEY = "maros.sidebar.openGroups";
const SIDEBAR_ACCOUNT_MENU_TRIGGER_ID = "maros-sidebar-account-menu-trigger";
const SIDEBAR_ACCOUNT_MENU_CONTENT_ID = "maros-sidebar-account-menu-content";

function SidebarNavLink({
  item,
  active,
  nested,
  grouped,
  layoutId,
  shouldReduceMotion,
  onNavigate,
}: {
  item: SidebarItemProps;
  active: boolean;
  nested: boolean;
  grouped: boolean;
  layoutId: string;
  shouldReduceMotion: boolean;
  onNavigate: () => void;
}) {
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        className="relative isolate data-[active=true]:!bg-transparent motion-reduce:transition-none"
      >
        <Link
          href={item.href}
          onNavigate={onNavigate}
          aria-current={active ? "page" : undefined}
          className={cn(
            "relative",
            grouped && (nested ? "pl-7 group-data-[collapsible=icon]:pl-0" : "pl-5 text-sm group-data-[collapsible=icon]:pl-0"),
          )}
        >
          {active ? (
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 z-0 rounded-md bg-sidebar-accent before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full before:bg-sidebar-primary"
              layoutId={shouldReduceMotion ? undefined : layoutId}
              transition={sharedEntityNameTransition}
              initial={false}
            />
          ) : null}
          {Icon ? <Icon className="relative z-10 h-4 w-4" /> : null}
          <span className="relative z-10">{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

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
  const shouldReduceMotion = usePrefersReducedMotion();
  const sidebarIndicatorId = useId();
  const { isMobile, setOpenMobile } = useSidebar();
  const { user, hasPermission } = useCurrentUser();
  const previousPathname = useRef(pathname);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Leads: true,
    Projects: true,
  });
  const [hasLoadedOpenGroups, setHasLoadedOpenGroups] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const closeMobileSidebar = useCallback(() => {
    if (isMobile) setOpenMobile(false);
  }, [isMobile, setOpenMobile]);

  useLayoutEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    closeMobileSidebar();
  }, [closeMobileSidebar, pathname]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SIDEBAR_GROUPS_STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
          const savedGroups = Object.fromEntries(
            Object.entries(parsed).filter((entry): entry is [string, boolean] => typeof entry[1] === "boolean"),
          );
          setOpenGroups((current) => ({ ...current, ...savedGroups }));
        }
      }
    } catch {
      // Keep the defaults when local storage is unavailable or malformed.
    } finally {
      setHasLoadedOpenGroups(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedOpenGroups) return;
    try {
      window.localStorage.setItem(
        SIDEBAR_GROUPS_STORAGE_KEY,
        JSON.stringify(openGroups),
      );
    } catch {
      // ignore storage write errors
    }
  }, [hasLoadedOpenGroups, openGroups]);

  const matchesPathPrefix = (prefix: string) =>
    Boolean(pathname && (pathname === prefix || pathname.startsWith(`${prefix}/`)));

  const isActiveRoute = (href: string) => matchesPathPrefix(href);

  const isActiveItem = (item: SidebarItemProps) => {
    // Checked first: when href and activePrefix are the same string (Tasks' "Board"
    // links to /tasks with activePrefix "/tasks"), isActiveRoute below already matches
    // every nested path via its own startsWith, which would make activeExclude
    // unreachable for exactly the sibling routes ("/tasks/mine") it exists to rule out.
    if ((item.activeExclude ?? []).some(matchesPathPrefix)) {
      return false;
    }
    if (isActiveRoute(item.href)) return true;
    const activePrefixes = [item.activePrefix, ...(item.activePrefixes ?? [])];
    return activePrefixes.some((prefix) => prefix && matchesPathPrefix(prefix));
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
                <SidebarNavLink
                  key={childLink.title}
                  item={childLink}
                  active={active}
                  nested={nested}
                  grouped
                  layoutId={sidebarIndicatorId}
                  shouldReduceMotion={shouldReduceMotion ?? false}
                  onNavigate={closeMobileSidebar}
                />
              );
            })}
          </div>
        );
      }

      const linkItem = item as SidebarItemProps;
      const active = isActiveItem(linkItem);

      return (
        <SidebarNavLink
          key={linkItem.title}
          item={linkItem}
          active={active}
          nested={nested}
          grouped={false}
          layoutId={sidebarIndicatorId}
          shouldReduceMotion={shouldReduceMotion ?? false}
          onNavigate={closeMobileSidebar}
        />
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
          <DropdownMenu open={accountMenuOpen} onOpenChange={setAccountMenuOpen}>
            <DropdownMenuTrigger
              asChild
              id={SIDEBAR_ACCOUNT_MENU_TRIGGER_ID}
              aria-controls={accountMenuOpen ? SIDEBAR_ACCOUNT_MENU_CONTENT_ID : undefined}
            >
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
            <DropdownMenuContent
              id={SIDEBAR_ACCOUNT_MENU_CONTENT_ID}
              aria-labelledby={SIDEBAR_ACCOUNT_MENU_TRIGGER_ID}
              side="top"
              align="start"
              className="w-56"
            >
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
            <NotificationBell instance="sidebar" />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
