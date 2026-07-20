"use client";

import { Briefcase, Calendar, DollarSign, FolderTree, MapPin, StickyNote, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, EMPTY_SELECT_VALUE } from "@/components/ui/select";
import { DetailField, InlineEditCardHeader, LocationField } from "@/components/shared";
import type { UseInlineEditReturn } from "@/common/hooks";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export interface LeadInfoSectionProps {
  lead: {
    leadNumber?: string;
    name?: string;
    startDate?: string | null;
    location?: string;
    addressLink?: string;
    status?: string;
    projectType?: { id: number; name: string } | null;
    notes?: string[];
    /** Estimado manual, editable desde el CRM. */
    estimate?: number | null;
    /** Monto del Estimate real en QuickBooks (solo lectura, informativo). */
    financial?: { estimatedAmount?: number | null } | null;
  };
  projectTypes: Array<{ id: number; name: string }>;
  inlineEdit: UseInlineEditReturn<{
    name: string;
    location: string;
    addressLink: string;
    startDate: string;
    status: string;
    projectTypeId: number | undefined;
    contactId: number | undefined;
    estimate: number | undefined;
  }>;
  onOpenNotesModal: () => void;
}

export function LeadInfoSection({
  lead,
  projectTypes,
  inlineEdit,
  onOpenNotesModal,
}: LeadInfoSectionProps) {
  const {
    isEditing,
    editingValue,
    isSaving,
    startEdit,
    cancelEdit,
    saveEdit,
    setField,
    setFields,
  } = inlineEdit;

  return (
    <Card>
      <InlineEditCardHeader
        icon={Briefcase}
        title="Lead Information"
        isEditing={isEditing}
        isSaving={isSaving}
        onEdit={startEdit}
        onSave={saveEdit}
        onCancel={cancelEdit}
      />
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Lead Number</p>
            <p className="text-foreground font-mono">{lead.leadNumber || "N/A"}</p>
          </div>
          
          {isEditing ? (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Project Type</p>
              <Select
                value={editingValue.projectTypeId != null ? String(editingValue.projectTypeId) : EMPTY_SELECT_VALUE}
                onValueChange={(val) => setField("projectTypeId", val === EMPTY_SELECT_VALUE ? undefined : Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Project Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_SELECT_VALUE}>Select Project Type</SelectItem>
                  {projectTypes.map((pt) => (
                    <SelectItem key={pt.id} value={String(pt.id)}>
                      {pt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <DetailField
              icon={FolderTree}
              label="Project Type"
              value={lead.projectType?.name}
            />
          )}

          {isEditing ? (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Start Date</p>
              <Input
                type="date"
                value={editingValue.startDate || ""}
                onChange={(e) => setField("startDate", e.target.value)}
              />
            </div>
          ) : (
            <DetailField
              icon={Calendar}
              label="Start Date"
              value={lead.startDate ? new Date(lead.startDate).toLocaleDateString() : undefined}
            />
          )}

          {isEditing ? (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Status</p>
              <Select
                value={editingValue.status || EMPTY_SELECT_VALUE}
                onValueChange={(val) => setField("status", val === EMPTY_SELECT_VALUE ? "" : val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_SELECT_VALUE}>Select Status</SelectItem>
                  <SelectItem value="NEW_LEAD">New Lead</SelectItem>
                  <SelectItem value="CONTACTED">Contacted</SelectItem>
                  <SelectItem value="ESTIMATING_PREPARING_PROPOSAL">Estimating / Preparing Proposal</SelectItem>
                  <SelectItem value="PROPOSAL_SENT">Proposal Sent</SelectItem>
                  <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                  <SelectItem value="WON">Won</SelectItem>
                  <SelectItem value="LOST">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              {lead.status ? (
                <Badge variant="outline">{lead.status}</Badge>
              ) : (
                <p className="text-xs text-muted-foreground">Not available</p>
              )}
            </div>
          )}

          {isEditing ? (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Estimate</p>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={editingValue.estimate ?? ""}
                onChange={(e) =>
                  setField(
                    "estimate",
                    e.target.value === "" ? undefined : Number(e.target.value),
                  )
                }
                placeholder="Manual estimate"
              />
            </div>
          ) : (
            <DetailField
              icon={DollarSign}
              label="Estimate"
              value={lead.estimate != null ? `$${Number(lead.estimate).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : undefined}
            />
          )}

          <DetailField
            icon={DollarSign}
            label="Estimate (QuickBooks)"
            value={lead.financial?.estimatedAmount != null ? `$${Number(lead.financial.estimatedAmount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : undefined}
          />
        </div>

        <Separator />
        
        {isEditing ? (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Location</p>
            <LocationField
              address={editingValue.location || ""}
              addressLink={editingValue.addressLink || null}
              onAddressChange={(value: string) => setField("location", value)}
              onAddressLinkChange={(value: string) => setField("addressLink", value)}
              onLocationChange={(data) => {
                setFields({
                  location: data.address,
                  addressLink: data.link,
                });
              }}
              placeholder="Enter location"
            />
          </div>
        ) : (
          <DetailField
            icon={MapPin}
            label="Location"
            value={lead.location}
            linkHref={lead.addressLink}
            linkLabel="View on map"
          />
        )}

        <Separator />
        
        {lead.notes && lead.notes.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground text-sm flex items-center gap-1">
                <StickyNote className="size-3" />
                Notes
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenNotesModal}
                className="text-muted-foreground hover:text-foreground h-auto py-1"
              >
                <Edit className="size-3 mr-1" />
                Edit Notes
              </Button>
            </div>
            <ul className="space-y-2">
              {lead.notes.map((note, index) => (
                <li key={index} className="text-sm text-foreground">
                  • {note}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <DetailField
            icon={StickyNote}
            label="Notes"
            value={undefined}
            onAdd={onOpenNotesModal}
          />
        )}
      </CardContent>
    </Card>
  );
}
