"use client";
import { useState, useCallback, useMemo } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
export interface UseFormControllerConfig<TForm, TResult> {
  initialForm: TForm;
  validate: (form: TForm) => boolean;
  onSubmit: (form: TForm) => Promise<TResult>;
  invalidateKeys?: QueryKey[];
  onSuccess?: (result: TResult) => void;
  transformBeforeSubmit?: (form: TForm) => TForm | null;
}
export interface UseFormControllerReturn<TForm, TResult> {
  form: TForm;
  setField: <K extends keyof TForm>(key: K, value: TForm[K]) => void;
  setFields: (fields: Partial<TForm>) => void;
  setForm: (form: TForm) => void;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  canSubmit: boolean;
  submit: () => Promise<boolean>;
  reset: () => void;
}
export function useFormController<TForm extends Record<string, any>, TResult>({
  initialForm,
  validate,
  onSubmit,
  invalidateKeys = [],
  onSuccess,
  transformBeforeSubmit,
}: UseFormControllerConfig<TForm, TResult>): UseFormControllerReturn<TForm, TResult> {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<TForm>(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canSubmit = useMemo(() => {
    return validate(form);
  }, [form, validate]);
  const setField = useCallback(<K extends keyof TForm>(key: K, value: TForm[K]) => {
    setError(null);
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setFields = useCallback((fields: Partial<TForm>) => {
    setError(null);
    setForm((prev) => ({ ...prev, ...fields }));
  }, []);
  const submit = useCallback(async () => {
    if (!canSubmit || isLoading) return false;
    setIsLoading(true);
    setError(null);
    try {
      const formToSubmit = transformBeforeSubmit ? transformBeforeSubmit(form) : form;
      if (formToSubmit === null) {
        setError("No changes detected");
        setIsLoading(false);
        return false;
      }
      const result = await onSubmit(formToSubmit);
      for (const key of invalidateKeys) {
        queryClient.invalidateQueries({ queryKey: key });
      }
      onSuccess?.(result);
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [canSubmit, isLoading, form, transformBeforeSubmit, onSubmit, invalidateKeys, queryClient, onSuccess]);
  const reset = useCallback(() => {
    setForm(initialForm);
    setError(null);
    setIsLoading(false);
  }, [initialForm]);
  return {
    form,
    setField,
    setFields,
    setForm,
    isLoading,
    error,
    setError,
    canSubmit,
    submit,
    reset,
  };
}
