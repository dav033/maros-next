"use client";

import { Check } from "lucide-react";
import { useMemo, useState } from "react";

import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import type { QboCounterparty, QboCounterpartyType } from "../../domain/models";
import { useQboCounterparties } from "../hooks/useInvoiceScans";

export interface CounterpartyValue {
  name: string;
  /** QuickBooks id, present only while `name` is the one that came with it. */
  id: string | null;
  type: QboCounterpartyType | null;
}

export const EMPTY_COUNTERPARTY: CounterpartyValue = {
  name: "",
  id: null,
  type: null,
};

/**
 * The company runs hundreds of vendors and customers. Mounting them all would
 * put every one in the DOM on every keystroke; what does not fit here is
 * reached by typing one more letter.
 */
const MAX_VISIBLE = 50;

interface Props {
  /**
   * Accessible name of the field. It comes in as a prop because cmdk overrides
   * the input's `id` and `aria-labelledby` with its own, so an `htmlFor` on the
   * visible caption would point at nothing: the caller shows the caption and
   * hands the same words to cmdk's own hidden label.
   */
  label: string;
  value: CounterpartyValue;
  onChange: (value: CounterpartyValue) => void;
  disabled?: boolean;
}

/**
 * Counterparty field: picking from QuickBooks is the fast path, typing is still
 * valid. A cash payment to somebody who was never registered as a vendor is a
 * legitimate entry, so the list narrows the field instead of closing it — which
 * is also why the input itself holds the value rather than a trigger button.
 *
 * Modelled on NoteReferenceTargetPicker, with the list anchored to the input
 * instead of portalled into a Popover: a portalled list cannot keep the typing
 * focus, and the typing is the point.
 */
export function CounterpartySelect({ label, value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useQboCounterparties();

  const needle = value.name.trim().toLowerCase();
  const matches = useMemo(() => {
    const all = data ?? [];
    const found = needle
      ? all.filter((option) => option.name.toLowerCase().includes(needle))
      : all;
    return found.slice(0, MAX_VISIBLE);
  }, [data, needle]);

  const choose = (counterparty: QboCounterparty) => {
    onChange({
      name: counterparty.name,
      id: counterparty.id,
      type: counterparty.type,
    });
    setOpen(false);
  };

  const emptyNote = isLoading
    ? "Loading QuickBooks names…"
    : (data ?? []).length === 0
      ? "No QuickBooks list available — the name is saved exactly as you type it."
      : `No match in QuickBooks. “${value.name.trim()}” is saved as typed.`;

  return (
    <Command
      label={label}
      // La lista ya viene entera del servidor y se recorta aquí: dejar que cmdk
      // filtre otra vez escondería lo que este componente decidió mostrar.
      shouldFilter={false}
      className="relative h-auto overflow-visible bg-transparent [&_[cmdk-input-wrapper]]:h-9 [&_[cmdk-input-wrapper]]:rounded-md [&_[cmdk-input-wrapper]]:border [&_[cmdk-input-wrapper]]:border-line-strong"
      onKeyDown={(event) => {
        // Escape cierra la lista, no el diálogo que suele haber detrás.
        if (event.key === "Escape" && open) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
        }
      }}
    >
      <CommandInput
        value={value.name}
        maxLength={255}
        disabled={disabled}
        placeholder="Search QuickBooks or type a name"
        className="h-9"
        onValueChange={(next) => {
          // Typing over a picked name unlinks it: an id left behind would point
          // at a different vendor than the one now written.
          onChange({ name: next, id: null, type: null });
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      />
      {open && (
        <div
          className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-md border border-line bg-elev-4 shadow-lg"
          // Sin esto el click en una opción primero quita el foco, el blur
          // cierra el panel y el click aterriza en nada.
          onMouseDown={(event) => event.preventDefault()}
        >
          <CommandList className="max-h-56">
            {matches.length === 0 ? (
              <p className="px-3 py-3 text-xs text-muted-foreground">{emptyNote}</p>
            ) : (
              matches.map((counterparty) => (
                <CommandItem
                  key={`${counterparty.type}-${counterparty.id}`}
                  value={`${counterparty.type}-${counterparty.id}`}
                  onSelect={() => choose(counterparty)}
                >
                  <span className="truncate">{counterparty.name}</span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {counterparty.type}
                  </span>
                </CommandItem>
              ))
            )}
          </CommandList>
        </div>
      )}
      {value.id && (
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Check className="size-3 shrink-0" aria-hidden="true" />
          Linked to the QuickBooks {value.type?.toLowerCase() ?? "record"}
        </p>
      )}
    </Command>
  );
}
