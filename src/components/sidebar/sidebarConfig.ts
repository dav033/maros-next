import type { SidebarConfig, SidebarDropdownConfig, SidebarSection } from "@dav033/dav-components";

const menuSection: SidebarSection = {
  section: "Business",
  items: [
    {
      title: "Leads",
      href: "/leads",
      icon: "mdi:briefcase-outline",
    },
    {
      title: "Projects",
      href: "/projects",
      icon: "mdi:folder-multiple-outline",
    },
  ],
};

const accountSection: SidebarSection = {
  section: "Account",
  items: [
    {
      title: "Contacts",
      href: "/contacts",
      icon: "mdi:account-multiple-outline",
    },
    {
      title: "Company",
      href: "/company",
      icon: "mdi:office-building-outline",
    },
    {
      title: "Customers",
      href: "/customers",
      icon: "mdi:account-group-outline",
    },
  ],
};

const reportsSection: SidebarSection = {
  section: "Reports",
  items: [
    {
      title: "Restoration Visit",
      href: "/reports/restoration-visit",
      icon: "mdi:file-chart-outline",
    },
    {
      title: "Restoration Final",
      href: "/reports/restoration-final",
      icon: "mdi:file-check-outline",
    },
  ],
};

export const SIDEBAR_CONFIG: SidebarConfig = {
  title: "Maros Construction",
  top: [menuSection, accountSection, reportsSection],
  bottom: [],
};

export function getMainPages() {
  const pages: Array<{ title: string; href: string; icon?: string }> = [];

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