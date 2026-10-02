"use client";

import { useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import {
  Briefcase,
  Calendar,
  CalendarClock,
  DollarSign,
  FolderTree,
  History,
  MapPin,
  Megaphone,
  StickyNote,
  Edit,
  UserRound,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, EMPTY_SELECT_VALUE } from "@/components/ui/select";
import { DetailField, InlineEditCardHeader, LocationField } from "@/components/shared";
import type { UseInlineEditReturn } from "@/common/hooks";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { AssigneePicker } from "@/features/tasks/presentation/molecules/AssigneePicker";
import { TaskDatePicker } from "@/features/tasks/presentation/molecules/TaskDatePicker";
import { useUserDirectory } from "@/features/users/presentation/hooks/data/useUserDirectory";
import { LEAD_SOURCES, LeadStatus, type LeadLostReason, type LeadSource } from "@/leads/domain";
import { LEAD_LOST_REASON_LABELS, LEAD_SOURCE_LABELS } from "../../atoms/leadVisualTokens";
import { LeadLostReasonDialog } from "../../molecules/LeadLostReasonDialog";

/** Una fecha inválida se trata como ausente: "Invalid Date" no informa de nada. */
function formatDay(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const parsed = parseISO(value);
  return isValid(parsed) ? format(parsed, "MMM d, yyyy") : undefined;
}

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
    financial?: { estimatedAmount?: number | null; found?: boolean } | null;
    ownerId?: number | null;
    source?: LeadSource | null;
    lostReason?: LeadLostReason | null;
    nextFollowUpAt?: string | null;
    statusChangedAt?: string | null;
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
    ownerId: number | null;
    source: LeadSource | null;
    lostReason: LeadLostReason | null;
    nextFollowUpAt: string | null;
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

  const [lostReasonDialogOpen, setLostReasonDialogOpen] = useState(false);
  // El backend sólo devuelve `ownerId`; el nombre del comercial sale del directorio.
  const { users } = useUserDirectory(true);
  const ownerId = isEditing ? editingValue.ownerId ?? null : lead.ownerId ?? null;
  const owner = users.find((user) => user.id === ownerId) ?? null;
  // Con el directorio aún cargando hay id pero no nombre, y "Unassigned" sería falso.
  const ownerLabel = owner
    ? owner.name ?? owner.email
    : ownerId != null
      ? `User #${ownerId}`
      : undefined;

  const formatMoney = (amount: number) =>
    `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const estimateText = lead.estimate != null ? formatMoney(Number(lead.estimate)) : undefined;
  // El backend responde con el bloque financiero en ceros y `found: false` cuando
  // QuickBooks no conoce este número de lead. Sin mirar `found`, la ficha decía
  // "Estimate (QuickBooks) $0.00", que es una cifra inventada: lo que pasa es que no
  // hay estimado allá, no que valga cero.
  const qboEstimateText =
    lead.financial?.found !== false && lead.financial?.estimatedAmount != null
      ? formatMoney(Number(lead.financial.estimatedAmount))
      : undefined;

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
        {/* El nombre ya viajaba en el patch del inline edit, pero no había campo
            donde escribirlo: una vez creado el lead no se podía corregir. */}
        {isEditing ? (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Lead Name</p>
            <Input
              value={editingValue.name ?? ""}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Enter lead name"
              maxLength={140}
              className="border-line-strong"
            />
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Lead Number</p>
            <p className="font-mono tabular-nums text-foreground">{lead.leadNumber || "N/A"}</p>
          </div>
          
          {isEditing ? (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Project Type</p>
              <Select
                value={editingValue.projectTypeId != null ? String(editingValue.projectTypeId) : EMPTY_SELECT_VALUE}
                onValueChange={(val) => setField("projectTypeId", val === EMPTY_SELECT_VALUE ? undefined : Number(val))}
              >
                <SelectTrigger className="border-line-strong">
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
                className="border-line-strong"
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
                onValueChange={(val) => {
                  // LOST no se aplica aquí: primero el motivo, en el mismo gesto.
                  if (val === LeadStatus.LOST) {
                    setLostReasonDialogOpen(true);
                    return;
                  }
                  setField("status", val === EMPTY_SELECT_VALUE ? "" : val);
                }}
              >
                <SelectTrigger className="border-line-strong">
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
                className="border-line-strong"
              />
            </div>
          ) : (
            <DetailField icon={DollarSign} label="Estimate" value={estimateText}>
              {estimateText ? (
                <p className="font-mono tabular-nums text-foreground">{estimateText}</p>
              ) : undefined}
            </DetailField>
          )}

          <DetailField
            icon={DollarSign}
            label="Estimate (QuickBooks)"
            value={qboEstimateText}
          >
            {qboEstimateText ? (
              <p className="font-mono tabular-nums text-foreground">{qboEstimateText}</p>
            ) : undefined}
          </DetailField>

          {isEditing ? (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Owner</p>
              <AssigneePicker
                onSelect={(user) => setField("ownerId", user ? user.id : null)}
                trigger={
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 w-full justify-start border-line-strong px-3 font-normal"
                  >
                    {ownerLabel ?? <span className="text-muted-foreground">Unassigned</span>}
                  </Button>
                }
              />
            </div>
          ) : (
            <DetailField icon={UserRound} label="Owner" value={ownerLabel} />
          )}

          {isEditing ? (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Source</p>
              <Select
                value={editingValue.source ?? EMPTY_SELECT_VALUE}
                onValueChange={(val) =>
                  setField("source", val === EMPTY_SELECT_VALUE ? null : (val as LeadSource))
                }
              >
                <SelectTrigger className="border-line-strong">
                  <SelectValue placeholder="Select Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_SELECT_VALUE}>Unknown</SelectItem>
                  {LEAD_SOURCES.map((source) => (
                    <SelectItem key={source} value={source}>
                      {LEAD_SOURCE_LABELS[source]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <DetailField
              icon={Megaphone}
              label="Source"
              value={lead.source ? LEAD_SOURCE_LABELS[lead.source] : undefined}
            />
          )}

          {isEditing ? (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Next Follow-up</p>
              <TaskDatePicker
                value={editingValue.nextFollowUpAt ?? null}
                onChange={(value) => setField("nextFollowUpAt", value)}
                placeholder="No follow-up set"
              />
            </div>
          ) : (
            <DetailField
              icon={CalendarClock}
              label="Next Follow-up"
              value={formatDay(lead.nextFollowUpAt)}
            />
          )}

          {/* Null en casi todo el histórico, y eso es "no se sabe": DetailField lo
              dice con "Not available" en vez de inventar una antigüedad. */}
          <DetailField
            icon={History}
            label="In this stage since"
            value={formatDay(lead.statusChangedAt)}
          />

          {isEditing && editingValue.status === LeadStatus.LOST ? (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Lost Reason</p>
              <Button
                type="button"
                variant="outline"
                className="h-9 w-full justify-start border-line-strong px-3 font-normal"
                onClick={() => setLostReasonDialogOpen(true)}
              >
                {editingValue.lostReason ? (
                  LEAD_LOST_REASON_LABELS[editingValue.lostReason]
                ) : (
                  <span className="text-muted-foreground">Choose a reason</span>
                )}
              </Button>
            </div>
          ) : !isEditing && lead.status === LeadStatus.LOST ? (
            <DetailField
              icon={XCircle}
              label="Lost Reason"
              value={lead.lostReason ? LEAD_LOST_REASON_LABELS[lead.lostReason] : undefined}
            />
          ) : null}
        </div>

        <LeadLostReasonDialog
          open={lostReasonDialogOpen}
          initialReason={editingValue.lostReason ?? lead.lostReason ?? null}
          onCancel={() => setLostReasonDialogOpen(false)}
          onConfirm={(reason) => {
            setFields({ status: LeadStatus.LOST, lostReason: reason });
            setLostReasonDialogOpen(false);
          }}
        />

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
                Quick notes
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenNotesModal}
                className="text-muted-foreground hover:text-foreground h-auto py-1"
              >
                <Edit className="size-3 mr-1" />
                Edit
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
            label="Quick notes"
            value={undefined}
            onAdd={onOpenNotesModal}
          />
        )}
      </CardContent>
    </Card>
  );
}
