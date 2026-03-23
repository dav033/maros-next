"use client";

import {  
  SearchableSelect, 
  Typography } from "@/components/shared";
import { Plus, Trash, Loader, Save, Search, Building, User, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { EvidenceImageRow, RestorationFinalReport } from "@/reports/domain/models";
import { FileInputList } from "../components/FileInputList";
import {
  useRestorationFinalQuery,
  useSubmitRestorationFinalMutation,
} from "../hooks/useRestorationFinal";
import { DatePicker } from "../components/DatePicker";
import { useInstantProjects } from "@/features/project/presentation/hooks/data/useInstantProjects";
import { useProjectsApp } from "@/di";
import { getProjectById } from "@/features/project/application/usecases/queries/getProjectById";
import { useInstantContacts, useInstantContactsByCompany } from "@/features/contact/presentation/hooks";
import { useInstantCompanies } from "@/features/company/presentation/hooks/data/useInstantCompanies";
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
  const [projectInput, setProjectInput] = useState("");
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [form, setForm] = useState<RestorationFinalReport>(EMPTY_FINAL);
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

  const finalQuery = useRestorationFinalQuery(project?.id || null);
  const submitMutation = useSubmitRestorationFinalMutation();

  const activeCompanyId = useMemo(
    () => project?.lead?.contact?.company?.id ?? project?.lead?.contact?.companyId ?? null,
    [project]
  );

  const { contacts: companyContacts = [], isFetching: companyContactsLoading } =
    useInstantContactsByCompany(activeCompanyId);

  const submitting = submitMutation.isPending;

  const hasRemoteData = useMemo(
    () => Boolean(finalQuery.data && (finalQuery.data.projectName || finalQuery.data.customerName)),
    [finalQuery.data]
  );

  // Efecto para rellenar formulario cuando se obtiene el proyecto desde el backend
  useEffect(() => {
    if (project) {
      const lead = project.lead;
      const clientType = inferClientType(lead?.contact);
      setForm((prev) => ({
        ...prev,
        leadNumber: lead?.leadNumber || prev.leadNumber,
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
        completionDate: lead?.startDate || prev.completionDate,
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
    const leadNumber = project?.lead?.leadNumber || form.leadNumber;
    if (!leadNumber) {
      toast.error("Select a project before submitting.");
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
      toast.success("Final report submitted successfully.");
      if (result?.redirectUrl) {
        window.open(result.redirectUrl, "_blank");
      }
    } catch (error) {
      console.error(error);
      toast.error("There was a problem submitting the final report.");
    }
  };

  return (
    <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 max-w-screen-2xl space-y-8">
      <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Restoration Report - Final</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">Complete the final report using data obtained by selecting a project.</p>
        </header>

      <form onSubmit={handleSubmit} className="space-y-10">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Search Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Projects</Label>
              <SearchableSelect
                options={projectOptions}
                value={projectInput}
                onChange={handleSelectProject}
                placeholder="Search and select project"
                icon={Search}
                disabled={projectsLoading || projectLoading}
              />
            </div>
            {finalQuery.error && (
              <Typography variant="small" className="text-red-400">
                {finalQuery.error.message}
              </Typography>
            )}
            {hasRemoteData && (
              <Typography variant="small" className="text-emerald-400">
                Data preloaded from API for project {form.leadNumber || project?.lead?.leadNumber || 'N/A'}.
              </Typography>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">General Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Project name</Label>
                <Input
                  value={form.projectName}
                  onChange={(e) => updateField("projectName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Project location</Label>
                <Input
                  value={form.projectLocation}
                  onChange={(e) => updateField("projectLocation", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Client name</Label>
                <SearchableSelect
                  options={companyOptions}
                  value={form.clientName}
                  onChange={(value) => updateField("clientName", value)}
                  placeholder="Select company"
                  icon={Building}
                  disabled={form.clientType === "individual" || companiesLoading}
                />
              </div>
              <div className="space-y-1">
                <Label>Client type</Label>
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
                  icon={User}
                />
              </div>
              <div className="space-y-1">
                <Label>Customer contact</Label>
                <SearchableSelect
                  options={contactOptions}
                  value={
                    contactOptions.find((c) => c.label === form.customerName)?.value ??
                    form.customerName
                  }
                  onChange={handleSelectContact}
                  placeholder="Select contact"
                  icon={User}
                  disabled={contactsLoading}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </div>
              <DatePicker
                label="Completion date"
                value={form.completionDate}
                onChange={(value) => updateField("completionDate", value)}
              />
              <div className="space-y-1">
                <Label>Language</Label>
                <SearchableSelect
                  options={languageOptions}
                  value={form.language}
                  onChange={(value) => updateField("language", value)}
                  placeholder="Select language"
                  icon={Languages}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>Final evaluation</Label>
                <Textarea
                  placeholder="Final evaluation summary"
                  value={form.finalEvaluation}
                  onChange={(e) => updateField("finalEvaluation", e.target.value)}
                  rows={5}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Overview</Label>
                <Textarea
                  placeholder="General summary"
                  value={form.overview}
                  onChange={(e) => updateField("overview", e.target.value)}
                  rows={5}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base">Completed Activities</CardTitle>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addCompletedActivity}
            >
              <Plus className="size-4 mr-2" />
              Add Activity
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {form.completedActivities.map((item, index) => (
              <div key={`completed-${index}`} className="flex items-start gap-2">
                <Input
                  value={item}
                  onChange={(e) => updateCompletedActivity(index, e.target.value)}
                  placeholder="Completed activity"
                  className="flex-1"
                />
                <Button variant="ghost" size="icon" aria-label="Delete completed activity"
                  onClick={() => deleteCompletedActivity(index)}
                >
                  <Trash className="size-4.5" />
                </Button>
              </div>
            ))}
            {form.completedActivities.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Add at least one completed activity.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base">Photographic Evidence</CardTitle>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addEvidence}
            >
              <Plus className="size-4 mr-2" />
              Add Evidence
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.evidenceImages.map((row, index) => (
              <Card key={`evidence-${index}`} className="bg-background">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-2">
                      <Label>{`Description ${index + 1}`}</Label>
                      <Input
                        value={row.description}
                        onChange={(e) => updateEvidence(index, { description: e.target.value })}
                      />
                    </div>
                    <Button variant="ghost" size="icon" aria-label="Delete evidence"
                      onClick={() => deleteEvidence(index)}
                    >
                      <Trash className="size-4.5" />
                    </Button>
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
                </CardContent>
              </Card>
            ))}
            {form.evidenceImages.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Add at least one piece of evidence for the final report.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            disabled={submitting}
          >
            {submitting ? (
              <Loader className="size-4 animate-spin mr-2" />
            ) : (
              <Save className="size-4 mr-2" />
            )}
            {submitting ? "Submitting..." : "Submit Final Report"}
          </Button>
          {submitting && (
            <div className="flex items-center gap-2 text-foreground">
              <Loader className="size-4 animate-spin" /> Sending information...
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

