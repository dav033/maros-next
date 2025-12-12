import { Icon, Input, LocationField } from "@dav033/dav-components";
import type { ChangeEvent } from "react";

interface CompanyBasicFieldsProps {
  name: string;
  address: string;
  addressLink?: string;
  phone?: string;
  email?: string;
  submiz?: string;
  disabled?: boolean;
  onNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onAddressChange: (value: string) => void;
  onAddressLinkChange: (value: string) => void;
  onLocationChange?: (location: { address: string; link: string }) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onSubmizChange: (value: string) => void;
}

export function CompanyBasicFields({
  name,
  address,
  addressLink,
  phone,
  email,
  submiz,
  disabled,
  onNameChange,
  onAddressChange,
  onAddressLinkChange,
  onLocationChange,
  onPhoneChange,
  onEmailChange,
  onSubmizChange,
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
      <Input
        value={phone ?? ""}
        onChange={(e) => onPhoneChange(e.target.value)}
        placeholder="Phone"
        disabled={disabled}
        type="tel"
        leftAddon={<Icon name="lucide:phone" size={16} />}
      />
      <Input
        value={email ?? ""}
        onChange={(e) => onEmailChange(e.target.value)}
        placeholder="Email"
        disabled={disabled}
        type="email"
        leftAddon={<Icon name="lucide:mail" size={16} />}
      />
      <Input
        value={submiz ?? ""}
        onChange={(e) => onSubmizChange(e.target.value)}
        placeholder="Submiz"
        disabled={disabled}
        leftAddon={<Icon name="lucide:file-text" size={16} />}
      />
    </>
  );
}
