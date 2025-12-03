import * as React from "react";
import { createPortal } from "react-dom";

import type { ContextMenuOption, ContextMenuPosition } from "@/types/hooks/context-menu";
import { Icon } from "@/shared/ui";

export type ContextMenuProps = Readonly<{
  options: ContextMenuOption[];
  isOpen: boolean;
  position: ContextMenuPosition;
  onClose: () => void;
}>;

function getVariantClasses(danger?: boolean) {
  return danger
    ? "text-red-400 hover:bg-red-500/10"
    : "hover:bg-white/[0.06] focus:bg-white/[0.06]";
}

const ContextMenuComponent: React.FC<ContextMenuProps> = ({
  options,
  isOpen,
  position,
  onClose,
}) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [computedPos, setComputedPos] = React.useState<ContextMenuPosition>(position);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest?.("[data-context-menu]")) {
        onClose();
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest?.("[data-context-menu]")) {
        event.preventDefault();
        onClose();
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleDown);
    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleDown);
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  // Mount flag for portal-based transition safety
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Smart positioning to keep menu within viewport
  React.useEffect(() => {
    if (!isOpen) return;
    const el = ref.current;
    // Delay to allow layout
    requestAnimationFrame(() => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const width = el?.offsetWidth ?? 0;
      const height = el?.offsetHeight ?? 0;
      let x = position.x;
      let y = position.y;
      const padding = 8;

      if (x + width + padding > vw) x = Math.max(padding, vw - width - padding);
      if (y + height + padding > vh) y = Math.max(padding, vh - height - padding);
      setComputedPos({ x, y });
    });
  }, [isOpen, position.x, position.y]);

  if (!isOpen) return null;

  const renderIcon = (icon?: React.ReactNode | string) => {
    if (!icon) return null;
    if (typeof icon === "string") {
      return <Icon name={icon} className="mr-2 text-gray-400 group-hover:text-white transition-colors" size={14} />;
    }
    return <span className="mr-2 text-gray-400 group-hover:text-white transition-colors">{icon}</span>;
  };

  const menu = (
    <div
      ref={ref}
      data-context-menu
      className="context-menu-enter fixed z-50 min-w-[180px] rounded-lg border border-white/15 bg-[#1c2128] backdrop-blur-sm text-theme-light shadow-lg py-1 overflow-hidden"
      style={{ 
        left: computedPos.x, 
        top: computedPos.y,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)'
      }}
      role="menu"
      aria-label="Context menu"
    >
      <ul className="m-0 flex list-none flex-col p-1">
        {options.map((option, index) =>
          option.separator ? (
            <li
              key={option.id || `separator-${index}`}
              className="my-0.5 border-t border-white/6 opacity-50"
              aria-hidden="true"
            />
          ) : (
            <li key={option.id || index}>
              <button
                type="button"
                disabled={option.disabled}
                onClick={() => {
                  if (!option.disabled) {
                    option.action();
                  }
                }}
                className={[
                  "group flex w-full items-center justify-between rounded px-2.5 py-1.5 text-[13px] border border-transparent",
                  "text-theme-light/90 transition-colors duration-100",
                  option.disabled
                    ? "cursor-not-allowed opacity-50"
                    : getVariantClasses(option.danger),
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="flex items-center">
                  {renderIcon(option.icon)}
                  <span className="text-gray-400 group-hover:text-white transition-colors">{option.label}</span>
                </span>
                {option.shortcut && (
                  <span className="ml-3 text-[10px] text-theme-light/40">
                    {option.shortcut}
                  </span>
                )}
              </button>
            </li>
          ),
        )}
      </ul>
    </div>
  );

  if (typeof document === "undefined") {
    return menu;
  }

  return mounted ? createPortal(menu, document.body) : null;
};

export const ContextMenu = React.memo(ContextMenuComponent);
