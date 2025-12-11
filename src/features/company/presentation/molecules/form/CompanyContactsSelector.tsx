"use client";

import { useState, useEffect, useRef } from "react";
import { Checkbox, Icon, Input } from "@dav033/dav-components";
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
        className="flex h-10 w-full items-center gap-2 rounded-lg border border-theme-gray-subtle bg-theme-dark px-3 text-left text-sm text-theme-light placeholder:text-gray-400 outline-none focus:border-theme-accent focus:ring-1 focus:ring-theme-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Icon name="lucide:users" size={16} className="text-gray-400" />
        <span className="flex-1 truncate">{displayText}</span>
        <Icon
          name={isOpen ? "lucide:chevron-up" : "lucide:chevron-down"}
          size={16}
          className="text-gray-400"
        />
      </button>
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full rounded-lg border border-theme-gray bg-theme-dark shadow-lg"
        >
          <div className="border-b border-theme-gray-subtle p-2 space-y-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              leftAddon={<Icon name="lucide:search" size={16} />}
            />
            {onCreateNewContact && (
              <button
                type="button"
                onClick={() => {
                  onCreateNewContact();
                  setIsOpen(false);
                }}
                disabled={disabled}
                className="flex w-full items-center gap-2 rounded-lg border border-dashed border-[#1ab3a4]/40 bg-[#1ab3a4]/8 px-3 py-2 text-sm text-[#9ff3e7] hover:bg-[#1ab3a4]/14 hover:border-[#1ab3a4]/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="lucide:user-plus" size={16} />
                <span>Create New Contact</span>
              </button>
            )}
          </div>
          <div className="max-h-52 overflow-auto">
            {filteredContacts.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-400">
                {searchQuery ? "No contacts found" : "No contacts available"}
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <label
                  key={contact.id}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-theme-light hover:bg-theme-gray"
                >
                  <Checkbox
                    checked={selectedContactIds.includes(contact.id)}
                    onChange={() => onContactToggle(contact.id)}
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
