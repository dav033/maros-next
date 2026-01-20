import { SearchableSelect } from "@/components/custom";
import type { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
}: GeneralInfoSectionProps) => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">General Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Project number</Label>
          <Input
            value={form.projectNumber ?? ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdateField("projectNumber", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Project name</Label>
          <Input
            value={form.projectName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdateField("projectName", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Project location</Label>
          <Input
            value={form.projectLocation}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdateField("projectLocation", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Client name</Label>
          <SearchableSelect
            options={companyOptions}
            value={form.clientName}
            onChange={(value: string) => onUpdateField("clientName", value)}
            placeholder="Select company"
            icon="mdi:office-building"
            disabled={form.clientType === "individual" || companiesLoading}
          />
        </div>
        <div className="space-y-1">
          <Label>Client type</Label>
          <SearchableSelect
            options={clientTypeOptions}
            value={form.clientType}
            onChange={(value: string) => {
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
          <Label>Customer contact</Label>
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
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdateField("email", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input
            value={form.phone}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdateField("phone", e.target.value)}
          />
        </div>
        <DatePicker
          label="Date started"
          value={form.dateStarted ?? ""}
          onChange={(value) => onUpdateField("dateStarted", value || null)}
        />
        <div className="space-y-1">
          <Label>Language</Label>
          <SearchableSelect
            options={languageOptions}
            value={form.language}
            onChange={(value: string) => onUpdateField("language", value)}
            placeholder="Select language"
            icon="mdi:translate"
          />
        </div>
      </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>Overview</Label>
            <Textarea
              placeholder="General description"
              value={form.overview}
              onChange={(e) => onUpdateField("overview", e.target.value)}
              rows={5}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


