import {
  Input,
  SearchableSelect,
  Textarea,
  Typography,
} from "@dav033/dav-components";
import { DatePicker } from "./DatePicker";
import type { RestorationVisitReport } from "@/reports/domain/models";
import type { Contact } from "@/contact/domain";

interface GeneralInfoSectionProps {
  form: RestorationVisitReport;
  onUpdateField: (field: keyof RestorationVisitReport, value: string | null) => void;
  onSelectContact: (value: string) => void;
  companyOptions: Array<{ value: string; label: string }>;
  contactOptions: Array<{ value: string; label: string }>;
  clientTypeOptions: Array<{ value: string; label: string }>;
  languageOptions: Array<{ value: string; label: string }>;
  companiesLoading: boolean;
  contactsLoading: boolean;
  contactByValue: Map<string, Contact>;
  inferClientType: (contact?: Contact | null) => string;
}

export const GeneralInfoSection = ({
  form,
  onUpdateField,
  onSelectContact,
  companyOptions,
  contactOptions,
  clientTypeOptions,
  languageOptions,
  companiesLoading,
  contactsLoading,
  contactByValue,
  inferClientType,
}: GeneralInfoSectionProps) => {
  return (
    <section className="rounded-2xl bg-[#1d1d1f] p-6 shadow-sm space-y-4">
      <Typography variant="body" className="font-semibold text-theme-light">
        General Information
      </Typography>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Project number"
          value={form.projectNumber ?? ""}
          onChange={(e) => onUpdateField("projectNumber", e.target.value)}
        />
        <Input
          label="Project name"
          value={form.projectName}
          onChange={(e) => onUpdateField("projectName", e.target.value)}
        />
        <Input
          label="Project location"
          value={form.projectLocation}
          onChange={(e) => onUpdateField("projectLocation", e.target.value)}
        />
        <div className="space-y-1">
          <Typography variant="small" className="text-gray-300">
            Client name
          </Typography>
          <SearchableSelect
            options={companyOptions}
            value={form.clientName}
            onChange={(value) => onUpdateField("clientName", value)}
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
              onUpdateField("clientType", value);
              if (value === "individual") {
                onUpdateField("clientName", "");
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
            onChange={onSelectContact}
            placeholder="Select contact"
            icon="mdi:account"
            disabled={contactsLoading}
          />
        </div>
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => onUpdateField("email", e.target.value)}
        />
        <Input
          label="Phone"
          value={form.phone}
          onChange={(e) => onUpdateField("phone", e.target.value)}
        />
        <DatePicker
          label="Date started"
          value={form.dateStarted ?? ""}
          onChange={(value) => onUpdateField("dateStarted", value || null)}
        />
        <div className="space-y-1">
          <Typography variant="small" className="text-gray-300">
            Language
          </Typography>
          <SearchableSelect
            options={languageOptions}
            value={form.language}
            onChange={(value) => onUpdateField("language", value)}
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
            onChange={(e) => onUpdateField("overview", e.target.value)}
            rows={5}
          />
        </div>
      </div>
    </section>
  );
};


