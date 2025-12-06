"use client";

import React from "react";
import { AddressAutocompleteWithMap } from "./AddressAutocompleteWithMap";

type AddressAutocompleteInputProps = {
  value?: string;
  onChange: (value: string) => void;       // Texto de dirección
  onLinkChange: (link: string) => void;    // URL de Google Maps
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  initialCenter?: { lat: number; lng: number };
  height?: string;
  leftAddon?: React.ReactNode;
  onLocationChange?: (location: { address: string; link: string }) => void;
};

export function AddressAutocompleteInput({
  value,
  onChange,
  onLinkChange,
  onLocationChange,
  label,
  placeholder,
  disabled,
  required,
  initialCenter,
  height,
  leftAddon,
}: AddressAutocompleteInputProps) {
  return (
    <AddressAutocompleteWithMap
      value={value}
      onChange={onChange}
      onLinkChange={onLinkChange}
      onLocationChange={onLocationChange}
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      initialCenter={initialCenter}
      height={height}
      leftAddon={leftAddon}
    />
  );
}
