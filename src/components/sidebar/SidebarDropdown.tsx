"use client";

import type { PropsWithChildren } from "react";
import { useCallback, useLayoutEffect, useRef, useState, useEffect } from "react";
import type { SidebarDropdownProps } from "@/types";
import { Icon } from "@/shared/ui";

type Props = PropsWithChildren<{
  config: SidebarDropdownProps;
  isInitiallyOpen: boolean;
  storageKey: string;
}>;

export default function SidebarDropdown({ config, isInitiallyOpen, children, storageKey }: Props) {
  const [isOpen, setIsOpen] = useState(isInitiallyOpen);
  const [inlineHeight, setInlineHeight] = useState<string | undefined>(isInitiallyOpen ? "auto" : "0px");
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (isInitiallyOpen) {
      setIsOpen(true);
    } else {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        setIsOpen(saved === "true");
      }
    }
    setIsHydrated(true);
  }, [storageKey, isInitiallyOpen]);

  useEffect(() => {
    if (isHydrated && isInitiallyOpen) {
      setIsOpen(true);
    }
  }, [isInitiallyOpen, isHydrated]);

  useEffect(() => {
    if (isHydrated && !isInitiallyOpen) {
      localStorage.setItem(storageKey, String(isOpen));
    }
  }, [isOpen, storageKey, isHydrated, isInitiallyOpen]);

  const updateHeight = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    if (!isOpen) {
      setInlineHeight("0px");
      return;
    }
    const height = el.scrollHeight;
    setInlineHeight(`${height}px`);
  }, [isOpen]);

  useLayoutEffect(() => {
    updateHeight();
  }, [isOpen, updateHeight, children]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const { trigger } = config;

  const iconClassName = [
    "text-xl transition-transform",
    isOpen ? "rotate-180" : "rotate-0"
  ].join(" ");

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-theme-light transition-colors hover:bg-theme-gray-subtle/80"
      >
        <span className="flex items-center gap-2">
          {trigger.icon && <Icon name={trigger.icon} className="text-lg" />}
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
