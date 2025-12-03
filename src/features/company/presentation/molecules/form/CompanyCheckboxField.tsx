import type { ChangeEvent } from "react";
import { Checkbox, Label } from "@/shared/ui";

interface CompanyCheckboxFieldProps {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function CompanyCheckboxField({
  id,
  label,
  checked,
  disabled,
  onChange,
}: CompanyCheckboxFieldProps) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-theme-dark px-3 py-1.5">
      <Checkbox id={id} checked={checked} onChange={onChange} disabled={disabled} />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
}
