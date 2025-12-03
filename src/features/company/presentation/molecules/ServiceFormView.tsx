import { Icon, Input, ColorPicker } from "@/shared/ui";

interface ServiceFormValue {
  name: string;
  color: string;
}

interface ServiceFormViewProps {
  formValue: ServiceFormValue;
  onChange: (value: ServiceFormValue) => void;
  serverError: string | null;
  isPending: boolean;
}

export function ServiceFormView({
  formValue,
  onChange,
  serverError,
  isPending,
}: ServiceFormViewProps) {
  return (
    <>
      <div className="space-y-4 rounded-2xl bg-theme-dark/80 p-3 shadow-md">
        <Input
          value={formValue.name}
          onChange={(e) => onChange({ ...formValue, name: e.target.value })}
          placeholder="Service name"
          disabled={isPending}
          required
          leftAddon={<Icon name="lucide:wrench" size={16} />}
        />
        <ColorPicker
          value={formValue.color}
          onChange={(color) => onChange({ ...formValue, color })}
          disabled={isPending}
          label="Color"
        />
      </div>
      {serverError && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
          <Icon name="lucide:alert-circle" size={16} className="text-red-400 mt-0.5" />
          <p className="text-sm text-red-400">{serverError}</p>
        </div>
      )}
    </>
  );
}
