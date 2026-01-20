import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  ClipboardList,
  FolderKanban,
  Users,
  Building,
  UserCog,
  FileBarChart2,
  FileCheck2,
} from "lucide-react";

export type SidebarItemProps = {
  title: string;
  href: string;
  icon?: LucideIcon;
};

export type SidebarDropdownProps = {
  trigger: {
    title: string;
    icon?: LucideIcon;
  };
  items: SidebarDropdownConfig[];
};

export type SidebarDropdownConfig = SidebarItemProps | SidebarDropdownProps;

export type SidebarSection = {
  section: string;
  items: SidebarDropdownConfig[];
};

export type SidebarConfig = {
  top: Array<SidebarDropdownConfig | SidebarSection>;
  bottom?: Array<SidebarDropdownConfig | SidebarSection>;
  title?: string;
};

const menuSection: SidebarSection = {
  section: "Business",
  items: [
    {
      title: "Leads",
      href: "/leads",
      icon: Briefcase,
    },
    {
      title: "Leads in Review",
      href: "/review/leads",
      icon: ClipboardList,
    },
    {
      title: "Projects",
      href: "/projects",
      icon: FolderKanban,
    },
  ],
};

const accountSection: SidebarSection = {
  section: "Account",
  items: [
    {
      title: "Contacts",
      href: "/contacts",
      icon: Users,
    },
    {
      title: "Company",
      href: "/company",
      icon: Building,
    },
    {
      title: "Customers",
      href: "/customers",
      icon: UserCog,
    },
  ],
};

const reportsSection: SidebarSection = {
  section: "Reports",
  items: [
    {
      title: "Restoration Visit",
      href: "/reports/restoration-visit",
      icon: FileBarChart2,
    },
    {
      title: "Restoration Final",
      href: "/reports/restoration-final",
      icon: FileCheck2,
    },
  ],
};

export const SIDEBAR_CONFIG: SidebarConfig = {
  title: "Maros Construction",
  top: [menuSection, accountSection, reportsSection],
  bottom: [],
};

export function getMainPages() {
  const pages: Array<{ title: string; href: string; icon?: LucideIcon }> = [];

  const extractPages = (entries: Array<SidebarDropdownConfig | SidebarSection>) => {
    for (const entry of entries) {
      if ("section" in entry) {
        extractPages(entry.items);
        continue;
      }
      if ("trigger" in entry) {
        extractPages(entry.items);
      } else {
        pages.push({
          title: entry.title,
          href: entry.href,
          icon: entry.icon,
        });
      }
    }
  };

  extractPages(SIDEBAR_CONFIG.top);
  if (SIDEBAR_CONFIG.bottom) {
    extractPages(SIDEBAR_CONFIG.bottom);
  }

  return pages;
}

export function getAllRoutes(): string[] {
  return getMainPages().map((page) => page.href);
}