"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, CalendarPlus, Clock3, ExternalLink, LoaderCircle, Video } from "lucide-react";
import { toast } from "sonner";
import { PageHeaderCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { optimizedApiClient } from "@/shared/infra/http/OptimizedApiClient";
import { connectGoogleCalendar } from "../../connectGoogleCalendar";
import { MeetingParticipantsPicker } from "../MeetingParticipantsPicker";
import { GoogleCalendarPrivacyNotice } from "../GoogleCalendarPrivacyNotice";
import {
  googleCalendarConnectionKey,
  googleCalendarMeetingsKey,
  type CreateGoogleCalendarMeeting,
  type GoogleCalendarConnection,
  type GoogleCalendarMeeting,
} from "../../types";

function localDateTimeValue(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function defaultStartValue(): string {
  const start = new Date();
  start.setHours(start.getHours() + 1, 0, 0, 0);
  return localDateTimeValue(start);
}

export function MeetNowPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("Maros meeting");
  const [startsAt, setStartsAt] = useState(defaultStartValue);
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [attendees, setAttendees] = useState<string[]>([]);
  const [createdMeeting, setCreatedMeeting] = useState<GoogleCalendarMeeting | null>(null);
  const connection = useQuery({
    queryKey: googleCalendarConnectionKey,
    queryFn: async () => (await optimizedApiClient.get<GoogleCalendarConnection>("/google-calendar/connection")).data,
  });
  const createMeeting = useMutation({
    mutationFn: async (input: CreateGoogleCalendarMeeting) => (await optimizedApiClient.post<GoogleCalendarMeeting>("/google-calendar/meetings", input)).data,
    onSuccess: async (meeting) => {
      setCreatedMeeting(meeting);
      await queryClient.invalidateQueries({ queryKey: googleCalendarMeetingsKey });
      toast.success(
        meeting.attendees.length
          ? `Calendar sent invitations to ${meeting.attendees.length} participant${meeting.attendees.length === 1 ? "" : "s"}.`
          : "Event created and saved to Google Calendar.",
      );
    },
    onError: (error: unknown) => toast.error(error instanceof Error ? error.message : "Could not create the meeting."),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const start = new Date(startsAt);
    const end = new Date(start.getTime() + Number(durationMinutes) * 60_000);
    createMeeting.mutate({
      title: title.trim(),
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Bogota",
      attendees,
    });
  };

  return (
    <div className="flex w-full flex-1 flex-col gap-4">
      <PageHeaderCard
        icon={Video}
        title="Schedule a meeting"
        description="Choose a date, invite Maros users or guests, and create a Google Meet link."
        rightSlot={<Button asChild variant="outline"><Link href="/calendar"><CalendarDays className="mr-2 size-4" />Calendar</Link></Button>}
      />

      {connection.isPending ? (
        <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground" role="status"><LoaderCircle className="size-4 animate-spin" />Checking Google Calendar connection…</div>
      ) : connection.isError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm">
          <p className="text-destructive">Could not load your Google Calendar connection.</p>
          <Button type="button" variant="outline" className="mt-3" onClick={() => void connection.refetch()}>Try again</Button>
        </div>
      ) : connection.data?.configured === false ? (
        <p className="rounded-2xl border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">Google Calendar must be configured by a system administrator.</p>
      ) : connection.data?.connected ? (
        <>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-primary/15 bg-primary/10 px-4 py-3 text-sm text-primary">Google Calendar connected <span aria-hidden="true" className="text-primary/60">·</span><span className="font-medium text-foreground">{connection.data.email}</span></p>
          <Card className="max-w-3xl overflow-hidden rounded-2xl shadow-sm">
            <CardHeader className="border-b bg-muted/20 px-5 py-5 sm:px-6"><CardTitle className="text-lg">New calendar event</CardTitle><p className="text-sm text-muted-foreground">Your invitees will receive the event and Google Meet link by email.</p></CardHeader>
            <CardContent className="px-5 py-5 sm:px-6">
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="quick-meet-title">Meeting title</Label>
                  <Input id="quick-meet-title" value={title} onChange={(event) => { setTitle(event.target.value); setCreatedMeeting(null); }} maxLength={255} required />
                </div>
                <div className="grid grid-cols-1 gap-4 rounded-xl bg-muted/25 p-4 sm:grid-cols-[1fr_170px]">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor="quick-meet-start">Date and time</Label>
                      <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setStartsAt(localDateTimeValue(new Date()))}>Set to now</Button>
                    </div>
                    <Input id="quick-meet-start" type="datetime-local" value={startsAt} onChange={(event) => { setStartsAt(event.target.value); setCreatedMeeting(null); }} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="quick-meet-duration">Duration</Label>
                    <Select value={durationMinutes} onValueChange={(value) => { setDurationMinutes(value); setCreatedMeeting(null); }}>
                      <SelectTrigger id="quick-meet-duration" aria-label="Duration"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Participants <span className="font-normal text-muted-foreground">(optional)</span></Label>
                  <MeetingParticipantsPicker value={attendees} onChange={(next) => { setAttendees(next); setCreatedMeeting(null); }} disabled={createMeeting.isPending} />
                </div>
                <Button type="submit" className="w-full sm:w-auto" disabled={createMeeting.isPending || !title.trim() || !startsAt}>
                  {createMeeting.isPending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <CalendarPlus className="mr-2 size-4" />}
                  {createMeeting.isPending ? "Creating event…" : "Create event and Meet link"}
                </Button>
              </form>
            </CardContent>
          </Card>
          {createdMeeting ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/10 p-4 sm:max-w-3xl">
              <div className="min-w-0">
                <p className="truncate font-medium">{createdMeeting.title}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><Clock3 className="size-3.5" />{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(createdMeeting.startsAt))} · {createdMeeting.attendees.length} participant{createdMeeting.attendees.length === 1 ? "" : "s"}</p>
              </div>
              <div className="flex gap-2">
                {createdMeeting.meetUrl ? <Button asChild><a href={createdMeeting.meetUrl} target="_blank" rel="noopener noreferrer"><Video className="mr-2 size-4" />Join Meet</a></Button> : null}
                {createdMeeting.calendarUrl ? <Button asChild variant="outline" aria-label="Open event in Google Calendar"><a href={createdMeeting.calendarUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" /></a></Button> : null}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <section className="rounded-2xl border border-dashed bg-muted/20 p-6">
          <h2 className="font-semibold">Connect Google Calendar</h2>
          <p className="mt-1 text-sm text-muted-foreground">Connect your account before creating an event and Meet link.</p>
          <Button type="button" className="mt-4" onClick={() => connectGoogleCalendar("/meet")}>Connect Google Calendar</Button>
          <div className="mt-3"><GoogleCalendarPrivacyNotice /></div>
        </section>
      )}
    </div>
  );
}
