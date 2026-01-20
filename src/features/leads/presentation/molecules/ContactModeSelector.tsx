"use client";

import type { ChangeEvent } from "react";
import { User, Phone, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export enum ContactMode {
  NEW_CONTACT = "NEW_CONTACT",
  EXISTING_CONTACT = "EXISTING_CONTACT",
}

type NewContactForm = {
  contactName: string;
  phone: string;
  email: string;
};

type ContactModeSelectorProps = {
  contactMode: ContactMode;
  onContactModeChange: (mode: ContactMode) => void;
  form: NewContactForm;
  onChange: <K extends keyof NewContactForm>(key: K, value: NewContactForm[K]) => void;
  disabled?: boolean;
};

export function ContactModeSelector({
  contactMode,
  onContactModeChange,
  form,
  onChange,
  disabled = false,
}: ContactModeSelectorProps) {
  return (
    <Tabs
      value={contactMode}
      onValueChange={(value) => onContactModeChange(value as ContactMode)}
      className="w-full"
    >
      <div className="flex justify-center mb-4">
        <TabsList>
          <TabsTrigger value={ContactMode.NEW_CONTACT} disabled={disabled}>
            New Contact
          </TabsTrigger>
          <TabsTrigger value={ContactMode.EXISTING_CONTACT} disabled={disabled}>
            Existing Contact
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value={ContactMode.NEW_CONTACT} className="space-y-3 mt-0">
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

      <TabsContent value={ContactMode.EXISTING_CONTACT} className="mt-0">
        {/* Content for existing contact is rendered by parent */}
      </TabsContent>
    </Tabs>
  );
}
