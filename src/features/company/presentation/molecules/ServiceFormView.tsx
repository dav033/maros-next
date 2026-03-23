// TODO: ColorPicker needs custom implementation

import { ColorPicker } from "@/components/shared";
import { Wrench, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { ChangeEvent } from "react";

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
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Wrench className="size-4" />
          </div>
          <Input
            value={formValue.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ ...formValue, name: e.target.value })}
            placeholder="Service name"
            disabled={isPending}
            required
            className="pl-10"
          />
        </div>
        <ColorPicker
          value={formValue.color}
          onChange={(color: string) => onChange({ ...formValue, color })}
          disabled={isPending}
          label="Color"
        />
      </div>
      {serverError && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
          <AlertCircle className="size-4 text-red-400 mt-0.5" />
          <p className="text-sm text-red-400">{serverError}</p>
        </div>
      )}
    </>
  );
}
