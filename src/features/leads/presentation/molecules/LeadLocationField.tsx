"use client";

import { AddressAutocompleteInput } from "@/components/custom";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type LeadLocationFieldProps = {
  location: string;
  addressLink?: string | null;
  disabled?: boolean;
  onLocationChange: (value: string) => void;
  onAddressLinkChange: (value: string) => void;
};

export function LeadLocationField({
  location,
  addressLink,
  disabled,
  onLocationChange,
  onAddressLinkChange,
}: LeadLocationFieldProps) {
  const [useGoogleService, setUseGoogleService] = useState(
    !!addressLink && addressLink.trim() !== ""
  );

  useEffect(() => {
    const hasLink = !!addressLink && addressLink.trim() !== "";
    setUseGoogleService(hasLink);
  }, [addressLink]);

  const handleToggleGoogle = (checked: boolean) => {
    setUseGoogleService(checked);
    if (!checked) {
      onAddressLinkChange("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="google-maps-service" className="text-sm text-muted-foreground cursor-pointer">
          Enable Google Maps service
          <span className="ml-1 text-xs opacity-70">(autocomplete + map)</span>
        </Label>
        <Switch
          id="google-maps-service"
          checked={useGoogleService}
          onCheckedChange={handleToggleGoogle}
          disabled={disabled}
        />
      </div>

      {!useGoogleService && (
        <div className="space-y-2">
          <Label>Location</Label>
          <Input
            type="text"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            disabled={disabled}
            placeholder="Enter address (without Google Maps)"
          />
          <p className="text-xs text-muted-foreground">
            Only the address text is saved. No Google Maps link is generated.
          </p>
        </div>
      )}

      {useGoogleService && (
        <div className="space-y-2">
          <AddressAutocompleteInput
            label="Location (Google Maps)"
            placeholder="Start typing and select the address"
            value={location}
            disabled={disabled}
            required={false}
            onChange={(addressText) => {
              onLocationChange(addressText);
            }}
            onLinkChange={(link) => {
              onAddressLinkChange(link);
            }}
          />
          <p className="text-xs text-muted-foreground">
            The address text is saved in <strong>location</strong> and
            the Google Maps link in <strong>addressLink</strong>. When reopening
            the lead, if <strong>addressLink</strong> exists, this mode
            will be automatically activated.
          </p>
        </div>
      )}
    </div>
  );
}
