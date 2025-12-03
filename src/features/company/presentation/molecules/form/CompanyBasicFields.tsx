import { Icon, Input } from "@/shared/ui";
import type { ChangeEvent } from "react";

interface CompanyBasicFieldsProps {
  name: string;
  address: string;
  disabled?: boolean;
  onNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onAddressChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function CompanyBasicFields({
  name,
  address,
  disabled,
  onNameChange,
  onAddressChange,
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
      <Input
        value={address}
        onChange={onAddressChange}
        placeholder="Company address"
        disabled={disabled}
        leftAddon={<Icon name="lucide:map-pin" size={16} />}
      />
    </>
  );
}
