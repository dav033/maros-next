"use client";

import React from "react";
import { AddressAutocompleteWithMap } from "./AddressAutocompleteWithMap";

type AddressAutocompleteInputProps = {
  value?: string;
  onChange: (value: string) => void;       // Address text
  onLinkChange: (link: string) => void;    // Google Maps URL
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  initialCenter?: { lat: number; lng: number };
  height?: string;
  leftAddon?: React.ReactNode;
};

export function AddressAutocompleteInput({
  value,
  onChange,
  onLinkChange,
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
