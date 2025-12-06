"use client";

import { useEffect, useState } from "react";
import { AddressAutocompleteInput } from "./AddressAutocompleteInput";

export type LocationFieldProps = {
  /**
   * The raw text address value
   */
  address: string;
  /**
   * The Google Maps link (optional)
   */
  addressLink?: string | null;
  /**
   * Label text for the field
   * @default "Location"
   */
  label?: string;
  /**
   * Placeholder for text mode
   * @default "Enter address"
   */
  placeholder?: string;
  /**
   * Placeholder for Google Maps mode
   * @default "Start typing and select the address"
   */
  googlePlaceholder?: string;
  /**
   * Whether the field is disabled
   */
  disabled?: boolean;
  /**
   * Whether to show the helper text
   * @default true
   */
  showHelperText?: boolean;
  /**
   * Callback when address text changes
   */
  onAddressChange: (value: string) => void;
  /**
   * Callback when address link changes
   */
  onAddressLinkChange: (value: string) => void;
  /**
   * Optional callback to update both atomically
   */
  onLocationChange?: (location: { address: string; link: string }) => void;
};

/**
 * Generic location field component that supports both plain text and Google Maps autocomplete modes.
 * Can be used across different features (leads, contacts, companies, etc.)
 */
export function LocationField({
  address,
  addressLink,
  label = "Location",
  placeholder = "Enter address",
  googlePlaceholder = "Start typing and select the address",
  disabled = false,
  showHelperText = true,
  onAddressChange,
  onAddressLinkChange,
  onLocationChange,
}: LocationFieldProps) {
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
            {label}
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {showHelperText && (
            <p className="text-xs text-gray-500">
              Only the address text will be saved. No Google Maps link will be generated.
            </p>
          )}
        </div>
      )}

      {/* GOOGLE MODE: autocomplete + map */}
      {useGoogleService && (
        <div className="space-y-2">
          <AddressAutocompleteInput
            label={`${label} (Google Maps)`}
            placeholder={googlePlaceholder}
            value={address}
            disabled={disabled}
            required={false}
            onChange={(addressText) => {
              onAddressChange(addressText);
            }}
            onLinkChange={(link) => {
              onAddressLinkChange(link);
            }}
            onLocationChange={onLocationChange}
          />
        </div>
      )}
    </div>
  );
}
