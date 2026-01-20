"use client";

import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { Users, Search, UserPlus, ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { Contact } from "@/contact";

interface CompanyContactsSelectorProps {
  selectedContactIds: number[];
  contacts: Contact[];
  disabled?: boolean;
  onContactToggle: (contactId: number) => void;
  onCreateNewContact?: () => void;
}

export function CompanyContactsSelector({
  selectedContactIds,
  contacts,
  disabled,
  onContactToggle,
  onCreateNewContact,
}: CompanyContactsSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("mousedown", onClickOutside);
      return () => window.removeEventListener("mousedown", onClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  const selectedCount = selectedContactIds.length;
  const displayText =
    selectedCount > 0
      ? `${selectedCount} contact${selectedCount === 1 ? "" : "s"} selected`
      : "Select contacts";

  const filteredContacts = contacts.filter((contact): contact is Contact & { id: number } =>
    typeof contact.id === "number" && contact.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 text-left text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Users className="size-4 text-muted-foreground" />
        <span className="flex-1 truncate">{displayText}</span>
        {isOpen ? (
          <ChevronUp className="size-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full rounded-md border border-border bg-popover shadow-lg"
        >
          <div className="border-b border-border p-2 space-y-2">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="size-4" />
              </div>
              <Input
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                placeholder="Search contacts..."
                className="pl-10"
              />
            </div>
            {onCreateNewContact && (
              <button
                type="button"
                onClick={() => {
                  onCreateNewContact();
                  setIsOpen(false);
                }}
                disabled={disabled}
                className="flex w-full items-center gap-2 rounded-md border border-dashed border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary hover:bg-primary/20 hover:border-primary/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="size-4" />
                <span>Create New Contact</span>
              </button>
            )}
          </div>
          <div className="max-h-52 overflow-auto">
            {filteredContacts.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {searchQuery ? "No contacts found" : "No contacts available"}
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <label
                  key={contact.id}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent"
                >
                  <Checkbox
                    checked={selectedContactIds.includes(contact.id)}
                    onCheckedChange={() => onContactToggle(contact.id)}
                    disabled={disabled}
                  />
                  <span className="flex-1 truncate">{contact.name}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
