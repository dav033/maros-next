"use client";

import { usePathname } from "next/navigation";

export function useSidebarNavigation() {
  const currentPath = usePathname() ?? "/";

  const normalize = (path: string) => {
    if (!path) return "/";
    if (path === "/") return "/";
    return path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;
  };

  const normalizedCurrent = normalize(currentPath);

  const isActive = (href: string) => {
    const normalizedHref = normalize(href);
    if (normalizedHref === "/") {
      return normalizedCurrent === "/";
    }
    return normalizedCurrent === normalizedHref || normalizedCurrent.startsWith(normalizedHref + "/");
  };

  const shouldBeOpen = (sectionBasePath: string) => {
    if (!sectionBasePath) return false;
    if (sectionBasePath === "/") {
      return isActive("/");
    }
    const normalizedSection = normalize(sectionBasePath);
    return normalizedCurrent === normalizedSection || normalizedCurrent.startsWith(normalizedSection + "/");
  };

  return {
    currentPath,
    isActive,
    shouldBeOpen,
  };
}
