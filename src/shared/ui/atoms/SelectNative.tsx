"use client";

import { Icon, ICON_SIZES } from "@/shared/ui";
import { controlBaseClass } from "../controlStyles";
import type { SelectOption } from "./Select";

export interface SelectNativeProps {
  options: ReadonlyArray<SelectOption>;
  value: string | number | undefined | null;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: string;
  disabled?: boolean;
  className?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
}

/**
 * Native <select> implementation for non-searchable selects.
 * Simpler, accessible, and browser-native behavior.
 */
export function SelectNative({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  icon,
  disabled = false,
  className = "",
  allowEmpty = true,
  emptyLabel = "None",
}: SelectNativeProps) {
  const baseControl = [
    controlBaseClass({
      hasLeftAddon: !!icon,
      fullWidth: true,
    }),
    "flex items-center cursor-pointer",
    "ring-0 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
  ].join(" ");

  return (
    <div className={`relative overflow-visible w-full ${className}`}>
      {icon && (
        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Icon name={icon} className="text-gray-400" size={ICON_SIZES.md} />
        </span>
      )}

      <select
        disabled={disabled}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={baseControl}
      >
        {allowEmpty && <option value="">{emptyLabel}</option>}
        {options.map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)} disabled={!!opt.disabled}>
            {opt.label || "No label"}
          </option>
        ))}
      </select>
    </div>
  );
}
