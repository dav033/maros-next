import { Button, Modal } from "@/shared/ui";
import { Spinner } from "@/shared/ui/atoms/Spinner";
import type { Lead } from "@/leads/domain";
import { LeadEditForm } from "@/leads/presentation";
import type { Contact } from "@/contact/domain";
import type { ProjectType } from "@/projectType/domain";

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  form: any;
  onFormChange: (key: any, value: any) => void;
  onFormBatchChange?: (fields: any) => void;
  contacts: Contact[];
  projectTypes: ProjectType[];
  isLoading: boolean;
  error: string | null;
  canSubmit: boolean;
  onSubmit: () => void;
}

export function EditLeadModal({
  isOpen,
  onClose,
  lead,
  form,
  onFormChange,
  onFormBatchChange,
  contacts,
  projectTypes,
  isLoading,
  error,
  canSubmit,
  onSubmit,
}: EditLeadModalProps) {
  if (!lead) return null;

  return (
    <Modal
      isOpen={isOpen}
      title="Edit Lead"
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
                Updating...
              </span>
            ) : (
              "Update"
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <LeadEditForm
          form={form}
          onChange={onFormChange}
          onBatchChange={onFormBatchChange}
          projectTypes={projectTypes}
          contacts={contacts}
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
