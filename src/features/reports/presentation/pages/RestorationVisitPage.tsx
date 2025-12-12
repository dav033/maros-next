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
import type { ActivityRow, RestorationVisitReport } from "@/reports/domain/models";
import { FileInputList } from "../components/FileInputList";
import {
  useRestorationVisitQuery,
  useSubmitRestorationVisitMutation,
} from "../hooks/useRestorationVisit";
import { DatePicker } from "../components/DatePicker";
import { useInstantProjects } from "@/features/project/presentation/hooks/data/useInstantProjects";
import { useProjectsApp } from "@/di";
import { getProjectById } from "@/features/project/application/usecases/queries/getProjectById";
import { useInstantContacts, useInstantContactsByCompany } from "@/features/contact/presentation/hooks";
import { useInstantCompanies } from "@/features/company/presentation/hooks/data/useInstantCompanies";
import type { Contact } from "@/contact/domain";

const createEmptyActivity = (): ActivityRow => ({
  activity: "",
  imageFiles: [],
  imageUrls: [],
});

const EMPTY_VISIT: RestorationVisitReport = {
  leadNumber: "",
  projectNumber: "",
  projectName: "",
  projectLocation: "",
  clientName: "",
  clientType: "",
  customerName: "",
  email: "",
  phone: "",
  dateStarted: "",
  overview: "",
  language: "",
  activities: [createEmptyActivity()],
  additionalActivities: [],
  nextActivities: [],
  observations: [],
};

export function RestorationVisitPage() {
  const toast = useToast();
  const [projectInput, setProjectInput] = useState("");
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [form, setForm] = useState<RestorationVisitReport>(EMPTY_VISIT);
  const projectsApp = useProjectsApp();

  const { projects = [], isFetching: projectsLoading } = useInstantProjects();
  const { contacts: contactsList = [], isFetching: allContactsLoading } = useInstantContacts();
  const { companies = [], isFetching: companiesLoading } = useInstantCompanies();
  const inferClientType = (contact?: Contact | null) =>
    contact?.company?.name ? "company" : "individual";

  // Obtener proyecto completo desde el backend cuando se selecciona
  const [project, setProject] = useState<any>(null);
  const [projectLoading, setProjectLoading] = useState(false);
  
  useEffect(() => {
    if (activeProjectId) {
      setProjectLoading(true);
      getProjectById(projectsApp, activeProjectId)
        .then((proj) => {
          setProject(proj);
          setProjectLoading(false);
        })
        .catch(() => {
          setProject(null);
          setProjectLoading(false);
        });
    } else {
      setProject(null);
    }
  }, [activeProjectId, projectsApp]);

  const visitQuery = useRestorationVisitQuery(project?.id || null);
  const submitMutation = useSubmitRestorationVisitMutation();

  const activeCompanyId = useMemo(
    () => project?.lead?.contact?.company?.id ?? project?.lead?.contact?.companyId ?? null,
    [project]
  );

  const { contacts: companyContacts = [], isFetching: companyContactsLoading } =
    useInstantContactsByCompany(activeCompanyId);

  const submitting = submitMutation.isPending;

  const hasRemoteData = useMemo(
    () => Boolean(visitQuery.data && (visitQuery.data.projectName || visitQuery.data.customerName)),
    [visitQuery.data]
  );

  // Efecto para rellenar formulario cuando se obtiene el proyecto desde el backend
  useEffect(() => {
    if (project) {
      const lead = project.lead;
      const clientType = inferClientType(lead?.contact);
      setForm((prev) => ({
        ...prev,
        leadNumber: lead?.leadNumber || prev.leadNumber,
        projectNumber: lead?.leadNumber || prev.projectNumber,
        projectName: lead?.name || project.overview || prev.projectName,
        projectLocation: lead?.location || prev.projectLocation,
        clientName: lead?.contact?.company?.name 
          ? lead.contact.company.name
          : lead?.contact?.isClient
          ? lead.contact.name
          : prev.clientName,
        customerName: lead?.contact?.isCustomer
          ? lead.contact.name
          : lead?.contact?.name || prev.customerName,
        email: lead?.contact?.email || prev.email,
        phone: lead?.contact?.phone || prev.phone,
        clientType: clientType || prev.clientType,
        dateStarted: lead?.startDate || prev.dateStarted,
        overview: project.overview || prev.overview,
      }));
    }
  }, [project]);

  const projectOptions = useMemo(
    () =>
      projects
        .filter((proj) => proj.lead?.leadNumber && proj.lead.leadNumber.trim())
        .map((proj) => ({
          value: String(proj.id),
          label: `${proj.lead.leadNumber} — ${proj.lead.name || proj.overview || 'Project'}`,
        })),
    [projects]
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

  const companyOptions = useMemo(
    () =>
      companies.map((company) => ({
        value: company.name,
        label: company.name,
      })),
    [companies]
  );

  const handleSelectProject = (value: string) => {
    setProjectInput(value);
    setActiveProjectId(value ? parseInt(value, 10) : null);
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

  const updateField = (field: keyof RestorationVisitReport, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateActivityRow = (
    listKey: "activities" | "additionalActivities",
    index: number,
    data: Partial<ActivityRow>
  ) => {
    setForm((prev) => ({
      ...prev,
      [listKey]: prev[listKey].map((row, i) => (i === index ? { ...row, ...data } : row)),
    }));
  };

  const addActivityRow = (listKey: "activities" | "additionalActivities") => {
    setForm((prev) => ({
      ...prev,
      [listKey]: [...prev[listKey], createEmptyActivity()],
    }));
  };

  const deleteActivityRow = (listKey: "activities" | "additionalActivities", index: number) => {
    setForm((prev) => ({
      ...prev,
      [listKey]: prev[listKey].filter((_, i) => i !== index),
    }));
  };

  const updateStringList = (
    key: "nextActivities" | "observations",
    index: number,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addStringItem = (key: "nextActivities" | "observations") => {
    setForm((prev) => ({ ...prev, [key]: [...prev[key], ""] }));
  };

  const deleteStringItem = (key: "nextActivities" | "observations", index: number) => {
    setForm((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const leadNumber = project?.lead?.leadNumber || form.leadNumber;
    if (!leadNumber) {
      toast.showError("Select a project before submitting.");
      return;
    }

    const sanitized: RestorationVisitReport = {
      ...form,
      leadNumber,
      activities: form.activities.map((row) => ({
        activity: row.activity ?? "",
        imageFiles: row.imageFiles ?? [],
        imageUrls: row.imageUrls ?? [],
      })),
      additionalActivities: form.additionalActivities.map((row) => ({
        activity: row.activity ?? "",
        imageFiles: row.imageFiles ?? [],
        imageUrls: row.imageUrls ?? [],
      })),
      nextActivities: form.nextActivities.filter((item) => item?.trim().length).map((i) => i.trim()),
      observations: form.observations.filter((item) => item?.trim().length).map((i) => i.trim()),
    };

    try {
      const result = await submitMutation.mutateAsync(sanitized);
      toast.showSuccess("Report submitted successfully.");
      if (result?.redirectUrl) {
        window.open(result.redirectUrl, "_blank");
      }
    } catch (error) {
      console.error(error);
      toast.showError("There was a problem submitting the report. Please try again.");
    }
  };

  return (
    <PageContainer className="space-y-8">
      <SimplePageHeader
        title="Restoration Report - Visit"
        description="Load and complete the report information using the project."
      />

      <form onSubmit={handleSubmit} className="space-y-10">
        <section className="rounded-2xl bg-[#1d1d1f] p-6 shadow-sm space-y-4">
          <Typography variant="body" className="font-semibold text-theme-light">
            Search Project Information
          </Typography>
          <div className="space-y-2">
            <Typography variant="small" className="text-gray-300">
              Projects
            </Typography>
            <SearchableSelect
              options={projectOptions}
              value={projectInput}
              onChange={handleSelectProject}
              placeholder="Search and select project"
              icon="mdi:magnify"
              disabled={projectsLoading || projectLoading}
            />
          </div>
          {visitQuery.error && (
            <Typography variant="small" className="text-red-400">
              {visitQuery.error.message}
            </Typography>
          )}
          {hasRemoteData && (
            <Typography variant="small" className="text-emerald-400">
              Data preloaded from API for project {form.leadNumber || project?.lead?.leadNumber}.
            </Typography>
          )}
        </section>

        <section className="rounded-2xl bg-[#1d1d1f] p-6 shadow-sm space-y-4">
          <Typography variant="body" className="font-semibold text-theme-light">
            General Information
          </Typography>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Project number"
              value={form.projectNumber ?? ""}
              onChange={(e) => updateField("projectNumber", e.target.value)}
            />
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
            <div className="space-y-1">
              <Typography variant="small" className="text-gray-300">
                Client name
              </Typography>
              <SearchableSelect
                options={companyOptions}
                value={form.clientName}
                onChange={(value) => updateField("clientName", value)}
                placeholder="Select company"
                icon="mdi:office-building"
                disabled={form.clientType === "individual" || companiesLoading}
              />
            </div>
            <div className="space-y-1">
              <Typography variant="small" className="text-gray-300">
                Client type
              </Typography>
              <SearchableSelect
                options={clientTypeOptions}
                value={form.clientType}
                onChange={(value) => {
                  updateField("clientType", value);
                  if (value === "individual") {
                    updateField("clientName", "");
                  }
                }}
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
              label="Date started"
              value={form.dateStarted}
              onChange={(value) => updateField("dateStarted", value)}
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
              <label className="text-sm text-gray-300">Overview</label>
              <Textarea
                placeholder="General description"
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
              Activities
            </Typography>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<Icon name="mdi:plus" size={16} />}
              onClick={() => addActivityRow("activities")}
            >
              Add Activity
            </Button>
          </div>

          <div className="space-y-4">
            {form.activities.map((row, index) => (
              <div
                key={`activity-${index}`}
                className="rounded-xl bg-[#18181b] p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <Input
                    label={`Activity ${index + 1}`}
                    value={row.activity}
                    onChange={(e) =>
                      updateActivityRow("activities", index, { activity: e.target.value })
                    }
                    className="flex-1"
                  />
                  <IconButton
                    aria-label="Delete activity"
                    variant="ghost"
                    onClick={() => deleteActivityRow("activities", index)}
                    icon={<Icon name="mdi:delete" size={18} />}
                  />
                </div>

                <FileInputList
                  label="Add Images"
                  files={row.imageFiles ?? []}
                  existingUrls={row.imageUrls ?? []}
                  onChange={(files) => updateActivityRow("activities", index, { imageFiles: files })}
                  onRemoveExisting={(url) =>
                    updateActivityRow("activities", index, {
                      imageUrls: (row.imageUrls ?? []).filter((item) => item !== url),
                    })
                  }
                  helperText="Formats: images or PDF."
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-[#1d1d1f] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Typography variant="body" className="font-semibold text-theme-light">
              Additional Activities
            </Typography>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<Icon name="mdi:plus" size={16} />}
              onClick={() => addActivityRow("additionalActivities")}
            >
              Add Activity
            </Button>
          </div>

          <div className="space-y-4">
            {form.additionalActivities.map((row, index) => (
              <div
                key={`additional-${index}`}
                className="rounded-xl bg-[#18181b] p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <Input
                    label={`Activity ${index + 1}`}
                    value={row.activity}
                    onChange={(e) =>
                      updateActivityRow("additionalActivities", index, { activity: e.target.value })
                    }
                    className="flex-1"
                  />
                  <IconButton
                    aria-label="Delete activity"
                    variant="ghost"
                    onClick={() => deleteActivityRow("additionalActivities", index)}
                    icon={<Icon name="mdi:delete" size={18} />}
                  />
                </div>

                <FileInputList
                  label="Add Images"
                  files={row.imageFiles ?? []}
                  existingUrls={row.imageUrls ?? []}
                  onChange={(files) =>
                    updateActivityRow("additionalActivities", index, { imageFiles: files })
                  }
                  onRemoveExisting={(url) =>
                    updateActivityRow("additionalActivities", index, {
                      imageUrls: (row.imageUrls ?? []).filter((item) => item !== url),
                    })
                  }
                  helperText="Formats: images or PDF."
                />
              </div>
            ))}
            {form.additionalActivities.length === 0 && (
              <Typography variant="small" className="text-gray-400">
                No additional activities registered.
              </Typography>
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-[#1d1d1f] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Typography variant="body" className="font-semibold text-theme-light">
              Next Activities
            </Typography>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<Icon name="mdi:plus" size={16} />}
              onClick={() => addStringItem("nextActivities")}
            >
              Add
            </Button>
          </div>

          <div className="space-y-3">
            {form.nextActivities.map((item, index) => (
              <div key={`next-${index}`} className="flex items-start gap-2">
                <Input
                  value={item}
                  onChange={(e) => updateStringList("nextActivities", index, e.target.value)}
                  placeholder="Next activity"
                  className="flex-1"
                />
                <IconButton
                  aria-label="Delete next activity"
                  variant="ghost"
                  onClick={() => deleteStringItem("nextActivities", index)}
                  icon={<Icon name="mdi:delete" size={18} />}
                />
              </div>
            ))}
            {form.nextActivities.length === 0 && (
              <Typography variant="small" className="text-gray-400">
                Add next activities for tracking.
              </Typography>
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-[#1d1d1f] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Typography variant="body" className="font-semibold text-theme-light">
              Observations
            </Typography>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<Icon name="mdi:plus" size={16} />}
              onClick={() => addStringItem("observations")}
            >
              Add
            </Button>
          </div>

          <div className="space-y-3">
            {form.observations.map((item, index) => (
              <div key={`obs-${index}`} className="flex items-start gap-2">
                <Input
                  value={item}
                  onChange={(e) => updateStringList("observations", index, e.target.value)}
                  placeholder="Observation"
                  className="flex-1"
                />
                <IconButton
                  aria-label="Delete observation"
                  variant="ghost"
                  onClick={() => deleteStringItem("observations", index)}
                  icon={<Icon name="mdi:delete" size={18} />}
                />
              </div>
            ))}
            {form.observations.length === 0 && (
              <Typography variant="small" className="text-gray-400">
                Add relevant observations about the visit.
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
            Submit Report
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


