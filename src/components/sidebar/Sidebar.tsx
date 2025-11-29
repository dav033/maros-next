"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import type { SidebarDropdownConfig, SidebarItemProps as SidebarItemConfig } from "@/types";
import SidebarDropdown from "./SidebarDropdown";
import SidebarItem from "./SidebarItem";
import { useSidebarNavigation } from "@/hooks/useSidebarNavigation";
import { useSidebar } from "./SidebarContext";

type SidebarConfig = {
  top: SidebarDropdownConfig[];
  bottom: SidebarDropdownConfig[];
};

const SIDEBAR_CONFIG: SidebarConfig = {
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

function renderSidebarItems(
  items: SidebarDropdownConfig[],
  isActive: (href: string) => boolean,
  shouldBeOpen: (sectionBasePath: string) => boolean,
  depth = 0
): ReactNode {
  return items.map((item: SidebarDropdownConfig, index: number) => {
    if ("trigger" in item) {
      const sectionBasePath = item.items.length > 0 && "href" in item.items[0]
        ? (item.items[0] as SidebarItemConfig).href.split("/").slice(0, 2).join("/")
        : "";
      
      const isCurrentlyOpen = shouldBeOpen(sectionBasePath);
      const storageKey = `sidebar-dropdown-${item.trigger.title.toLowerCase().replace(/\s+/g, "-")}`;
      
      return (
        <SidebarDropdown
          key={`${item.trigger.title}-${index}`}
          config={item}
          isInitiallyOpen={isCurrentlyOpen}
          storageKey={storageKey}
        >
          {renderSidebarItems(item.items, isActive, shouldBeOpen, depth + 1)}
        </SidebarDropdown>
      );
    }

    const linkItem = item as SidebarItemConfig;

    return (
      <SidebarItem
        key={`${linkItem.title}-${index}`}
        item={linkItem}
        depth={depth}
        isActive={isActive}
      />
    );
  });
}

export default function Sidebar() {
  const { isActive, shouldBeOpen } = useSidebarNavigation();
  const { isOpen, close } = useSidebar();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isOpen) {
        close();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, close]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 flex w-80 flex-col border-r border-gray-800 bg-gray-900 px-4 py-6 transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:z-20",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <nav className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-1 overflow-auto pr-1 pt-12 lg:pt-0">
            {renderSidebarItems(SIDEBAR_CONFIG.top, isActive, shouldBeOpen)}
          </div>
        </nav>
      </aside>
    </>
  );
}
