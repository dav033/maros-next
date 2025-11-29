"use client";

import { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";

export type ColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
  label?: string;
};

export function ColorPicker({ value, onChange, disabled, label }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        buttonRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const presetColors = [
    "#EF4444", // red
    "#F97316", // orange
    "#F59E0B", // amber
    "#EAB308", // yellow
    "#84CC16", // lime
    "#22C55E", // green
    "#10B981", // emerald
    "#14B8A6", // teal
    "#06B6D4", // cyan
    "#0EA5E9", // sky
    "#3B82F6", // blue
    "#6366F1", // indigo
    "#8B5CF6", // violet
    "#A855F7", // purple
    "#D946EF", // fuchsia
    "#EC4899", // pink
    "#F43F5E", // rose
    "#64748B", // slate
    "#000000", // black
  ];

  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-medium text-gray-400">{label}</label>}
      
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-3 rounded-lg border border-theme-gray-subtle bg-theme-dark px-3 py-2 transition-colors hover:border-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <div
          className="h-8 w-8 shrink-0 rounded-md border border-theme-gray-subtle shadow-sm"
          style={{ backgroundColor: value }}
        />
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-400">Color</span>
          <span className="font-mono text-sm text-theme-light">{value.toUpperCase()}</span>
        </div>
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="fixed z-50 rounded-lg border border-theme-gray-subtle bg-theme-dark p-3 shadow-xl"
          style={{
            left: buttonRef.current ? `${buttonRef.current.getBoundingClientRect().left}px` : 0,
            top: buttonRef.current ? `${buttonRef.current.getBoundingClientRect().bottom + 8}px` : 0,
          }}
        >
          <HexColorPicker color={value} onChange={onChange} />
          
          <div className="mt-3 border-t border-theme-gray-subtle pt-3">
            <p className="mb-2 text-xs font-medium text-gray-400">Presets</p>
            <div className="grid grid-cols-9 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => onChange(color)}
                  className="h-6 w-6 rounded border border-theme-gray-subtle transition-transform hover:scale-110 hover:border-gray-400"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
