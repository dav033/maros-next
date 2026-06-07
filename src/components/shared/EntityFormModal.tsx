"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import {
  type DefaultValues,
  type FieldValues,
  type Resolver,
  type SubmitHandler,
  type UseFormReturn,
  useForm,
} from "react-hook-form";
import type { ZodType } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type EntityFormMode = "create" | "edit";

export type EntityFormModalProps<TValues extends FieldValues> = {
  isOpen: boolean;
  onClose: () => void;
  mode: EntityFormMode;
  title: ReactNode;
  description?: ReactNode;
  schema: ZodType<TValues>;
  defaultValues: DefaultValues<TValues>;
  onSubmit: (values: TValues) => Promise<void> | void;
  renderFields: (form: UseFormReturn<TValues>) => ReactNode;
  submitLabel?: { create?: string; edit?: string };
  cancelLabel?: string;
  loadingLabel?: { create?: string; edit?: string };
  contentClassName?: string;
};

export function EntityFormModal<TValues extends FieldValues>({
  isOpen,
  onClose,
  mode,
  title,
  description,
  schema,
  defaultValues,
  onSubmit,
  renderFields,
  submitLabel,
  cancelLabel = "Cancel",
  loadingLabel,
  contentClassName,
}: EntityFormModalProps<TValues>) {
  const form = useForm<TValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as never) as Resolver<TValues, any, TValues>,
    defaultValues,
    mode: "onSubmit",
  });

  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues);
      setServerError(null);
    }
  }, [isOpen, defaultValues, form]);

  const submit: SubmitHandler<TValues> = async (values) => {
    setServerError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      setServerError(message);
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  const computedSubmitLabel =
    mode === "create"
      ? submitLabel?.create ?? "Create"
      : submitLabel?.edit ?? "Save changes";

  const computedLoadingLabel =
    mode === "create"
      ? loadingLabel?.create ?? "Creating..."
      : loadingLabel?.edit ?? "Saving...";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose();
      }}
    >
      <DialogContent className={cn("bg-card border-border", contentClassName)}>
        <DialogHeader>
          <DialogTitle className="text-foreground">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(submit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="flex flex-col gap-4">{renderFields(form)}</div>

          {serverError && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
              <AlertCircle className="size-4 text-destructive mt-0.5" />
              <p className="text-sm text-destructive">{serverError}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              disabled={isSubmitting}
              onClick={onClose}
            >
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader className="size-4 animate-spin" />
                  {computedLoadingLabel}
                </span>
              ) : (
                computedSubmitLabel
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
