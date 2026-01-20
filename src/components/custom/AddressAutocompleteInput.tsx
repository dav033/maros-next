"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddressAutocompleteInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  onChange: (addressText: string) => void;
  onLinkChange?: (link: string) => void;
}

/**
 * Simplified address input component.
 * Note: For full Google Maps autocomplete functionality,
 * you would need to integrate with Google Places API.
 */
export function AddressAutocompleteInput({
  label,
  placeholder = "Enter address",
  value,
  disabled,
  required,
  className,
  onChange,
  onLinkChange,
}: AddressAutocompleteInputProps) {
  const handleChange = (newValue: string) => {
    onChange(newValue);
    // Generate a simple Google Maps search link
    if (onLinkChange && newValue.trim()) {
      const encodedAddress = encodeURIComponent(newValue.trim());
      onLinkChange(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
    } else if (onLinkChange) {
      onLinkChange("");
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <MapPin className="size-4" />
        </div>
        <Input
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="pl-10"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Type an address. A Google Maps link will be generated automatically.
      </p>
    </div>
  );
}
