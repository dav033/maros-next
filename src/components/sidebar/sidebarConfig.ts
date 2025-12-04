import type { SidebarDropdownConfig } from "@/types";

export type SidebarConfig = {
  top: SidebarDropdownConfig[];
  bottom: SidebarDropdownConfig[];
};

export const SIDEBAR_CONFIG: SidebarConfig = {
  top: [
    {
      trigger: {
        title: "Lead",
        icon: "mdi:clipboard-text-outline",
      },
      items: [
        {
          title: "Construction",
          href: "/leads/construction",
          icon: "mdi:tools",
        },
        {
          title: "Plumbing",
          href: "/leads/plumbing",
          icon: "mdi:pipe-wrench",
        },
        {
          title: "Roofing",
          href: "/leads/roofing",
          icon: "material-symbols:roofing-outline",
        },
      ],
    },
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
  bottom: [],
};

/**
 * Extracts all main navigation pages from the sidebar configuration.
 * Useful for generating lists of available pages.
 */
export function getMainPages() {
  const pages: Array<{ title: string; href: string; icon?: string }> = [];
  
  function extractPages(items: SidebarDropdownConfig[]) {
    for (const item of items) {
      if ("trigger" in item) {
        // It's a dropdown, extract its items
        extractPages(item.items);
      } else {
        // It's a direct link
        pages.push({
          title: item.title,
          href: item.href,
          icon: item.icon,
        });
      }
    }
  }

  extractPages(SIDEBAR_CONFIG.top);
  extractPages(SIDEBAR_CONFIG.bottom);
  
  return pages;
}

/**
 * Gets all available route patterns from the sidebar configuration.
 * Useful for generating static paths or validating routes.
 */
export function getAllRoutes(): string[] {
  return getMainPages().map(page => page.href);
}