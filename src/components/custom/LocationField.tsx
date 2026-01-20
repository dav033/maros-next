"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MapPin, Link as LinkIcon, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationFieldProps {
  address: string;
  addressLink?: string | null;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  onAddressChange?: (value: string) => void;
  onAddressLinkChange?: (value: string) => void;
  onLocationChange?: (data: { address: string; link: string }) => void;
  className?: string;
}

export function LocationField({
  address,
  addressLink,
  disabled,
  label = "Location",
  placeholder = "Enter address",
  onAddressChange,
  onAddressLinkChange,
  onLocationChange,
  className,
}: LocationFieldProps) {
  const [useGoogleMaps, setUseGoogleMaps] = useState(
    !!addressLink && addressLink.trim() !== ""
  );

  useEffect(() => {
    const hasLink = !!addressLink && addressLink.trim() !== "";
    setUseGoogleMaps(hasLink);
  }, [addressLink]);

  const handleToggleGoogleMaps = (checked: boolean) => {
    setUseGoogleMaps(checked);
    if (!checked) {
      onAddressLinkChange?.("");
      onLocationChange?.({ address, link: "" });
    }
  };

  const handleAddressChange = (value: string) => {
    onAddressChange?.(value);
    if (onLocationChange) {
      onLocationChange({ address: value, link: addressLink || "" });
    }
  };

  const handleLinkChange = (value: string) => {
    onAddressLinkChange?.(value);
    if (onLocationChange) {
      onLocationChange({ address, link: value });
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor="google-maps-toggle" className="text-sm text-muted-foreground cursor-pointer">
          Enable Google Maps link
          <span className="ml-1 text-xs opacity-70">(optional)</span>
        </Label>
        <Switch
          id="google-maps-toggle"
          checked={useGoogleMaps}
          onCheckedChange={handleToggleGoogleMaps}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <MapPin className="size-4" />
          </div>
          <Input
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="pl-10"
          />
        </div>
      </div>

      {useGoogleMaps && (
        <div className="space-y-2">
          <Label className="text-muted-foreground">Google Maps Link</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <LinkIcon className="size-4" />
            </div>
            <Input
              value={addressLink || ""}
              onChange={(e) => handleLinkChange(e.target.value)}
              placeholder="https://maps.google.com/..."
              disabled={disabled}
              className="pl-10"
            />
          </div>
          {addressLink && (
            <a
              href={addressLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="size-3" />
              Open in Google Maps
            </a>
          )}
        </div>
      )}
    </div>
  );
}
