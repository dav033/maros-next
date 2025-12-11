import { Icon, Input, LocationField } from "@dav033/dav-components";
import type { ChangeEvent } from "react";

interface CompanyBasicFieldsProps {
  name: string;
  address: string;
  addressLink?: string;
  disabled?: boolean;
  onNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onAddressChange: (value: string) => void;
  onAddressLinkChange: (value: string) => void;
  onLocationChange?: (location: { address: string; link: string }) => void;
}

export function CompanyBasicFields({
  name,
  address,
  addressLink,
  disabled,
  onNameChange,
  onAddressChange,
  onAddressLinkChange,
  onLocationChange,
}: CompanyBasicFieldsProps) {
  return (
    <>
      <Input
        value={name}
        onChange={onNameChange}
        placeholder="Company name"
        disabled={disabled}
        required
        leftAddon={<Icon name="lucide:building-2" size={16} />}
      />
      <LocationField
        address={address}
        addressLink={addressLink}
        label="Address"
        placeholder="Company address"
        googlePlaceholder="Start typing to search address"
        disabled={disabled}
        showHelperText={false}
        onAddressChange={onAddressChange}
        onAddressLinkChange={onAddressLinkChange}
        onLocationChange={onLocationChange}
      />
    </>
  );
}
