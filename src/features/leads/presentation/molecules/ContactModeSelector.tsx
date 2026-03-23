"use client";

import type { ChangeEvent } from "react";
import { User, Phone, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  EMPTY_SELECT_VALUE,
} from "@/components/ui/select";

export enum ContactMode {
  NEW_CONTACT = "NEW_CONTACT",
  EXISTING_CONTACT = "EXISTING_CONTACT",
}

type NewContactForm = {
  contactName: string;
  phone: string;
  email: string;
};

type Contact = { id: number; name: string; phone?: string; email?: string };

type ContactModeSelectorProps = {
  contactMode: ContactMode;
  onContactModeChange: (mode: ContactMode) => void;
  form: NewContactForm;
  onChange: <K extends keyof NewContactForm>(key: K, value: NewContactForm[K]) => void;
  disabled?: boolean;
  // Props for existing contact
  contacts?: Contact[];
  selectedContactId?: number;
  onContactSelect?: (contactId: number | undefined) => void;
};

export function ContactModeSelector({
  contactMode,
  onContactModeChange,
  form,
  onChange,
  disabled = false,
  contacts = [],
  selectedContactId,
  onContactSelect,
}: ContactModeSelectorProps) {
  return (
    <Tabs
      value={contactMode}
      onValueChange={(value) => onContactModeChange(value as ContactMode)}
      className="w-full"
    >
      <div className="flex mb-4 relative">
        <TabsList className="w-full grid grid-cols-2 relative">
          <TabsTrigger 
            value={ContactMode.NEW_CONTACT} 
            disabled={disabled}
            className="data-[state=active]:bg-transparent data-[state=active]:text-sidebar-accent-foreground relative z-10 transition-colors duration-500 ease-in-out"
          >
            New Contact
          </TabsTrigger>
          <TabsTrigger 
            value={ContactMode.EXISTING_CONTACT} 
            disabled={disabled}
            className="data-[state=active]:bg-transparent data-[state=active]:text-sidebar-accent-foreground relative z-10 transition-colors duration-500 ease-in-out"
          >
            Existing Contact
          </TabsTrigger>
          <div 
            className="absolute top-1 bottom-1 bg-sidebar-accent rounded-md transition-all duration-500 ease-in-out z-0"
            style={{ 
              width: 'calc(50% - 0.25rem)',
              left: contactMode === ContactMode.NEW_CONTACT ? '0.25rem' : 'calc(50% + 0.25rem)'
            }}
          />
        </TabsList>
      </div>

      <TabsContent value={ContactMode.NEW_CONTACT} className="space-y-3 mt-0">
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <User className="size-4" />
            </div>
            <Input
              value={form.contactName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onChange("contactName", e.target.value)}
              placeholder="Contact Name *"
              disabled={disabled}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Phone className="size-4" />
            </div>
            <Input
              value={form.phone}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onChange("phone", e.target.value)}
              placeholder="Phone"
              disabled={disabled}
              className="pl-10"
            />
          </div>
        </div>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Mail className="size-4" />
          </div>
          <Input
            value={form.email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange("email", e.target.value)}
            placeholder="Email"
            disabled={disabled}
            className="pl-10"
          />
        </div>
      </TabsContent>

      <TabsContent value={ContactMode.EXISTING_CONTACT} className="space-y-3 mt-0">
        {contacts.length > 0 && onContactSelect ? (
          <Select
            value={selectedContactId != null ? String(selectedContactId) : EMPTY_SELECT_VALUE}
            onValueChange={(val) => onContactSelect(val === EMPTY_SELECT_VALUE ? undefined : Number(val))}
            disabled={disabled}
          >
            <SelectTrigger>
              <User className="size-4 text-muted-foreground mr-2" />
              <SelectValue placeholder="Select Contact *" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_SELECT_VALUE}>Select Contact</SelectItem>
              {contacts.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="text-sm text-muted-foreground">No contacts available</div>
        )}
      </TabsContent>
    </Tabs>
  );
}
