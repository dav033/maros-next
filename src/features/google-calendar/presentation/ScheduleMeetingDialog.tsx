"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, ExternalLink, LoaderCircle, Video } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { optimizedApiClient } from "@/shared/infra/http/OptimizedApiClient";
import { connectGoogleCalendar as startGoogleCalendarConnection } from "../connectGoogleCalendar";
import { MeetingParticipantsPicker } from "./MeetingParticipantsPicker";
import { GoogleCalendarPrivacyNotice } from "./GoogleCalendarPrivacyNotice";
import {
  googleCalendarConnectionKey,
  googleCalendarMeetingsKey,
  type CreateGoogleCalendarMeeting,
  type GoogleCalendarConnection,
  type GoogleCalendarMeeting,
} from "../types";

type EntityKind = "lead" | "task";

function localDateTimeValue(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function defaultStartValue(): string {
  const start = new Date();
  start.setHours(start.getHours() + 1, 0, 0, 0);
  return localDateTimeValue(start);
}

function displayDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ScheduleMeetingDialog({
  open,
  onOpenChange,
  entityKind,
  entityId,
  entityLabel,
  attendeeEmail,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityKind: EntityKind;
  entityId: number;
  entityLabel: string;
  attendeeEmail?: string | null;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState(defaultStartValue);
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [attendees, setAttendees] = useState<string[]>([]);
  const connectionQuery = useQuery({
    queryKey: googleCalendarConnectionKey,
    queryFn: async () => (await optimizedApiClient.get<GoogleCalendarConnection>("/google-calendar/connection")).data,
    enabled: open,
  });
  const meetingsQuery = useQuery({
    queryKey: [...googleCalendarMeetingsKey, entityKind, entityId],
    queryFn: async () => (await optimizedApiClient.get<GoogleCalendarMeeting[]>("/google-calendar/meetings", {
      params: { entityKind, entityId },
    })).data,
    enabled: open && connectionQuery.data?.connected === true,
  });
  const createMeeting = useMutation({
    mutationFn: async (input: CreateGoogleCalendarMeeting) => (await optimizedApiClient.post<GoogleCalendarMeeting>("/google-calendar/meetings", input)).data,
    onSuccess: async (meeting) => {
      await queryClient.invalidateQueries({ queryKey: googleCalendarMeetingsKey });
      toast.success(
        meeting.attendees.length
          ? `Google Calendar sent invitations to ${meeting.attendees.length} invitee${meeting.attendees.length === 1 ? "" : "s"}.`
          : "Google Calendar event created.",
      );
    },
    onError: (error: unknown) => toast.error(error instanceof Error ? error.message : "Could not schedule the meeting."),
  });

  useEffect(() => {
    if (!open) return;
    setTitle(`Meeting: ${entityLabel}`);
    setStartsAt(defaultStartValue());
    setDurationMinutes("60");
    setAttendees(attendeeEmail ? [attendeeEmail.toLowerCase()] : []);
  }, [open, entityLabel, attendeeEmail]);

  const connectGoogleCalendar = () => {
    startGoogleCalendarConnection(`${window.location.pathname}${window.location.search}`);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const start = new Date(startsAt);
    const end = new Date(start.getTime() + Number(durationMinutes) * 60_000);
    createMeeting.mutate({
      entityKind,
      entityId,
      title,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Bogota",
      attendees,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Schedule a Google Meet</DialogTitle>
          <DialogDescription>Create a Calendar event for {entityLabel}. Google Calendar emails the Meet invitation to each invitee.</DialogDescription>
        </DialogHeader>

        {connectionQuery.isPending ? (
          <div className="flex items-center gap-2 py-5 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />Checking Google Calendar connection…</div>
        ) : connectionQuery.isError ? (
          <div className="space-y-3 rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Could not check the Google Calendar connection. Make sure the integration database setup is complete.</p>
            <Button type="button" variant="outline" onClick={() => void connectionQuery.refetch()}>Try again</Button>
          </div>
        ) : connectionQuery.data?.connected ? (
          <>
            <p className="text-sm text-muted-foreground">Connected as <span className="font-medium text-foreground">{connectionQuery.data.email}</span></p>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="meet-title">Meeting title</Label>
                <Input id="meet-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={255} required />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_150px]">
                <div className="space-y-1.5">
                  <Label htmlFor="meet-start">Date and time</Label>
                  <Input id="meet-start" type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="meet-duration">Duration</Label>
                  <select id="meet-duration" className="h-10 w-full rounded-md border border-input bg-input px-3 text-sm" value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)}>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Participants <span className="font-normal text-muted-foreground">(optional)</span></Label>
                <MeetingParticipantsPicker value={attendees} onChange={setAttendees} disabled={createMeeting.isPending} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMeeting.isPending || !startsAt || !title.trim()}>
                  {createMeeting.isPending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <CalendarPlus className="mr-2 size-4" />}
                  {createMeeting.isPending ? "Creating…" : "Create event and send invites"}
                </Button>
              </DialogFooter>
            </form>

            <section className="space-y-2 border-t pt-4" aria-label="Scheduled meetings">
              <h3 className="text-sm font-medium">Meetings for this {entityKind}</h3>
              {meetingsQuery.isPending ? <p className="text-sm text-muted-foreground">Loading meetings…</p> : null}
              {meetingsQuery.data?.length === 0 ? <p className="text-sm text-muted-foreground">No meetings scheduled yet.</p> : null}
              {meetingsQuery.data?.map((meeting) => (
                <div key={meeting.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{meeting.title}</p>
                    <p className="text-xs text-muted-foreground">{displayDate(meeting.startsAt)} · {meeting.attendees.length} invitee{meeting.attendees.length === 1 ? "" : "s"}</p>
                  </div>
                  <div className="flex gap-2">
                    {meeting.meetUrl ? <Button asChild size="sm"><a href={meeting.meetUrl} target="_blank" rel="noopener noreferrer"><Video className="mr-1.5 size-3.5" />Join Meet</a></Button> : null}
                    {meeting.calendarUrl ? <Button asChild variant="outline" size="sm"><a href={meeting.calendarUrl} target="_blank" rel="noopener noreferrer" aria-label="Open event in Google Calendar"><ExternalLink className="size-3.5" /></a></Button> : null}
                  </div>
                </div>
              ))}
            </section>
          </>
        ) : connectionQuery.data?.configured === false ? (
          <div className="rounded-lg border p-4 text-sm text-muted-foreground">
            Google Calendar needs to be configured by the system administrator before it can be connected.
          </div>
        ) : (
          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <Video className="mt-0.5 size-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Connect your Google Calendar</p>
                <p className="mt-1 text-sm text-muted-foreground">Maros will create events and Meet links on your calendar, then email invitations to attendees.</p>
              </div>
            </div>
            <Button type="button" onClick={connectGoogleCalendar}>Connect Google Calendar</Button>
            <GoogleCalendarPrivacyNotice />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
