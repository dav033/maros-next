"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Icon,
  IconButton,
  PageContainer,
  SimplePageHeader,
  Spinner,
  useToast,
} from "@dav033/dav-components";
import { sendEmailAction } from "../../actions/reportActions";
import type { RestorationVisitReport } from "@/reports/domain/models";
import { useRestorationVisitQuery } from "../hooks/useRestorationVisit";
import { useProjectForm } from "../hooks/useProjectForm";
import { useReportTranslation } from "../hooks/useReportTranslation";
import { useFormFields } from "../hooks/useFormFields";
import { useFormOptions } from "../hooks/useFormOptions";
import { useImageUpload } from "../hooks/useImageUpload";
import { ProjectSearchSection } from "../components/ProjectSearchSection";
import { GeneralInfoSection } from "../components/GeneralInfoSection";
import { ActivitiesSection } from "../components/ActivitiesSection";
import { StringListSection } from "../components/StringListSection";
import { TranslationFeedback } from "../components/TranslationFeedback";
import type { Contact } from "@/contact/domain";

const inferClientType = (contact?: Contact | null) =>
  contact?.company?.name ? "company" : "individual";

export function RestorationVisitPage() {
  const toast = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailAddresses, setEmailAddresses] = useState<string[]>([]);
  const [newEmailInput, setNewEmailInput] = useState("");

  const {
    form,
    setForm,
    project,
    projectInput,
    projectLoading,
    projectsLoading,
    projects,
    handleSelectProject,
  } = useProjectForm();

  const visitQuery = useRestorationVisitQuery(project?.id || null);
  const { translations, updateTranslation, isTranslating, translationProgress } = useReportTranslation(form, setForm);

  const {
    updateField,
    updateActivityRow,
    addActivityRow,
    deleteActivityRow,
    updateStringList,
    addStringItem,
    deleteStringItem,
  } = useFormFields(form, setForm, updateTranslation);

  const isCompanyClient = form.clientType === "company";
  const formOptions = useFormOptions(project, isCompanyClient);

  const { collectFilesWithMetadata, uploadImages, submitReport, uploading, setUploading } = useImageUpload();

  const projectOptions = useMemo(
    () =>
      projects
        .filter((proj) => proj.lead?.leadNumber && proj.lead.leadNumber.trim())
        .map((proj) => ({
          value: String(proj.id),
          label: `${proj.lead.leadNumber} — ${proj.lead.name || proj.overview || "Project"}`,
        })),
    [projects]
  );

  const handleSelectContact = (value: string) => {
    const contact = formOptions.contactByValue.get(String(value));
    setForm((prev) => ({
      ...prev,
      customerName: contact?.name ?? value,
      email: contact?.email ?? "",
      phone: contact?.phone ?? "",
      clientType: inferClientType(contact),
    }));
  };

  const hasRemoteData = useMemo(
    () =>
      Boolean(
        visitQuery.data &&
        (visitQuery.data.projectName || visitQuery.data.customerName)
      ),
    [visitQuery.data]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const leadNumber = project?.lead?.leadNumber || form.leadNumber;
    if (!leadNumber) {
      toast.showError("Select a project before submitting.");
      return;
    }

    setUploading(true);
    try {
      const filesWithMetadata = collectFilesWithMetadata(
        form.activities,
        form.additionalActivities
      );

      if (filesWithMetadata.length > 0) {
        const reportData = {
          leadNumber,
          projectNumber: form.projectNumber || leadNumber,
          projectName: form.projectName,
          projectLocation: form.projectLocation,
          clientName: form.clientName,
          customerName: form.customerName,
          email: form.email,
          phone: form.phone,
          dateStarted: form.dateStarted ?? null,
          language: form.language,
          overview: form.overview,
        };

        const imageIdsByActivity = await uploadImages(filesWithMetadata, reportData);

        const updatedActivities = form.activities.map((row, index) => {
          const entry = imageIdsByActivity.find(
            (e) => e.activityType === "activity" && e.activityIndex === index
          );
          return {
            ...row,
            imageIds: entry ? entry.imageIds : [],
          };
        });

        const updatedAdditionalActivities = form.additionalActivities.map(
          (row, index) => {
            const entry = imageIdsByActivity.find(
              (e) =>
                e.activityType === "additionalActivity" &&
                e.activityIndex === index
            );
            return {
              ...row,
              imageIds: entry ? entry.imageIds : [],
            };
          }
        );

        setForm((prev) => ({
          ...prev,
          activities: updatedActivities,
          additionalActivities: updatedAdditionalActivities,
        }));

        const docUrl = await submitReport(
          form,
          leadNumber,
          updatedActivities,
          updatedAdditionalActivities
        );

        if (docUrl) {
          console.log("Report submitted successfully, docUrl:", docUrl);
          toast.showSuccess("Documento actualizado correctamente.");
          window.open(docUrl, "_blank");
          setDocUrl(docUrl);
          setEmailAddresses(form.email ? [form.email] : []);
          setIsSubmitted(true);
        } else {
          console.warn("Report submitted but no docUrl returned");
        }

        toast.showSuccess(
          `Successfully uploaded ${filesWithMetadata.length} image(s) to webhook.`
        );
      } else {
        console.log("No images to upload, submitting report without images");
        const docUrl = await submitReport(
          form,
          leadNumber,
          form.activities,
          form.additionalActivities
        );

        if (docUrl) {
          console.log("Report submitted successfully (no images), docUrl:", docUrl);
          toast.showSuccess("Documento actualizado correctamente.");
          window.open(docUrl, "_blank");
          setDocUrl(docUrl);
          setEmailAddresses(form.email ? [form.email] : []);
          setIsSubmitted(true);
        } else {
          console.warn("Report submitted but no docUrl returned");
        }
      }
    } catch (error) {
      console.error("Error in handleSubmit:", {
        error: error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        leadNumber: leadNumber,
        projectNumber: form.projectNumber,
        formData: {
          projectName: form.projectName,
          clientName: form.clientName,
          customerName: form.customerName,
          activitiesCount: form.activities.length,
          additionalActivitiesCount: form.additionalActivities.length,
        },
      });
      toast.showError(
        "There was a problem uploading images. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleAddEmail = () => {
    const email = newEmailInput.trim();
    if (!email) {
      toast.showError("Please enter an email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.showError("Please enter a valid email address.");
      return;
    }

    if (emailAddresses.includes(email)) {
      toast.showError("This email is already in the list.");
      return;
    }

    setEmailAddresses([...emailAddresses, email]);
    setNewEmailInput("");
  };

  const handleRemoveEmail = (index: number) => {
    setEmailAddresses(emailAddresses.filter((_, i) => i !== index));
  };

  const handleSendEmail = async () => {
    if (emailAddresses.length === 0) {
      toast.showError("Please add at least one email address.");
      return;
    }

    if (!docUrl) {
      toast.showError("Document URL is missing.");
      return;
    }

    setSendingEmail(true);
    try {
      const result = await sendEmailAction({
        emails: emailAddresses,
        docUrl: docUrl,
        projectNumber: form.projectNumber || project?.lead?.leadNumber || "",
        projectName: form.projectName || "",
        customerName: form.customerName || "",
      });

      if (result.success) {
        toast.showSuccess(`Email sent successfully to ${emailAddresses.length} recipient(s).`);
      } else {
        toast.showError(result.error || "Failed to send email.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.showError("Failed to send email. Please try again.");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleBack = () => {
    setIsSubmitted(false);
    setDocUrl(null);
    setEmailAddresses([]);
    setNewEmailInput("");
  };

  if (isSubmitted) {
    return (
      <PageContainer className="space-y-6 md:space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <IconButton
            onClick={handleBack}
            icon={<Icon name="mdi:arrow-left" size={20} />}
            className="flex-shrink-0"
          />
          <SimplePageHeader
            title="Send Email"
            description="Send the report document to the client's email address(es)."
          />
        </div>

        <div className="max-w-2xl w-full space-y-4 sm:space-y-6">
          <div className="space-y-4">
            <label htmlFor="new-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Addresses
            </label>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="new-email"
                type="email"
                value={newEmailInput}
                onChange={(e) => setNewEmailInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddEmail();
                  }
                }}
                placeholder="client@example.com"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm sm:text-base"
              />
              <Button
                onClick={handleAddEmail}
                variant="outline"
                leftIcon={<Icon name="mdi:plus" size={16} />}
                className="w-full sm:w-auto whitespace-nowrap"
              >
                Add Email
              </Button>
            </div>

            {emailAddresses.length > 0 && (
              <div className="space-y-2">
                {emailAddresses.map((email, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700"
                  >
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 flex-1 truncate">
                      {email}
                    </span>
                    <IconButton
                      onClick={() => handleRemoveEmail(index)}
                      icon={<Icon name="mdi:close" size={18} />}
                      variant="ghost"
                      size="sm"
                      className="flex-shrink-0"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={handleSendEmail}
            loading={sendingEmail}
            leftIcon={<Icon name="mdi:email-send" size={16} />}
            className="w-full sm:w-auto"
            disabled={emailAddresses.length === 0}
          >
            Send Email{emailAddresses.length > 0 ? ` (${emailAddresses.length})` : ""}
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-8">
      <SimplePageHeader
        title="Restoration Report - Visit"
        description="Load and complete the report information using the project."
      />

      <form onSubmit={handleSubmit} className="space-y-10">
        <ProjectSearchSection
          projectOptions={projectOptions}
          projectInput={projectInput}
          onSelectProject={handleSelectProject}
          projectsLoading={projectsLoading}
          error={visitQuery.error}
          hasRemoteData={hasRemoteData}
          leadNumber={form.leadNumber || project?.lead?.leadNumber}
        />

        <GeneralInfoSection
          form={form}
          onUpdateField={updateField}
          onSelectContact={handleSelectContact}
          companyOptions={formOptions.companyOptions}
          contactOptions={formOptions.contactOptions}
          clientTypeOptions={formOptions.clientTypeOptions}
          languageOptions={formOptions.languageOptions}
          companiesLoading={formOptions.companiesLoading}
          contactsLoading={formOptions.contactsLoading}
          contactByValue={formOptions.contactByValue}
          inferClientType={inferClientType}
        />

        <ActivitiesSection
          title="Activities"
          activities={form.activities}
          onUpdate={(index, data) =>
            updateActivityRow("activities", index, data)
          }
          onAdd={() => addActivityRow("activities")}
          onDelete={(index) => deleteActivityRow("activities", index)}
        />

        <ActivitiesSection
          title="Additional Activities"
          activities={form.additionalActivities}
          onUpdate={(index, data) =>
            updateActivityRow("additionalActivities", index, data)
          }
          onAdd={() => addActivityRow("additionalActivities")}
          onDelete={(index) => deleteActivityRow("additionalActivities", index)}
          activityLabel={(index) => `Additional Activity ${index + 1}`}
        />

        <StringListSection
          title="Next Activities"
          items={form.nextActivities}
          onUpdate={(index, value) =>
            updateStringList("nextActivities", index, value)
          }
          onAdd={() => addStringItem("nextActivities")}
          onDelete={(index) => deleteStringItem("nextActivities", index)}
          placeholder="Describe the next activity..."
          itemLabel={(index) => `Next Activity ${index + 1}`}
          emptyMessage="Add next activities for tracking."
        />

        <StringListSection
          title="Observations"
          items={form.observations}
          onUpdate={(index, value) =>
            updateStringList("observations", index, value)
          }
          onAdd={() => addStringItem("observations")}
          onDelete={(index) => deleteStringItem("observations", index)}
          placeholder="Add your observation..."
          itemLabel={(index) => `Observation ${index + 1}`}
          emptyMessage="Add relevant observations about the visit."
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            loading={uploading}
            leftIcon={<Icon name="mdi:content-save" size={16} />}
          >
            Submit Report
          </Button>
          {uploading && (
            <div className="flex items-center gap-2 text-gray-300">
              <Spinner size="sm" /> Sending information...
            </div>
          )}
        </div>
      </form>

      <TranslationFeedback
        isTranslating={isTranslating}
        progress={translationProgress}
      />
    </PageContainer>
  );
}
