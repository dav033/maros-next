import { Button, Modal } from "@/shared/ui";
import { Spinner } from "@/shared/ui/atoms/Spinner";
import { ContactModeSelector, ContactMode, LeadForm } from "@/leads/presentation";
import type { Contact } from "@/contact/domain";
import type { ProjectType } from "@/projectType/domain";

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  form: any;
  onFormChange: (key: any, value: any) => void;
  contactMode: ContactMode;
  onContactModeChange: (mode: ContactMode) => void;
  contacts: Contact[];
  projectTypes: ProjectType[];
  isLoading: boolean;
  error: string | null;
  canSubmit: boolean;
  onSubmit: () => void;
  ContactMode: typeof ContactMode;
}

export function CreateLeadModal({
  isOpen,
  onClose,
  title,
  form,
  onFormChange,
  contactMode,
  onContactModeChange,
  contacts,
  projectTypes,
  isLoading,
  error,
  canSubmit,
  onSubmit,
  ContactMode,
}: CreateLeadModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onSubmit}
            disabled={!canSubmit || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                Creating...
              </span>
            ) : (
              "Create"
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <ContactModeSelector
          contactMode={contactMode}
          onContactModeChange={onContactModeChange}
          form={{
            contactName: form.contactName ?? "",
            phone: form.phone ?? "",
            email: form.email ?? "",
          }}
          onChange={(key, value) => onFormChange(key as any, value)}
          disabled={isLoading}
        />
        <LeadForm
          form={form}
          onChange={onFormChange}
          projectTypes={projectTypes}
          contacts={contacts
            .filter((c): c is Contact & { id: number } => typeof c.id === "number")
            .map((c) => ({ id: c.id as number, name: c.name, phone: c.phone, email: c.email }))}
          showContactSelect={contactMode === ContactMode.EXISTING_CONTACT}
          disabled={isLoading}
        />
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
            <span className="mt-0.5 text-red-400">!</span>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
