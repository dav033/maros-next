"use client";

import type { PropsWithChildren } from "react";
import type { SidebarDropdownProps } from "@/types";
import { Icon, usePersistentToggle, useAnimatedHeight, ICON_SIZES, cx } from "@/shared/ui";

type Props = PropsWithChildren<{
  config: SidebarDropdownProps;
  isInitiallyOpen: boolean;
  storageKey: string;
}>;

export default function SidebarDropdown({ config, isInitiallyOpen, children, storageKey }: Props) {
  // Use persistent toggle hook for state management
  const { isOpen, toggle } = usePersistentToggle({
    storageKey,
    initialValue: isInitiallyOpen,
  });

  // Use animated height hook for smooth transitions
  const { contentRef, inlineHeight, updateHeight } = useAnimatedHeight({
    isOpen,
    dependencies: [children],
  });

  const { trigger } = config;

  const iconClassName = cx(
    "text-xl transition-transform",
    isOpen ? "rotate-180" : "rotate-0"
  );

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-theme-light transition-colors hover:bg-theme-gray-subtle/80"
      >
        <span className="flex items-center gap-2">
          {trigger.icon && <Icon name={trigger.icon} size={ICON_SIZES.lg} />}
          <span>{trigger.title}</span>
        </span>
        <Icon
          name="material-symbols:arrow-drop-down"
          className={iconClassName}
        />
      </button>

      <div
        ref={contentRef}
        className="overflow-hidden transition-[height] duration-200 ease-out"
        style={{ height: inlineHeight }}
      >
        <ul className="mt-1 space-y-1 pl-6">{children}</ul>
      </div>
    </div>
  );
}
