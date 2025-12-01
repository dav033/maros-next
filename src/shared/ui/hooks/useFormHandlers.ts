"use client";

import type { ChangeEvent } from "react";

export function useFormHandlers<TFormValue extends Record<string, any>>(
  value: TFormValue,
  onChange: (value: TFormValue) => void
) {
  const handleTextChange = (
    event: ChangeEvent<HTMLInputElement>,
    key: keyof TFormValue
  ) => {
    onChange({ ...value, [key]: event.target.value });
  };

  const handleCheckboxChange = (
    event: ChangeEvent<HTMLInputElement>,
    key: keyof TFormValue
  ) => {
    onChange({ ...value, [key]: event.target.checked });
  };

  const handleSelectChange = (
    event: ChangeEvent<HTMLSelectElement>,
    key: keyof TFormValue
  ) => {
    onChange({ ...value, [key]: event.target.value });
  };

  const handleNumberSelectChange = (
    newValue: string,
    key: keyof TFormValue
  ) => {
    const numValue = newValue === "" ? null : Number(newValue);
    onChange({ ...value, [key]: numValue });
  };

  const handleValueChange = <K extends keyof TFormValue>(
    key: K,
    newValue: TFormValue[K]
  ) => {
    onChange({ ...value, [key]: newValue });
  };

  return {
    handleTextChange,
    handleCheckboxChange,
    handleSelectChange,
    handleNumberSelectChange,
    handleValueChange,
  };
}
