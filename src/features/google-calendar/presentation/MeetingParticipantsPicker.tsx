"use client";

import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUserDirectory } from "@/features/users/presentation/hooks/data/useUserDirectory";

export function MeetingParticipantsPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: string[];
  onChange: (emails: string[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [externalEmail, setExternalEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const { users, isLoading } = useUserDirectory(true);
  const participants = new Map(users.map((person) => [person.email.toLowerCase(), person]));

  const toggleUser = (email: string) => {
    const normalized = email.toLowerCase();
    onChange(value.some((item) => item.toLowerCase() === normalized)
      ? value.filter((item) => item.toLowerCase() !== normalized)
      : value.length < 25 ? [...value, normalized] : value);
  };

  const addExternalEmail = () => {
    const email = externalEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError(true);
      return;
    }
    if (!value.some((item) => item.toLowerCase() === email) && value.length < 25) {
      onChange([...value, email]);
    }
    setExternalEmail("");
    setEmailError(false);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="w-full justify-between" disabled={disabled || value.length >= 25}>
            <span>{value.length ? `${value.length} participant${value.length === 1 ? "" : "s"} selected` : "Choose app users"}</span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search users by name or email…" />
            <CommandList>
              <CommandEmpty>{isLoading ? "Loading users…" : "No users found."}</CommandEmpty>
              <CommandGroup heading="Application users">
                {users.map((person) => {
                  const selected = value.some((email) => email.toLowerCase() === person.email.toLowerCase());
                  return (
                    <CommandItem
                      key={person.id}
                      value={`${person.name ?? ""} ${person.email}`}
                      onSelect={() => toggleUser(person.email)}
                      className="gap-2"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{person.name ?? person.email}</span>
                        {person.name ? <span className="block truncate text-xs text-muted-foreground">{person.email}</span> : null}
                      </span>
                      {selected ? <Check className="size-4 text-primary" /> : null}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map((email) => {
            const person = participants.get(email.toLowerCase());
            return (
              <span key={email} className="inline-flex max-w-full items-center gap-1 rounded-full border bg-muted/50 py-1 pl-2.5 pr-1 text-xs">
                <span className="truncate">{person?.name ?? email}</span>
                <button
                  type="button"
                  aria-label={`Remove ${person?.name ?? email}`}
                  className="rounded-full p-1 text-muted-foreground hover:bg-background hover:text-foreground"
                  disabled={disabled}
                  onClick={() => onChange(value.filter((item) => item.toLowerCase() !== email.toLowerCase()))}
                >
                  <X className="size-3" />
                </button>
              </span>
            );
          })}
        </div>
      ) : null}

      <div className="flex gap-2">
        <Input
          type="email"
          value={externalEmail}
          onChange={(event) => { setExternalEmail(event.target.value); setEmailError(false); }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addExternalEmail();
            }
          }}
          placeholder="Add an external email"
          disabled={disabled || value.length >= 25}
        />
        <Button type="button" variant="secondary" onClick={addExternalEmail} disabled={disabled || value.length >= 25 || !externalEmail.trim()}>
          Add
        </Button>
      </div>
      {emailError ? <p className="text-xs text-destructive" role="alert">Enter a valid email address to add this guest.</p> : null}
      <p className="text-xs text-muted-foreground">Invited users appear on their Maros calendar. Google Calendar emails the event and Meet link to every participant.</p>
    </div>
  );
}
