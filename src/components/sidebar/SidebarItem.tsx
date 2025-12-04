"use client";

import Link from "next/link";
import type { SidebarItemProps as SidebarItemConfig } from "@/types";
import { Icon, cx } from "@/shared/ui";
import { useSidebar } from "./SidebarContext";

type Props = {
  item: SidebarItemConfig;
  depth?: number;
  isActive: (href: string) => boolean;
};

export default function SidebarItem({ item, depth = 0, isActive }: Props) {
  const { title, href, icon } = item;
  const { close } = useSidebar();

  const active = isActive(href);
  const basePadding = depth === 0 ? "pl-3" : depth === 1 ? "pl-5" : "pl-7";

  const className = cx(
    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
    basePadding,
    active
      ? "bg-theme-gray-subtle text-theme-light"
      : "text-theme-light hover:bg-theme-gray-subtle/80"
  );

  const handleClick = () => {
    if (window.innerWidth < 1024) {
      close();
    }
  };

  return (
    <li className="w-full">
      <Link href={href} className={className} onClick={handleClick}>
        {icon && <Icon name={icon} className="text-lg" />}
        <span>{title}</span>
      </Link>
    </li>
  );
}
