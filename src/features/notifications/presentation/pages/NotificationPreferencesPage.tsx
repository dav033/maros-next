"use client";

import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { PageHeaderCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useNotificationsApp } from "@/di";
import type { NotificationChannel, NotificationPreferences } from "@/notifications/domain";

const DEFAULTS: NotificationPreferences = { assignment: "email", status: "in_app", blocked: "in_app", comment: "in_app", mention: "in_app", permit: "in_app", digest: "email", digestHour: 7 };
const ROWS: Array<{ key: keyof Pick<NotificationPreferences, "assignment" | "status" | "blocked" | "comment" | "mention" | "permit" | "digest">; label: string }> = [
  { key: "assignment", label: "Task assignments" },
  { key: "status", label: "Watched task status changes" },
  { key: "blocked", label: "Tasks blocked" },
  { key: "comment", label: "Comments" },
  { key: "mention", label: "Mentions" },
  { key: "permit", label: "Permit reminders" },
  { key: "digest", label: "Daily due-task digest" },
];

export function NotificationPreferencesPage() {
  const ctx = useNotificationsApp();
  const [preferences, setPreferences] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);
  useEffect(() => { void ctx.repos.notification.getPreferences().then((next) => setPreferences({ ...DEFAULTS, ...next })).catch(() => undefined); }, [ctx]);
  const save = async (patch: Partial<NotificationPreferences>) => {
    setSaving(true);
    try { setPreferences(await ctx.repos.notification.updatePreferences(patch)); } finally { setSaving(false); }
  };
  return (
    <div className="space-y-5">
      <PageHeaderCard icon={BellRing} title="Notification preferences" description="Choose where task signals should reach you." />
      <section className="max-w-2xl divide-y divide-border rounded-xl border border-border bg-card">
        {ROWS.map(({ key, label }) => (
          <div key={key} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <span className="text-sm font-medium">{label}</span>
            <Select value={preferences[key]} onValueChange={(value) => void save({ [key]: value as NotificationChannel })} disabled={saving}>
              <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="in_app">In-app</SelectItem><SelectItem value="email">Email</SelectItem><SelectItem value="none">None</SelectItem></SelectContent>
            </Select>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <span className="text-sm font-medium">Digest hour (business timezone)</span>
          <div className="flex items-center gap-2"><Input className="h-9 w-20" type="number" min={0} max={23} value={preferences.digestHour} onChange={(event) => setPreferences({ ...preferences, digestHour: Number(event.target.value) })} onBlur={() => void save({ digestHour: preferences.digestHour })} /><Button type="button" size="sm" variant="outline" disabled={saving} onClick={() => void save({ digestHour: preferences.digestHour })}>Save</Button></div>
        </div>
      </section>
    </div>
  );
}
