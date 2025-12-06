"use client";

import { useEffect, useState } from "react";
import { AddressAutocompleteInput } from "@/shared/ui/molecules/AddressAutocompleteInput";

type LeadLocationFieldProps = {
  location: string;              // raw text
  addressLink?: string | null;   // Google link
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
  // ✅ If addressLink has content, start in Google mode
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
      {/* Checkbox to enable/disable Google Maps */}
      <label className="flex items-center gap-2 text-sm text-gray-300">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-500"
          checked={useGoogleService}
          onChange={(e) => handleToggleGoogle(e.target.checked)}
          disabled={disabled}
        />
        <span>
          Enable Google Maps Service
          <span className="ml-1 text-xs text-gray-500">
            (autocomplete + map)
          </span>
        </span>
      </label>

      {/* SIMPLE MODE: raw text only */}
      {!useGoogleService && (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-300">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            disabled={disabled}
            placeholder="Enter address (without Google Maps)"
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500">
            Only the address text will be saved here. No Google Maps link will be generated.
          </p>
        </div>
      )}

      {/* GOOGLE MODE: autocomplete + map */}
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
          <p className="text-xs text-gray-500">
            The address text will be saved in <strong>location</strong> and
            the Google Maps link in <strong>addressLink</strong>. When reopening
            the lead, if <strong>addressLink</strong> exists, this
            mode will be automatically enabled.
          </p>
        </div>
      )}
    </div>
  );
}

