"use client";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function ColorPicker({
  value,
  onChange,
  disabled,
  label,
  className,
}: ColorPickerProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((color) => (
          <Button
            key={color}
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            onClick={() => onChange(color)}
            className={cn(
              "h-8 w-8 rounded-md border-2 transition-all hover:scale-110",
              value === color
                ? "border-foreground ring-2 ring-ring ring-offset-2"
                : "border-transparent"
            )}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div
          className="h-9 w-9 rounded-md border border-input shrink-0"
          style={{ backgroundColor: value }}
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="#000000"
          className="flex-1 font-mono text-sm"
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-9 w-9 cursor-pointer rounded-md border border-input bg-transparent p-0.5"
        />
      </div>
    </div>
  );
}
