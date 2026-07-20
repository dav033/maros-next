import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  FolderKanban,
  Users,
  Building,
  UserCog,
  FileBarChart2,
  FileCheck2,
  LayoutDashboard,
  XCircle,
  CheckCircle2,
} from "lucide-react";

export type SidebarItemProps = {
  title: string;
  href: string;
  icon?: LucideIcon;
  /** Prefijo de ruta que marca el link como activo (además del href exacto). */
  activePrefix?: string;
  /** Prefijos excluidos del match de activePrefix (ej. /leads/lost). */
  activeExclude?: string[];
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

// Leads y Projects son un solo link: el cambio de tipo (construction/roofing/
// plumbing) se hace dentro de cada página con su switcher.
const menuSection: SidebarSection = {
  section: "Business",
  items: [
    {
      title: "Leads",
      href: "/leads/construction",
      icon: Briefcase,
      activePrefix: "/leads",
      activeExclude: ["/leads/lost"],
    },
    {
      title: "Lost Leads",
      href: "/leads/lost",
      icon: XCircle,
    },
    {
      title: "Projects",
      href: "/projects/construction",
      icon: FolderKanban,
      activePrefix: "/projects",
      activeExclude: ["/projects/completed", "/projects/lost"],
    },
    {
      title: "Completed Projects",
      href: "/projects/completed",
      icon: CheckCircle2,
    },
    {
      title: "Lost Projects",
      href: "/projects/lost",
      icon: XCircle,
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

// Dashboard es un solo link: el filtro por tipo de lead vive en la propia
// página (DashboardFiltersBar).
const analyticsSection: SidebarSection = {
  section: "Analytics",
  items: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
  ],
};

export const SIDEBAR_CONFIG: SidebarConfig = {
  title: "Maros Construction",
  top: [analyticsSection, menuSection, accountSection, reportsSection],
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
