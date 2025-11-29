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
  return danger ? "text-red-400 hover:bg-red-500/10" : "hover:bg-theme-primary/10";
}

const ContextMenuComponent: React.FC<ContextMenuProps> = ({
  options,
  isOpen,
  position,
  onClose,
}) => {
  const ref = React.useRef<HTMLDivElement | null>(null);

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

  if (!isOpen) return null;

  const renderIcon = (icon?: React.ReactNode | string) => {
    if (!icon) return null;
    if (typeof icon === "string") {
      return <Icon name={icon} className="mr-2" size={16} />;
    }
    return <span className="mr-2">{icon}</span>;
  };

  const menu = (
    <div
      ref={ref}
      data-context-menu
      className="fixed z-50 min-w-[200px] rounded-md border border-gray-700 bg-theme-dark text-theme-light shadow-xl py-1"
      style={{ left: position.x, top: position.y }}
      role="menu"
      aria-label="Context menu"
    >
      <ul className="m-0 flex list-none flex-col p-1">
        {options.map((option, index) =>
          option.separator ? (
            <li
              key={option.id || `separator-${index}`}
              className="my-1 border-t border-gray-700 opacity-60"
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
                  "flex w-full items-center justify-between rounded px-3 py-1.5 text-sm",
                  "text-theme-light/90",
                  option.disabled
                    ? "cursor-not-allowed opacity-50"
                    : getVariantClasses(option.danger),
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="flex items-center">
                  {renderIcon(option.icon)}
                  <span>{option.label}</span>
                </span>
                {option.shortcut && (
                  <span className="ml-2 text-xs text-theme-light/50">
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

  return createPortal(menu, document.body);
};

export const ContextMenu = React.memo(ContextMenuComponent);
