"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/shared/ui";

export type SelectOption = {
  value: string | number;
  label?: string;
  disabled?: boolean;
  color?: string | null;
};

export interface SelectProps {
  options: ReadonlyArray<SelectOption>;
  value: string | number | undefined | null;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  icon?: string;
  disabled?: boolean;
  className?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
  fullWidth?: boolean;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  searchable = false,
  icon,
  disabled = false,
  className = "",
  allowEmpty = true,
  emptyLabel = "None",
  fullWidth = true,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [position, setPosition] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target) || dropdownRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    window.addEventListener("mousedown", onClickOutside);
    return () => window.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({ 
        top: rect.bottom + window.scrollY, 
        left: rect.left + window.scrollX, 
        width: rect.width 
      });
    }
  }, [isOpen]);

  const selectedOption = options.find((o) => o.value === value);
  const filteredOptions = searchable
    ? options.filter((o) => (o.label || "").toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  const baseControl = `
    flex items-center h-10 w-full
    rounded-lg bg-theme-dark border border-theme-gray
    text-theme-light placeholder:text-gray-400
    pr-3 py-2 text-sm outline-none focus:outline-none
    ring-0 focus:ring-0 disabled:cursor-not-allowed
    disabled:opacity-50 cursor-pointer
  `;
  const plClass = icon ? "pl-10" : "pl-3";

  const dropdown = (
    <div
      ref={dropdownRef}
      style={{ 
        position: "absolute", 
        top: position.top, 
        left: position.left, 
        width: position.width, 
        zIndex: 9999 
      }}
      className="bg-theme-dark border border-theme-gray rounded-lg max-h-60 overflow-auto shadow-lg"
    >
      {searchable && (
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
      )}
      {filteredOptions.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          disabled={!!opt.disabled}
          className="w-full text-left px-3 py-2 text-sm truncate text-theme-light hover:bg-theme-gray cursor-pointer border-none bg-transparent disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          onClick={() => {
            if (opt.disabled) return;
            onChange(String(opt.value));
            setIsOpen(false);
            setSearchTerm("");
          }}
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
      {searchable && filteredOptions.length === 0 && (
        <div className="px-3 py-2 text-sm text-gray-400">No options found</div>
      )}
    </div>
  );

  return (
    <div ref={containerRef} className={`relative overflow-visible ${fullWidth ? 'w-full' : ''} ${className}`}>
      {icon && (
        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Icon name={icon} className="text-gray-400" size={20} />
        </span>
      )}

      {!searchable ? (
        <select
          disabled={disabled}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseControl} ${plClass}`}
        >
          {allowEmpty && <option value="">{emptyLabel}</option>}
          {options.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)} disabled={!!opt.disabled}>
              {opt.label || "No label"}
            </option>
          ))}
        </select>
      ) : (
        <>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen((o) => !o)}
            className={`${baseControl} ${plClass} justify-between`}
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
              <span className="truncate">{selectedOption?.label || placeholder}</span>
            </span>
            <Icon
              name={isOpen ? "material-symbols:arrow-drop-up" : "material-symbols:arrow-drop-down"}
              className="text-gray-400"
              size={24}
            />
          </button>
          {isOpen && typeof document !== "undefined" ? createPortal(dropdown, document.body) : null}
        </>
      )}
    </div>
  );
}
