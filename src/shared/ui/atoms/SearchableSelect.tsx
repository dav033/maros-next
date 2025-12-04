"use client";

import { useRef, useState } from "react";
import Icon from "./Icon";
import { ICON_SIZES } from "../iconSizes";
import { controlBaseClass } from "../controlStyles";
import { DropdownPortal } from "./DropdownPortal";
import type { SelectOption } from "./Select";

export interface SearchableSelectProps {
  options: ReadonlyArray<SelectOption>;
  value: string | number | undefined | null;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Custom searchable select with color indicators and filtering.
 * Uses DropdownPortal for positioning and click-outside detection.
 */
export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  icon,
  disabled = false,
  className = "",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const filteredOptions = options.filter((o) =>
    (o.label || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const baseControl = [
    controlBaseClass({
      hasLeftAddon: !!icon,
      fullWidth: true,
    }),
    "flex items-center justify-between cursor-pointer",
    "ring-0 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
  ].join(" ");

  const handleOptionClick = (
    optValue: string | number,
    optDisabled?: boolean
  ) => {
    if (optDisabled) return;
    onChange(String(optValue));
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-visible w-full ${className}`}
    >
      {icon && (
        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Icon name={icon} className="text-gray-400" size={ICON_SIZES.md} />
        </span>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((o) => !o)}
        className={baseControl}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate flex items-center gap-2">
          {selectedOption?.color ? (
            <div
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: selectedOption.color }}
            />
          ) : selectedOption?.color === null ? (
            <div className="h-3 w-3 rounded-full shrink-0 border border-gray-500" />
          ) : null}
          <span className="truncate">
            {selectedOption?.label || placeholder}
          </span>
        </span>
        <Icon
          name={
            isOpen
              ? "material-symbols:arrow-drop-up"
              : "material-symbols:arrow-drop-down"
          }
          className="text-gray-400"
          size={ICON_SIZES.lg}
        />
      </button>

      <DropdownPortal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setSearchTerm("");
        }}
        triggerRef={containerRef}
        className="bg-theme-dark border border-theme-gray rounded-lg max-h-60 overflow-auto shadow-lg"
      >
        <div className="px-3 py-2 border-b border-theme-gray">
          <input
            type="text"
            className="w-full bg-theme-dark border-none text-sm text-theme-light placeholder:text-gray-400 outline-none focus:outline-none"
            placeholder="Search…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>
        {filteredOptions.map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            disabled={!!opt.disabled}
            className="w-full text-left px-3 py-2 text-sm truncate text-theme-light hover:bg-theme-gray cursor-pointer border-none bg-transparent disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            onClick={() => handleOptionClick(opt.value, opt.disabled)}
          >
            {opt.color ? (
              <div
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: opt.color }}
              />
            ) : opt.color === null ? (
              <div className="h-3 w-3 rounded-full shrink-0 border border-gray-500" />
            ) : null}
            <span className="truncate">{opt.label || "No label"}</span>
          </button>
        ))}
        {filteredOptions.length === 0 && (
          <div className="px-3 py-2 text-sm text-gray-400">
            No options found
          </div>
        )}
      </DropdownPortal>
    </div>
  );
}
