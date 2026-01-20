import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface CompanyCheckboxFieldProps {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

export function CompanyCheckboxField({
  id,
  label,
  checked,
  disabled,
  onChange,
}: CompanyCheckboxFieldProps) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-card px-3 py-1.5">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(checked) => onChange(!!checked)}
        disabled={disabled}
      />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
}
