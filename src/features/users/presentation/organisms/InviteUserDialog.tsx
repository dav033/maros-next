"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { type ReactNode, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInstantCompanies } from "@/features/company/presentation/hooks/data/useInstantCompanies";
import { useInstantContactsByCompany } from "@/features/contact/presentation/hooks/data/useInstantContactsByCompany";

import { useInstantRolesList } from "../hooks/data/useInstantRolesList";
import { useUserMutations } from "../hooks/mutations/useUserMutations";

const inviteSchema = z.object({
  email: z.string().trim().min(1, "Escribe un correo").email("Ese correo no es válido"),
  name: z.string().trim().max(255),
  roleId: z.string().min(1, "Elige un rol"),
  userType: z.enum(["internal", "client"]),
  scopedCompanyId: z.string(),
  scopedContactId: z.string(),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

const EMPTY_FORM: InviteFormValues = {
  email: "",
  name: "",
  roleId: "",
  userType: "internal",
  scopedCompanyId: "",
  scopedContactId: "",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function InviteUserDialog({ open, onOpenChange }: Props) {
  const { roles } = useInstantRolesList();
  const { inviteMutation } = useUserMutations();

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: EMPTY_FORM,
  });
  const { control, formState, handleSubmit, register, reset, setValue, watch } = form;

  const userType = watch("userType");
  const scopedCompanyId = watch("scopedCompanyId");
  const companyId = scopedCompanyId ? Number(scopedCompanyId) : null;

  // Only clients carry a scope, so nobody else pays for these two lists.
  const { companies = [] } = useInstantCompanies(undefined, {
    enabled: open && userType === "client",
  });
  const { contacts = [] } = useInstantContactsByCompany(
    userType === "client" ? companyId : null
  );

  const companyOptions = useMemo(
    () => companies.map((company) => ({ value: String(company.id), label: company.name })),
    [companies]
  );
  const contactOptions = useMemo(
    () =>
      contacts
        .filter((contact) => contact.id !== undefined)
        .map((contact) => ({ value: String(contact.id), label: contact.name })),
    [contacts]
  );

  const errors = formState.errors;
  const isPending = inviteMutation.isPending;

  const submit = handleSubmit(async (values) => {
    const isClient = values.userType === "client";
    try {
      await inviteMutation.mutateAsync({
        email: values.email,
        ...(values.name ? { name: values.name } : {}),
        roleId: Number(values.roleId),
        userType: values.userType,
        ...(isClient && values.scopedCompanyId
          ? { scopedCompanyId: Number(values.scopedCompanyId) }
          : {}),
        ...(isClient && values.scopedContactId
          ? { scopedContactId: Number(values.scopedContactId) }
          : {}),
      });
      reset(EMPTY_FORM);
      onOpenChange(false);
    } catch {
      // useEntityMutation already said why (a taken email, a bounced send). Keep the
      // dialog open so the address can be corrected and sent again.
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isPending) return;
        if (!next) reset(EMPTY_FORM);
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invitar a una persona</DialogTitle>
          <DialogDescription>
            Entra con su propia cuenta de Google, así que el correo que escribas tiene
            que ser el de esa cuenta. El correo que le enviamos es solo un aviso con el
            enlace para entrar: no es una contraseña ni una credencial.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <Field label="Correo" htmlFor="invite-email" error={errors.email?.message}>
            <Input
              id="invite-email"
              type="email"
              autoComplete="off"
              placeholder="persona@empresa.com"
              disabled={isPending}
              {...register("email")}
            />
          </Field>

          <Field
            label="Nombre"
            htmlFor="invite-name"
            hint="Opcional. Solo se usa para saludarla en el correo."
            error={errors.name?.message}
          >
            <Input id="invite-name" disabled={isPending} {...register("name")} />
          </Field>

          <Field label="Rol" htmlFor="invite-role" error={errors.roleId?.message}>
            <Controller
              control={control}
              name="roleId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  disabled={isPending}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="invite-role">
                    <SelectValue placeholder="Elige un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={String(role.id)}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field
            label="Tipo de usuario"
            htmlFor="invite-user-type"
            hint="Interno es personal de Maros. Cliente es alguien de fuera."
          >
            <Controller
              control={control}
              name="userType"
              render={({ field }) => (
                <Select
                  value={field.value}
                  disabled={isPending}
                  onValueChange={(value) => {
                    field.onChange(value);
                    if (value !== "client") {
                      setValue("scopedCompanyId", "");
                      setValue("scopedContactId", "");
                    }
                  }}
                >
                  <SelectTrigger id="invite-user-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Interno</SelectItem>
                    <SelectItem value="client">Cliente</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          {userType === "client" && (
            <>
              <Field
                label="Empresa"
                htmlFor="invite-company"
                hint="Opcional. Se guarda para cuando el alcance por empresa entre en vigor."
              >
                <Controller
                  control={control}
                  name="scopedCompanyId"
                  render={({ field }) => (
                    <SearchableSelect
                      options={companyOptions}
                      value={field.value}
                      disabled={isPending}
                      placeholder="Sin empresa"
                      searchPlaceholder="Buscar empresa..."
                      emptyText="Sin resultados."
                      onChange={(value) => {
                        field.onChange(value);
                        setValue("scopedContactId", "");
                      }}
                    />
                  )}
                />
              </Field>

              {companyId !== null && (
                <Field label="Contacto" htmlFor="invite-contact" hint="Opcional.">
                  <Controller
                    control={control}
                    name="scopedContactId"
                    render={({ field }) => (
                      <SearchableSelect
                        options={contactOptions}
                        value={field.value}
                        disabled={isPending}
                        placeholder="Sin contacto"
                        searchPlaceholder="Buscar contacto..."
                        emptyText="Esta empresa no tiene contactos."
                        onChange={field.onChange}
                      />
                    )}
                  />
                </Field>
              )}
            </>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader className="size-4 animate-spin" />
                  Enviando...
                </span>
              ) : (
                "Enviar invitación"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
