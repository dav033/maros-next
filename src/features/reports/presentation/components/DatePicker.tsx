import { useId, useRef } from "react";
import { Field, Icon, controlBaseClass } from "@dav033/dav-components";

type DatePickerProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
}: DatePickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();

  const openPicker = () => {
    const el = inputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
    if (!el) return;
    if (typeof el.showPicker === "function") {
      el.showPicker();
    } else {
      el.focus();
      el.click();
    }
  };

  return (
    <Field label={label} htmlFor={inputId}>
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="date"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={controlBaseClass({ hasRightAddon: true })}
        />
        <button
          type="button"
          onClick={openPicker}
          className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-theme-light focus:outline-none"
          aria-label="Open calendar"
          disabled={disabled}
        >
          <Icon name="mdi:calendar" size={18} />
        </button>
      </div>
    </Field>
  );
}



