// TODO: LocationField needs to be migrated separately (Google Maps integration)

import { LocationField } from "@/components/shared";
import { Building, Phone, Mail, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
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
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Building className="size-4" />
        </div>
        <Input
          value={name}
          onChange={onNameChange}
          placeholder="Company name"
          disabled={disabled}
          required
          className="pl-10"
        />
      </div>
      <LocationField
        address={address}
        addressLink={addressLink}
        label="Address"
        placeholder="Company address"
        disabled={disabled}
        onAddressChange={onAddressChange}
        onAddressLinkChange={onAddressLinkChange}
        onLocationChange={onLocationChange}
      />
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Phone className="size-4" />
        </div>
        <Input
          value={phone ?? ""}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onPhoneChange(e.target.value)}
          placeholder="Phone"
          disabled={disabled}
          type="tel"
          className="pl-10"
        />
      </div>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Mail className="size-4" />
        </div>
        <Input
          value={email ?? ""}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onEmailChange(e.target.value)}
          placeholder="Email"
          disabled={disabled}
          type="email"
          className="pl-10"
        />
      </div>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <FileText className="size-4" />
        </div>
        <Input
          value={submiz ?? ""}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onSubmizChange(e.target.value)}
          placeholder="Submiz"
          disabled={disabled}
          className="pl-10"
        />
      </div>
    </>
  );
}
