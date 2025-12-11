"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Icon,
  IconButton,
  Input,
  SearchableSelect,
  PageContainer,
  SimplePageHeader,
  Spinner,
  Textarea,
  Typography,
  useToast,
} from "@dav033/dav-components";
import type { EvidenceImageRow, RestorationFinalReport } from "@/reports/domain/models";
import { FileInputList } from "../components/FileInputList";
import {
  useRestorationFinalQuery,
  useSubmitRestorationFinalMutation,
} from "../hooks/useRestorationFinal";
import { DatePicker } from "../components/DatePicker";
import { useInstantLeadsByType } from "@/features/leads/presentation/hooks/data/useInstantLeadsByType";
import { useLeadByNumber } from "@/features/leads/presentation/hooks/data/useLeadByNumber";
import { useInstantContacts, useInstantContactsByCompany } from "@/features/contact/presentation/hooks";
import { LeadType } from "@/leads/domain";
import type { Contact } from "@/contact/domain";

const createEmptyEvidence = (): EvidenceImageRow => ({
  description: "",
  imageFiles: [],
  imageUrls: [],
});

const EMPTY_FINAL: RestorationFinalReport = {
  leadNumber: "",
  projectName: "",
  projectLocation: "",
  clientName: "",
  clientType: "",
  customerName: "",
  email: "",
  phone: "",
  completionDate: "",
  overview: "",
  finalEvaluation: "",
  language: "",
  completedActivities: [""],
  evidenceImages: [createEmptyEvidence()],
};

export function RestorationFinalPage() {
  const toast = useToast();
  const [leadInput, setLeadInput] = useState("");
  const [activeLead, setActiveLead] = useState<string | null>(null);
  const [form, setForm] = useState<RestorationFinalReport>(EMPTY_FINAL);

  const { leads: constructionLeads = [], isFetching: leadsLoading } = useInstantLeadsByType(
    LeadType.CONSTRUCTION
  );
  const { contacts: contactsList = [], isFetching: allContactsLoading } = useInstantContacts();
  const inferClientType = (contact?: Contact | null) =>
    contact?.company?.name ? "company" : "individual";

  // Obtener lead completo desde el backend cuando se selecciona
  const leadQuery = useLeadByNumber(activeLead);
  const finalQuery = useRestorationFinalQuery(activeLead);
  const submitMutation = useSubmitRestorationFinalMutation();

  const activeCompanyId = useMemo(
    () => leadQuery.data?.contact?.company?.id ?? leadQuery.data?.contact?.companyId ?? null,
    [leadQuery.data]
  );

  const { contacts: companyContacts = [], isFetching: companyContactsLoading } =
    useInstantContactsByCompany(activeCompanyId);

  const submitting = submitMutation.isPending;

  const hasRemoteData = useMemo(
    () => Boolean(finalQuery.data && (finalQuery.data.projectName || finalQuery.data.customerName)),
    [finalQuery.data]
  );

  // Efecto para rellenar formulario cuando se obtiene el lead desde el backend
  // El endpoint de reports no existe, solo usamos datos del lead
  useEffect(() => {
    if (leadQuery.data) {
      const lead = leadQuery.data;
      const clientType = inferClientType(lead.contact);
      setForm((prev) => ({
        ...prev,
        leadNumber: lead.leadNumber || prev.leadNumber,
        projectName: lead.name || prev.projectName,
        projectLocation: lead.location || prev.projectLocation,
        clientName: lead.contact?.isClient
          ? lead.contact.name
          : lead.contact?.company?.name || prev.clientName,
        customerName: lead.contact?.isCustomer
          ? lead.contact.name
          : lead.contact?.name || prev.customerName,
        email: lead.contact?.email || prev.email,
        phone: lead.contact?.phone || prev.phone,
        clientType: clientType || prev.clientType,
        completionDate: lead.startDate || prev.completionDate,
      }));
    }
  }, [leadQuery.data]);

  const leadOptions = useMemo(
    () =>
      constructionLeads
        .filter((lead) => lead.leadNumber && lead.leadNumber.trim())
        .map((lead) => ({
          value: lead.leadNumber,
          label: `${lead.leadNumber} — ${lead.name}`,
        })),
    [constructionLeads]
  );

  const isCompanyClient = form.clientType === "company";
  const effectiveContacts =
    isCompanyClient && activeCompanyId ? companyContacts : contactsList;
  const contactsLoading =
    isCompanyClient && activeCompanyId ? companyContactsLoading : allContactsLoading;

  const contactOptions = useMemo(
    () =>
      (effectiveContacts ?? []).map((contact) => ({
        value: contact.id != null ? String(contact.id) : contact.name,
        label: contact.name,
      })),
    [effectiveContacts]
  );

  const contactByValue = useMemo(() => {
    const map = new Map<string, Contact>();
    (effectiveContacts ?? []).forEach((contact) => {
      const key = contact.id != null ? String(contact.id) : contact.name;
      map.set(key, contact);
    });
    return map;
  }, [effectiveContacts]);

  const languageOptions = useMemo(
    () => [
      { value: "en", label: "English" },
      { value: "es", label: "Spanish" },
    ],
    []
  );

  const clientTypeOptions = useMemo(
    () => [
      { value: "company", label: "Company" },
      { value: "individual", label: "Individual" },
    ],
    []
  );

  const handleSelectLead = (value: string) => {
    setLeadInput(value);
    setActiveLead(value);
    // El hook useLeadByNumber se encargará de obtener los datos del backend
    // y el useEffect los mapeará al formulario
  };

  const handleSelectContact = (value: string) => {
    const contact = contactByValue.get(String(value));
    setForm((prev) => ({
      ...prev,
      customerName: contact?.name ?? value,
      email: contact?.email ?? "",
      phone: contact?.phone ?? "",
      clientType: inferClientType(contact),
    }));
  };

  const updateField = (field: keyof RestorationFinalReport, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateCompletedActivity = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      completedActivities: prev.completedActivities.map((item, i) =>
        i === index ? value : item
      ),
    }));
  };

  const addCompletedActivity = () => {
    setForm((prev) => ({ ...prev, completedActivities: [...prev.completedActivities, ""] }));
  };

  const deleteCompletedActivity = (index: number) => {
    setForm((prev) => ({
      ...prev,
      completedActivities: prev.completedActivities.filter((_, i) => i !== index),
    }));
  };

  const updateEvidence = (index: number, data: Partial<EvidenceImageRow>) => {
    setForm((prev) => ({
      ...prev,
      evidenceImages: prev.evidenceImages.map((row, i) => (i === index ? { ...row, ...data } : row)),
    }));
  };

  const addEvidence = () => {
    setForm((prev) => ({ ...prev, evidenceImages: [...prev.evidenceImages, createEmptyEvidence()] }));
  };

  const deleteEvidence = (index: number) => {
    setForm((prev) => ({
      ...prev,
      evidenceImages: prev.evidenceImages.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const leadNumber = activeLead || form.leadNumber;
    if (!leadNumber) {
      toast.showError("Select a lead before submitting.");
      return;
    }

    const sanitized: RestorationFinalReport = {
      ...form,
      leadNumber,
      completedActivities: form.completedActivities
        .filter((item) => item?.trim().length)
        .map((i) => i.trim()),
      evidenceImages: form.evidenceImages.map((row) => ({
        description: row.description ?? "",
        imageFiles: row.imageFiles ?? [],
        imageUrls: row.imageUrls ?? [],
      })),
    };

    try {
      const result = await submitMutation.mutateAsync(sanitized);
      toast.showSuccess("Final report submitted successfully.");
      if (result?.redirectUrl) {
        window.open(result.redirectUrl, "_blank");
      }
    } catch (error) {
      console.error(error);
      toast.showError("There was a problem submitting the final report.");
    }
  };

  return (
    <PageContainer className="space-y-8">
      <SimplePageHeader
        title="Restoration Report - Final"
        description="Complete the final report using data obtained by selecting a lead."
      />

      <form onSubmit={handleSubmit} className="space-y-10">
        <section className="rounded-2xl bg-[#1d1d1f] p-6 shadow-sm space-y-4">
          <Typography variant="body" className="font-semibold text-theme-light">
            Search Lead Information
          </Typography>
          <div className="space-y-2">
            <Typography variant="small" className="text-gray-300">
              Construction Leads
            </Typography>
            <SearchableSelect
              options={leadOptions}
              value={leadInput}
              onChange={handleSelectLead}
              placeholder="Search and select lead"
              icon="mdi:magnify"
              disabled={leadsLoading}
            />
          </div>
          {finalQuery.error && (
            <Typography variant="small" className="text-red-400">
              {finalQuery.error.message}
            </Typography>
          )}
          {hasRemoteData && (
            <Typography variant="small" className="text-emerald-400">
              Data preloaded from API for lead {form.leadNumber || activeLead}.
            </Typography>
          )}
        </section>

        <section className="rounded-2xl bg-[#1d1d1f] p-6 shadow-sm space-y-4">
          <Typography variant="body" className="font-semibold text-theme-light">
            General Information
          </Typography>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Project name"
              value={form.projectName}
              onChange={(e) => updateField("projectName", e.target.value)}
            />
            <Input
              label="Project location"
              value={form.projectLocation}
              onChange={(e) => updateField("projectLocation", e.target.value)}
            />
            <Input
              label="Client name"
              value={form.clientName}
              onChange={(e) => updateField("clientName", e.target.value)}
            />
            <div className="space-y-1">
              <Typography variant="small" className="text-gray-300">
                Client type
              </Typography>
              <SearchableSelect
                options={clientTypeOptions}
                value={form.clientType}
                onChange={(value) => updateField("clientType", value)}
                placeholder="Select client type"
                icon="mdi:account-badge"
              />
            </div>
            <div className="space-y-1">
              <Typography variant="small" className="text-gray-300">
                Customer contact
              </Typography>
              <SearchableSelect
                options={contactOptions}
                value={
                  contactOptions.find((c) => c.label === form.customerName)?.value ??
                  form.customerName
                }
                onChange={handleSelectContact}
                placeholder="Select contact"
                icon="mdi:account"
                disabled={contactsLoading}
              />
            </div>
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
            <DatePicker
              label="Completion date"
              value={form.completionDate}
              onChange={(value) => updateField("completionDate", value)}
            />
            <div className="space-y-1">
              <Typography variant="small" className="text-gray-300">
                Language
              </Typography>
              <SearchableSelect
                options={languageOptions}
                value={form.language}
                onChange={(value) => updateField("language", value)}
                placeholder="Select language"
                icon="mdi:translate"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-300">Final evaluation</label>
              <Textarea
                placeholder="Final evaluation summary"
                value={form.finalEvaluation}
                onChange={(e) => updateField("finalEvaluation", e.target.value)}
                rows={5}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-300">Overview</label>
              <Textarea
                placeholder="General summary"
                value={form.overview}
                onChange={(e) => updateField("overview", e.target.value)}
                rows={5}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-[#1d1d1f] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Typography variant="body" className="font-semibold text-theme-light">
              Completed Activities
            </Typography>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<Icon name="mdi:plus" size={16} />}
              onClick={addCompletedActivity}
            >
              Add Activity
            </Button>
          </div>

          <div className="space-y-3">
            {form.completedActivities.map((item, index) => (
              <div key={`completed-${index}`} className="flex items-start gap-2">
                <Input
                  value={item}
                  onChange={(e) => updateCompletedActivity(index, e.target.value)}
                  placeholder="Completed activity"
                  className="flex-1"
                />
                <IconButton
                  aria-label="Delete completed activity"
                  variant="ghost"
                  onClick={() => deleteCompletedActivity(index)}
                  icon={<Icon name="mdi:delete" size={18} />}
                />
              </div>
            ))}
            {form.completedActivities.length === 0 && (
              <Typography variant="small" className="text-gray-400">
                Add at least one completed activity.
              </Typography>
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-[#1d1d1f] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Typography variant="body" className="font-semibold text-theme-light">
              Photographic Evidence
            </Typography>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<Icon name="mdi:plus" size={16} />}
              onClick={addEvidence}
            >
              Add Evidence
            </Button>
          </div>

          <div className="space-y-4">
            {form.evidenceImages.map((row, index) => (
              <div
                key={`evidence-${index}`}
                className="rounded-xl bg-[#18181b] p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <Input
                    label={`Description ${index + 1}`}
                    value={row.description}
                    onChange={(e) => updateEvidence(index, { description: e.target.value })}
                    className="flex-1"
                  />
                  <IconButton
                    aria-label="Delete evidence"
                    variant="ghost"
                    onClick={() => deleteEvidence(index)}
                    icon={<Icon name="mdi:delete" size={18} />}
                  />
                </div>

                <FileInputList
                  label="Add Images"
                  files={row.imageFiles ?? []}
                  existingUrls={row.imageUrls ?? []}
                  onChange={(files) => updateEvidence(index, { imageFiles: files })}
                  onRemoveExisting={(url) =>
                    updateEvidence(index, {
                      imageUrls: (row.imageUrls ?? []).filter((item) => item !== url),
                    })
                  }
                  helperText="Supported formats: images or PDF."
                />
              </div>
            ))}
            {form.evidenceImages.length === 0 && (
              <Typography variant="small" className="text-gray-400">
                Add at least one piece of evidence for the final report.
              </Typography>
            )}
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            loading={submitting}
            leftIcon={<Icon name="mdi:content-save" size={16} />}
          >
            Submit Final Report
          </Button>
          {submitting && (
            <div className="flex items-center gap-2 text-gray-300">
              <Spinner size="sm" /> Sending information...
            </div>
          )}
        </div>
      </form>
    </PageContainer>
  );
}


