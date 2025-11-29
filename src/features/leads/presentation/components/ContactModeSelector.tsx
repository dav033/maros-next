"use client";

import { Icon, Input } from "@/shared/ui";

enum ContactMode {
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
    <div>
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-lg border border-theme-gray bg-theme-dark p-1">
          <button
            type="button"
            onClick={() => onContactModeChange(ContactMode.NEW_CONTACT)}
            disabled={disabled}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              contactMode === ContactMode.NEW_CONTACT
                ? "bg-[var(--color-primary)] text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            New Contact
          </button>
          <button
            type="button"
            onClick={() => onContactModeChange(ContactMode.EXISTING_CONTACT)}
            disabled={disabled}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              contactMode === ContactMode.EXISTING_CONTACT
                ? "bg-[var(--color-primary)] text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Existing Contact
          </button>
        </div>
      </div>

      {contactMode === ContactMode.NEW_CONTACT && (
        <div className="space-y-3">
          <Input
            value={form.contactName}
            onChange={(e) => onChange("contactName", e.target.value)}
            placeholder="Contact Name *"
            leftAddon={<Icon name="material-symbols:person" />}
            disabled={disabled}
          />
          <Input
            value={form.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="Phone"
            leftAddon={<Icon name="material-symbols:settings-phone-sharp" />}
            disabled={disabled}
          />
          <Input
            value={form.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="Email"
            leftAddon={<Icon name="material-symbols:attach-email-outline" />}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}

export { ContactMode };
