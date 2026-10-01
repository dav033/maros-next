"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FolderTree, User, Phone, Mail, MapPin, Building, Receipt, StickyNote, DollarSign, Edit, Plus, Save, X, FileText, FileBarChart, Trash2, Undo2, LayoutDashboard, ListTodo, NotebookPen, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { DetailTabsBar, useUrlTabState, type DetailTabDef } from "@/components/shared/DetailTabs";
import Link from "next/link";
import { useProjectsNotesLogic } from "../hooks/notes/useProjectsNotesLogic";
import { useProjectsNotesModalController } from "../hooks/modals/useProjectsNotesModalController";
import { NotesEditorModal, DetailField } from "@/components/shared";
import { MoneyLine } from "../molecules/MoneyLine";
import { formatPercentOfContract } from "../molecules/moneyLineGeometry";
import { ProjectForm } from "../molecules/ProjectForm";
import { useProjectsApp } from "@/di";
import { updateProject, deleteProject, revertProjectToLead, projectsKeys } from "@/project/application";
import type { ProjectPatch } from "@/project/domain";
import { updateLeadNameAction } from "@/features/leads/actions/leadActions";
import { reportActionFailure } from "@/shared/actions/clientResult";
import { updateProjectEstimateAction } from "@/features/project/actions/estimateActions";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatCurrency } from "@/shared/utils";
import { ContactModal } from "@/features/contact/presentation/organisms/ContactModal";
import { useContactModalController } from "@/features/contact/presentation/hooks/controllers/useContactModalController";
import { useContactMutations, initialContactFormValue } from "@/features/contact/presentation/hooks/mutations/useContactMutations";
import { useInstantCompanies } from "@/features/company/presentation/hooks";
import type { ContactFormValue } from "@/contact/domain";
import { toContactPatch } from "@/contact/domain";
import type { Contact as DomainContact } from "@/contact/domain";
import { EntityAttachmentsSection } from "@/features/attachments/presentation/EntityAttachmentsSection";
import { QuickbooksProjectAttachments } from "@/features/quickbooks/presentation/components/QuickbooksProjectAttachments";
import { QuickbooksUnlinkProjectButton } from "@/features/quickbooks/presentation/components/QuickbooksUnlinkProjectButton";
import { QuickbooksLinkProjectButton } from "../organisms/QuickbooksLinkProjectButton";
import { Can } from "@/shared/auth/Can";
import { EntityNotesSection } from "@/features/notes/presentation/organisms/EntityNotesSection";
import { EntityTasksSection } from "@/features/tasks/presentation/organisms/EntityTasksSection";

interface ProjectDetails {
  id: number;
  projectProgressStatus?: string;
  invoiceStatus?: string;
  /** Cliente de QuickBooks vinculado. null cuando el proyecto no se importó desde QuickBooks. */
  qboCustomerId?: string | null;
  attachments?: string[];
  financial?: {
    /** false cuando QuickBooks no conoce este número de proyecto. */
    found?: boolean;
    estimatedAmount?: number;
    invoicedAmount?: number;
    paidAmount?: number;
    outstandingAmount?: number;
    payments?: Array<{
      id?: string;
      date?: string;
      amount: number;
      method?: string;
      reference?: string;
      linkedInvoice?: string;
    }>;
  } | null;
  overview?: string;
  notes?: string[];
  lead?: {
    id: number;
    leadNumber?: string;
    name?: string;
    startDate?: string;
    location?: string;
    addressLink?: string;
    status?: string;
    notes?: string[];
    inReview: boolean;
    /** Estimado guardado en la plataforma (independiente de QuickBooks). */
    estimate?: number | null;
    contact?: {
      id: number;
      name: string;
      phone?: string;
      email?: string;
      occupation?: string;
      address?: string;
      addressLink?: string;
      isCustomer: boolean;
      isClient: boolean;
      company?: {
        id: number;
        name: string;
        address?: string;
        type: any;
        serviceId?: number;
        isCustomer: boolean;
        isClient: boolean;
      } | null;
    } | null;
    projectType?: {
      id: number;
      name: string;
    } | null;
  } | null;
}

interface ProjectDetailsPageProps {
  projectId: number;
  initialData: {
    projectDetails: ProjectDetails | null;
    error?: string;
  };
}

type ProjectFormData = {
  projectProgressStatus?: string;
  overview?: string;
  notes?: string[];
  leadId?: number;
  leadName?: string;
  leadNumber?: string;
};

type Payment = NonNullable<NonNullable<ProjectDetails["financial"]>["payments"]>[number];
type Contact = NonNullable<NonNullable<ProjectDetails["lead"]>["contact"]>;

/**
 * La ficha se agrupa por lo que se viene a buscar, no por lo que hay:
 * «Resumen» es la ficha de siempre (qué es el proyecto, de quién y cuánto dinero
 * mueve); todo lo que viene de QuickBooks —la lista de pagos y sus adjuntos— se
 * va junto a «QuickBooks», que es además lo caro de traer; y tareas, notas y
 * archivos quedan cada uno en el suyo porque son trabajos distintos, no lectura
 * de la ficha.
 */
const PROJECT_TABS = [
  { value: "resumen", label: "Resumen", icon: LayoutDashboard },
  { value: "quickbooks", label: "QuickBooks", icon: Receipt },
  { value: "tareas", label: "Tareas", icon: ListTodo },
  { value: "notas", label: "Notas", icon: NotebookPen },
  { value: "archivos", label: "Archivos", icon: Paperclip },
] as const satisfies readonly DetailTabDef[];

const PROJECT_TAB_VALUES = PROJECT_TABS.map((tab) => tab.value);
const DEFAULT_PROJECT_TAB = "resumen";

function ProjectEditFormWithLeads({
  form,
  onChange,
  disabled,
}: {
  form: ProjectFormData;
  onChange: (key: string, value: any) => void;
  disabled: boolean;
}) {
  return (
    <ProjectForm
      form={form}
      onChange={onChange}
      leads={[]}
      disabled={disabled}
      isEditMode
    />
  );
}

function toAmount(value: number | undefined | null): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * El estimate que manda es el guardado en la plataforma; el de QuickBooks solo
 * se usa mientras no haya uno propio. Antes se leía solo QuickBooks, así que un
 * monto guardado sin sincronizar no se veía y parecía que no se había guardado.
 * `found: false` significa que QuickBooks no conoce el proyecto: sus ceros no
 * son una cifra, son la ausencia de dato.
 */
function resolveEstimate(
  lead: ProjectDetails["lead"],
  financial: ProjectDetails["financial"],
): number | null {
  const crm = toAmount(lead?.estimate);
  if (crm !== null) return crm;
  if (financial?.found === false) return null;
  return toAmount(financial?.estimatedAmount);
}

/** Contracted work still to invoice. */
function computeBacklog(
  financial: ProjectDetails["financial"],
  estimate: number | null,
): number | null {
  const invoiced = toAmount(financial?.invoicedAmount);
  return estimate !== null && invoiced !== null ? estimate - invoiced : null;
}

/**
 * One project, so there is nothing to compare it against: the axis stays elastic and
 * an overrun shows its real length, unlike the projects list, which pins the axis so
 * the contract marker lands on the same x in every row.
 *
 * There is no spend lane here. GET /projects/:id/details enriches with the QuickBooks
 * full profile, which returns estimated / invoiced / paid / outstanding but never job
 * costing, so cash out is simply not available on this screen.
 */
function ProjectMoneySummary({
  name,
  estimate,
  invoiced,
  collected,
  outstanding,
  backlog,
}: {
  name?: string;
  estimate: number | null;
  invoiced: number | null;
  collected: number | null;
  outstanding: number | null;
  backlog: number | null;
}) {
  const hasContract = estimate !== null && estimate > 0;
  const rows: Array<{ label: string; value: number | null }> = [
    { label: "Contract", value: estimate },
    { label: "Invoiced", value: invoiced },
    { label: "Collected", value: collected },
    { label: "Outstanding", value: outstanding },
  ];

  return (
    <div className="rounded-xl bg-elev-1 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Contract vs cash
      </h3>
      <MoneyLine
        className="mt-3"
        estimate={estimate}
        collected={collected}
        backlog={backlog}
        label={name}
      />
      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {rows.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</dt>
            <dd className="font-mono text-sm font-semibold tabular-nums">
              {value === null ? "—" : formatCurrency(value)}
            </dd>
            <dd className="text-[10px] text-muted-foreground">
              {value === null || !hasContract
                ? "—"
                : `${formatPercentOfContract((value / estimate) * 100)} of contract`}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * `/projects/:id/details` devuelve las transacciones de QuickBooks tal cual las da la
 * API (`txnDate`, `totalAmount`, `linkedTxn`), mientras que `/projects/financials`
 * devuelve la fila ya recortada (`date`, `amount`, `linkedInvoice`). La tabla leía solo
 * la segunda forma, así que un proyecto abierto desde su propia página mostraba una fila
 * de guiones para un pago que sí existe.
 */
function toPaymentRows(input: unknown): Payment[] {
  if (!Array.isArray(input)) return [];

  const rows: Payment[] = [];
  for (const row of input) {
    if (!row || typeof row !== "object") continue;
    const rec = row as Record<string, unknown>;

    const rawAmount = rec.amount ?? rec.totalAmount;
    const amount =
      typeof rawAmount === "number" ? rawAmount : parseFloat(String(rawAmount ?? ""));
    if (!Number.isFinite(amount)) continue;

    const linkedTxn = Array.isArray(rec.linkedTxn) ? rec.linkedTxn : [];
    const invoice = linkedTxn.find(
      (txn): txn is { txnId?: unknown } =>
        !!txn && typeof txn === "object" && (txn as { txnType?: unknown }).txnType === "Invoice",
    );

    const text = (value: unknown) =>
      typeof value === "string" && value.trim() !== "" ? value : undefined;

    rows.push({
      id: text(rec.id) ?? text(rec.entityId),
      date: text(rec.date) ?? text(rec.txnDate),
      amount,
      method: text(rec.method) ?? text(rec.paymentMethod),
      reference: text(rec.reference) ?? text(rec.docNumber),
      linkedInvoice: text(rec.linkedInvoice) ?? text(invoice?.txnId),
    });
  }
  return rows;
}

function PaymentsTable({ payments }: { payments: Payment[] }) {
  if (!payments.length) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-md border border-dashed border-line">
        <DollarSign className="size-4 text-muted-foreground" />
        <div>
          <p className="text-sm text-muted-foreground">Payments List</p>
          <p className="text-xs text-muted-foreground">No payment rows received from QuickBooks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <div className="max-h-64 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-elev-3">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Date</th>
              <th className="px-3 py-2 text-left font-medium">Method</th>
              <th className="px-3 py-2 text-left font-medium">Reference</th>
              <th className="px-3 py-2 text-left font-medium">Invoice</th>
              <th className="px-3 py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => (
              <tr key={payment.id ?? `${index}-${payment.amount}`} className="border-t">
                <td className="px-3 py-2">{payment.date || "-"}</td>
                <td className="px-3 py-2">{payment.method || "-"}</td>
                <td className="px-3 py-2">{payment.reference || "-"}</td>
                <td className="px-3 py-2">{payment.linkedInvoice || "-"}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(payment.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProjectContactCard({ contact, onEdit }: { contact: Contact; onEdit: () => void }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <User className="size-5" />
          Contact
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="text-muted-foreground hover:text-foreground"
        >
          <Edit className="size-4 mr-2" />
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Link
            href={`/contact/${contact.id}`}
            className="text-lg font-semibold text-foreground hover:underline"
          >
            {contact.name}
          </Link>
          {contact.occupation && (
            <p className="text-sm text-muted-foreground mt-1">{contact.occupation}</p>
          )}
        </div>
        <DetailField
          icon={Phone}
          label="Phone"
          value={contact.phone}
          onAdd={onEdit}
        />
        <DetailField
          icon={Mail}
          label="Email"
          value={contact.email}
          isEmail
          onAdd={onEdit}
        />
        <DetailField
          icon={MapPin}
          label="Address"
          value={contact.address}
          onAdd={onEdit}
        />
        <DetailField
          icon={Building}
          label="Company"
          value={contact.company?.name}
          onAdd={onEdit}
        >
          {contact.company && (
            <Link
              href={`/company/${contact.company.id}`}
              className="text-foreground hover:underline"
            >
              {contact.company.name}
            </Link>
          )}
        </DetailField>
        <div className="flex items-center gap-2 pt-2">
          {contact.isCustomer && <Badge variant="secondary">Customer</Badge>}
          {contact.isClient && <Badge variant="secondary">Client</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectDetailsPage({ projectId, initialData }: ProjectDetailsPageProps) {
  const router = useRouter();
  const { projectDetails, error } = initialData;
  const app = useProjectsApp();
  const queryClient = useQueryClient();
  const { companies } = useInstantCompanies();
  const { updateContactMutation } = useContactMutations();

  const { activeTab, setActiveTab } = useUrlTabState(PROJECT_TAB_VALUES, DEFAULT_PROJECT_TAB);

  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectFormData>({});
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isReverting, setIsReverting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRevertToLead = useCallback(async () => {
    if (!projectDetails || typeof projectDetails.id !== "number") return;
    const confirmed = window.confirm(
      "Revert this project back to a lead? The project will be deleted and the lead status will be set to FOLLOW_UP.",
    );
    if (!confirmed) return;
    setIsReverting(true);
    try {
      const { leadId } = await revertProjectToLead(app, projectDetails.id);
      toast.success("Project reverted to lead.");
      router.push(`/lead/${leadId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not revert project to lead");
    } finally {
      setIsReverting(false);
    }
  }, [projectDetails, app, router]);

  const handleDeleteProject = useCallback(async () => {
    if (!projectDetails || typeof projectDetails.id !== "number") return;
    const confirmed = window.confirm(
      "Delete this project? The associated lead will also be deleted. This cannot be undone.",
    );
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      await deleteProject(app, projectDetails.id);
      toast.success("Project and lead deleted.");
      router.push("/projects");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete project");
    } finally {
      setIsDeleting(false);
    }
  }, [projectDetails, app, router]);

  // La ficha se pinta con datos del servidor, así que además de invalidar las
  // claves del proyecto hay que volver a pedir el render para ver el cambio.
  // Toda la rama `projects`: las cifras de QuickBooks de la tabla de proyectos
  // cuelgan de `[...projectsKeys.all, "financials"]`, que ni el detalle ni las
  // listas arrastran, así que sin esto la tabla seguiría mostrando las viejas.
  const handleQboUnlinked = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: projectsKeys.all });
    router.refresh();
  }, [queryClient, router]);

  // Enlazar mueve exactamente lo mismo que desenlazar, en el otro sentido.
  const handleQboLinked = handleQboUnlinked;

  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  const [isEditingEstimate, setIsEditingEstimate] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState("");
  const [isSavingEstimate, setIsSavingEstimate] = useState(false);

  const handleStartEditingEstimate = useCallback(() => {
    const current = resolveEstimate(projectDetails?.lead, projectDetails?.financial);
    setEditingEstimate(current === null ? "" : String(current));
    setIsEditingEstimate(true);
  }, [projectDetails]);

  const handleCancelEditingEstimate = useCallback(() => {
    setIsEditingEstimate(false);
    setEditingEstimate("");
  }, []);

  const handleSaveEstimate = useCallback(async () => {
    if (!projectDetails || typeof projectDetails.id !== "number") return;
    const amount = Number(editingEstimate);
    if (!Number.isFinite(amount) || amount < 0) {
      toast.error("Enter a valid amount (0 or greater).");
      return;
    }
    setIsSavingEstimate(true);
    try {
      const result = await updateProjectEstimateAction(projectDetails.id, amount);
      if (!result.success) throw new Error(result.error);
      setIsEditingEstimate(false);
      if (result.data.synced) {
        toast.success("Estimate saved and synced to QuickBooks.");
      } else {
        // El monto quedó guardado: decirlo, y por qué QuickBooks no lo tomó.
        toast.warning(
          result.data.syncError
            ? `Estimate saved. QuickBooks was not updated: ${result.data.syncError}`
            : "Estimate saved. QuickBooks was not updated.",
          { duration: 8000 },
        );
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update estimate");
    } finally {
      setIsSavingEstimate(false);
    }
  }, [projectDetails, editingEstimate, router]);

  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactFormValue, setContactFormValue] = useState<ContactFormValue>(initialContactFormValue);
  const [contactFormError, setContactFormError] = useState<string | null>(null);

  const handleStartEditingName = useCallback(() => {
    setEditingName(projectDetails?.lead?.name ?? "");
    setIsEditingName(true);
  }, [projectDetails]);

  const handleSaveName = useCallback(async () => {
    const leadId = projectDetails?.lead?.id;
    if (!leadId || !editingName.trim()) return;
    setIsSavingName(true);
    try {
      const result = await updateLeadNameAction(leadId, editingName);
      if (!result.success) throw new Error(reportActionFailure(result));
      setIsEditingName(false);
      toast.success("Project name updated!");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update name");
    } finally {
      setIsSavingName(false);
    }
  }, [projectDetails, editingName, router]);

  const notesLogic = useProjectsNotesLogic({
    refetch: async () => {
      router.refresh();
    },
  });

  const handleStartEditingProject = useCallback(() => {
    if (projectDetails) {
      setEditingProject({
        projectProgressStatus: projectDetails.projectProgressStatus,
        overview: projectDetails.overview ?? "",
        notes: projectDetails.notes,
        leadId: projectDetails.lead?.id,
        leadName: projectDetails.lead?.name,
        leadNumber: projectDetails.lead?.leadNumber,
      });
      setIsEditingProject(true);
    }
  }, [projectDetails]);

  const handleCancelEditingProject = useCallback(() => {
    setIsEditingProject(false);
    setEditingProject({});
  }, []);

  const handleSaveProjectInline = useCallback(async () => {
    if (!projectDetails || typeof projectDetails.id !== "number") return;

    setIsSavingProject(true);
    try {
      const patch: ProjectPatch = {
        projectProgressStatus: editingProject.projectProgressStatus as ProjectPatch["projectProgressStatus"],
        overview: editingProject.overview?.trim() || undefined,
        notes: editingProject.notes,
        leadId: editingProject.leadId ?? projectDetails.lead?.id,
        leadName: editingProject.leadName?.trim() || undefined,
        leadNumber: editingProject.leadNumber?.trim() || undefined,
      };

      await updateProject(app, projectDetails.id, patch);
      setIsEditingProject(false);
      setEditingProject({});
      toast.success("Project updated successfully!");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update project";
      toast.error(message);
    } finally {
      setIsSavingProject(false);
    }
  }, [projectDetails, editingProject, app, router]);

  const handleOpenNotesModal = useCallback(() => {
    if (projectDetails && projectDetails.lead) {
      const projectWithLead = {
        ...projectDetails,
        lead: {
          ...projectDetails.lead,
          name: projectDetails.lead.name || "Project",
        },
      };
      notesLogic.openFromProject(projectWithLead as any);
    }
  }, [projectDetails, notesLogic]);

  const notesModalController = useProjectsNotesModalController({
    isOpen: notesLogic.modalProps.isOpen,
    title: notesLogic.modalProps.title,
    notes: notesLogic.modalProps.notes,
    onChangeNotes: notesLogic.modalProps.onChangeNotes,
    onClose: notesLogic.modalProps.onClose,
    onSave: notesLogic.modalProps.onSave,
    loading: notesLogic.modalProps.loading,
  });

  const handleOpenEditContact = useCallback(() => {
    const contact = projectDetails?.lead?.contact;
    if (!contact) return;
    setContactFormValue({
      name: contact.name ?? "",
      phone: contact.phone ?? "",
      email: contact.email ?? "",
      occupation: contact.occupation ?? "",
      role: undefined,
      addressLink: contact.addressLink ?? "",
      address: contact.address ?? "",
      isCustomer: contact.isCustomer,
      isClient: contact.isClient,
      companyId: contact.company?.id ?? null,
      note: "",
    });
    setContactFormError(null);
    setIsEditingContact(true);
  }, [projectDetails]);

  const handleCloseEditContact = useCallback(() => {
    if (updateContactMutation.isPending) return;
    setIsEditingContact(false);
    setContactFormError(null);
  }, [updateContactMutation.isPending]);

  const handleSubmitEditContact = useCallback(async () => {
    const contact = projectDetails?.lead?.contact;
    if (!contact) return;
    setContactFormError(null);
    try {
      const currentForPatch = {
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        occupation: contact.occupation,
        address: contact.address,
        addressLink: contact.addressLink,
        isCustomer: contact.isCustomer,
        isClient: contact.isClient,
        companyId: contact.company?.id ?? null,
      } as unknown as DomainContact;
      const patch = toContactPatch(currentForPatch, contactFormValue);
      await updateContactMutation.mutateAsync({ id: contact.id, patch });
      setIsEditingContact(false);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not update contact";
      setContactFormError(message);
    }
  }, [projectDetails, contactFormValue, updateContactMutation, router]);

  const contactModalController = useContactModalController({
    mode: isEditingContact ? "edit" : "list",
    closeModal: handleCloseEditContact,
    handleCreateSubmit: () => {},
    handleEditSubmit: handleSubmitEditContact,
    formValue: contactFormValue,
    handleFormChange: setContactFormValue,
    isPending: updateContactMutation.isPending,
    serverError: contactFormError,
  });

  if (error || !projectDetails) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="size-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error loading project</CardTitle>
            <CardDescription>
              {error || "Could not load project information"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Project with ID {projectId} does not exist or could not be found.
              Please verify that the ID is correct.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lead = projectDetails.lead;
  const resolvedEstimate = resolveEstimate(lead, projectDetails.financial);
  const paymentRows = toPaymentRows(projectDetails.financial?.payments);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Project {lead?.leadNumber && `#${lead.leadNumber}`}
            </h1>
            {isEditingName ? (
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") setIsEditingName(false);
                  }}
                  className="h-7 text-sm w-64"
                  disabled={isSavingName}
                  autoFocus
                />
                <Button size="sm" variant="ghost" onClick={handleSaveName} disabled={isSavingName || !editingName.trim()}>
                  <Save className="size-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditingName(false)} disabled={isSavingName}>
                  <X className="size-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1 mt-1 group">
                <p className="text-muted-foreground">{lead?.name ?? "Unnamed project"}</p>
                {lead?.id && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleStartEditingName}
                  >
                    <Edit className="size-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {projectDetails.projectProgressStatus && (
            <Badge variant="outline">{projectDetails.projectProgressStatus}</Badge>
          )}
          {projectDetails.invoiceStatus && (
            <Badge variant="outline">{projectDetails.invoiceStatus}</Badge>
          )}
          {/* El reporte ya no depende de que haya un vínculo guardado: cuando
              no lo hay, el backend resuelve el cliente de QuickBooks por número
              de proyecto, igual que el resto de esta ficha. Por eso el botón va
              siempre habilitado y sin la advertencia que antes avisaba de un
              "no enlazado" que el propio dueño desmentía viendo aquí mismo sus
              facturas de QuickBooks. Si no hay ni vínculo ni coincidencia por
              número, la pantalla del reporte lo explica con el 409. */}
          <Button asChild variant="outline" size="sm">
            <Link href={`/project/${projectId}/report`}>
              <FileBarChart className="size-4 mr-2" />
              Llévame al reporte
            </Link>
          </Button>
          <Can permission="projects:write">
            <QuickbooksLinkProjectButton
              projectId={projectId}
              projectNumber={lead?.leadNumber ?? null}
              qboCustomerId={projectDetails.qboCustomerId ?? null}
              onLinked={handleQboLinked}
              disabled={isReverting || isDeleting}
            />
          </Can>
          {projectDetails.qboCustomerId && (
            <Can permission="projects:write">
              <QuickbooksUnlinkProjectButton
                projectId={projectId}
                qboCustomerId={projectDetails.qboCustomerId}
                onUnlinked={handleQboUnlinked}
                disabled={isReverting || isDeleting}
              />
            </Can>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRevertToLead}
            disabled={isReverting || isDeleting}
          >
            <Undo2 className="size-4 mr-2" />
            {isReverting ? "Reverting..." : "Revert to Lead"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteProject}
            disabled={isDeleting || isReverting}
          >
            <Trash2 className="size-4 mr-2" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* La cabecera de arriba queda fuera de <Tabs>: el título, el estado y las
          acciones (reporte, enlazar/desvincular QuickBooks, revertir, borrar)
          siguen a la vista en todas las pestañas. */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <DetailTabsBar tabs={PROJECT_TABS} />

        <TabsContent value="resumen" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FolderTree className="size-5" />
                    Project Information
                  </CardTitle>
                  {isEditingProject ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEditingProject}
                        disabled={isSavingProject}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSaveProjectInline}
                        disabled={isSavingProject}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Save className="size-4 mr-2" />
                        {isSavingProject ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleStartEditingProject}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Edit className="size-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditingProject ? (
                    <ProjectEditFormWithLeads
                      form={editingProject}
                      onChange={(key, value) => setEditingProject((prev) => ({ ...prev, [key]: value }))}
                      disabled={isSavingProject}
                    />
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <DetailField
                          icon={Receipt}
                          label="Estimate Amount"
                        >
                          {isEditingEstimate ? (
                            <div>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  autoFocus
                                  value={editingEstimate}
                                  onChange={(e) => setEditingEstimate(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      void handleSaveEstimate();
                                    } else if (e.key === "Escape") {
                                      e.preventDefault();
                                      handleCancelEditingEstimate();
                                    }
                                  }}
                                  disabled={isSavingEstimate}
                                  className="h-8 w-32"
                                  placeholder="0.00"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-green-600 hover:text-green-700"
                                  onClick={handleSaveEstimate}
                                  disabled={isSavingEstimate}
                                  aria-label="Save estimate"
                                >
                                  <Save className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-muted-foreground"
                                  onClick={handleCancelEditingEstimate}
                                  disabled={isSavingEstimate}
                                  aria-label="Cancel"
                                >
                                  <X className="size-4" />
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                This is the project&apos;s total estimate. It is saved here and
                                synced to QuickBooks when the project is linked to a job.
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-lg">
                                {resolvedEstimate === null
                                  ? "—"
                                  : formatCurrency(resolvedEstimate)}
                              </p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 text-muted-foreground hover:text-foreground"
                                onClick={handleStartEditingEstimate}
                                aria-label="Edit estimate"
                              >
                                <Edit className="size-3.5" />
                              </Button>
                            </div>
                          )}
                        </DetailField>

                        <DetailField
                          icon={DollarSign}
                          label="Payments"
                          value={projectDetails.financial?.paidAmount}
                        >
                          {typeof projectDetails.financial?.paidAmount === "number" ? (
                            <p className="font-semibold text-lg">
                              {formatCurrency(projectDetails.financial.paidAmount)}
                            </p>
                          ) : null}
                        </DetailField>
                      </div>

                      <Separator />
                      <ProjectMoneySummary
                        name={lead?.name}
                        estimate={resolvedEstimate}
                        invoiced={toAmount(projectDetails.financial?.invoicedAmount)}
                        collected={toAmount(projectDetails.financial?.paidAmount)}
                        outstanding={toAmount(projectDetails.financial?.outstandingAmount)}
                        backlog={computeBacklog(projectDetails.financial, resolvedEstimate)}
                      />

                      <Separator />
                      <DetailField
                        icon={FileText}
                        label="Project Overview"
                        value={projectDetails.overview}
                        onAdd={handleStartEditingProject}
                      />

                      <Separator />
                      <DetailField
                        icon={StickyNote}
                        label="Quick notes"
                        value={projectDetails.notes && projectDetails.notes.length > 0 ? "has-notes" : undefined}
                        onAdd={handleOpenNotesModal}
                      >
                        {projectDetails.notes && projectDetails.notes.length > 0 ? (
                          <ul className="space-y-1 mt-1">
                            {projectDetails.notes.map((note, index) => (
                              <li key={index} className="text-sm text-foreground">
                                • {note}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </DetailField>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              {lead?.contact ? (
                <ProjectContactCard
                  contact={lead.contact}
                  onEdit={handleOpenEditContact}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="size-5" />
                      Contact
                    </CardTitle>
                    <CardDescription>
                      This project has no associated contact
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/contacts?create`)}
                      className="w-full"
                    >
                      <Plus className="size-4 mr-2" />
                      Create Contact
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Todo lo que llega de QuickBooks, junto. Radix desmonta el panel
            inactivo, así que ni la lista de pagos ni los adjuntos (la consulta
            lenta de la ficha) se piden hasta que se abre esta pestaña. */}
        <TabsContent value="quickbooks" className="mt-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="size-4" />
                Payments list
              </CardTitle>
              <CardDescription>Pagos registrados en QuickBooks para este proyecto.</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentsTable payments={paymentRows} />
            </CardContent>
          </Card>

          {lead?.leadNumber ? (
            <QuickbooksProjectAttachments projectNumber={lead.leadNumber} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Paperclip className="size-4" />
                  QuickBooks attachments
                </CardTitle>
                <CardDescription>
                  Este proyecto no tiene número, así que no hay nada que buscar en QuickBooks.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tareas" className="mt-0">
          <EntityTasksSection
            entityKind="project"
            entityId={projectDetails.id}
            entityLabel={projectDetails.lead?.name}
          />
        </TabsContent>

        <TabsContent value="notas" className="mt-0">
          <EntityNotesSection
            entityKind="project"
            entityId={projectDetails.id}
            defaultTitle={projectDetails.lead?.name || undefined}
          />
        </TabsContent>

        <TabsContent value="archivos" className="mt-0">
          <EntityAttachmentsSection
            entityKind="project"
            entityId={projectDetails.id}
            attachments={projectDetails.attachments ?? []}
            onAttachmentsChange={async (newAttachments) => {
              await updateProject(app, projectDetails.id, { attachments: newAttachments });
              router.refresh();
            }}
          />
        </TabsContent>
      </Tabs>

      <NotesEditorModal controller={notesModalController} />

      <ContactModal
        controller={contactModalController}
        companies={companies ?? []}
      />
    </div>
  );
}
