import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { controlBaseClass } from "../controlStyles";
import { Field } from "../molecules/Field";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
  hint?: string;
  fullWidth?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      leftAddon,
      rightAddon,
      hint,
      id,
      className = "",
      value,
      fullWidth = true,
      ...props
    },
    ref
  ) => {
    const inputId =
      id ??
      (label ? `${String(label).toLowerCase().replace(/\s+/g, "-")}-input` : undefined);

    const baseInputClass = [
      controlBaseClass({
        hasLeftAddon: !!leftAddon,
        hasRightAddon: !!rightAddon,
        fullWidth,
        error: !!error,
      }),
      "cursor-pointer",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const normalizedValue = value ?? "";

    return (
      <Field label={label} error={error} hint={hint} htmlFor={inputId}>
        <div className="relative">
          {leftAddon && (
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
              {leftAddon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={baseInputClass}
            value={normalizedValue}
            {...props}
          />
          {rightAddon && (
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
              {rightAddon}
            </span>
          )}
        </div>
      </Field>
    );
  }
);

Input.displayName = "Input";
