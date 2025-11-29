"use client";

import { Icon } from "@/shared/ui";
import { useSidebar } from "./SidebarContext";

export function MobileMenuButton() {
  const { toggle, isOpen } = useSidebar();

  return (
    <button
      type="button"
      onClick={toggle}
      className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800/60 backdrop-blur-sm text-theme-light shadow-lg transition-all hover:bg-gray-700/70 active:scale-95 lg:hidden"
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      <Icon name={isOpen ? "lucide:x" : "lucide:menu"} size={24} />
    </button>
  );
}
