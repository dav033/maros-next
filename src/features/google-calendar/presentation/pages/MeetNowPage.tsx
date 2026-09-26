"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, ExternalLink, LoaderCircle, Video } from "lucide-react";
import { toast } from "sonner";
import { PageHeaderCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { optimizedApiClient } from "@/shared/infra/http/OptimizedApiClient";
import { connectGoogleCalendar } from "../../connectGoogleCalendar";
import {
  googleCalendarConnectionKey,
  googleCalendarMeetingsKey,
  type CreateGoogleCalendarMeeting,
  type GoogleCalendarConnection,
  type GoogleCalendarMeeting,
} from "../../types";

export function MeetNowPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("Maros meeting");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [attendees, setAttendees] = useState("");
  const [createdMeeting, setCreatedMeeting] = useState<GoogleCalendarMeeting | null>(null);
  const connection = useQuery({
    queryKey: googleCalendarConnectionKey,
    queryFn: async () => (await optimizedApiClient.get<GoogleCalendarConnection>("/google-calendar/connection")).data,
  });
  const createMeeting = useMutation({
    mutationFn: async (input: CreateGoogleCalendarMeeting) => (await optimizedApiClient.post<GoogleCalendarMeeting>("/google-calendar/meetings", input)).data,
    onSuccess: async (meeting) => {
      await queryClient.invalidateQueries({ queryKey: googleCalendarMeetingsKey });
      toast.success(
        meeting.attendees.length
          ? `Meet created. Google Calendar emailed ${meeting.attendees.length} invitee${meeting.attendees.length === 1 ? "" : "s"}.`
          : "Meet created and saved to Google Calendar.",
      );
    },
    onError: (error: unknown) => toast.error(error instanceof Error ? error.message : "Could not start the Meet."),
  });

  const startMeet = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const meetWindow = window.open("about:blank", "_blank");
    const startsAt = new Date();
    const endsAt = new Date(startsAt.getTime() + Number(durationMinutes) * 60_000);
    const invitees = [...new Set(attendees.split(/[\n,;]/).map((email) => email.trim().toLowerCase()).filter(Boolean))];

    try {
      const meeting = await createMeeting.mutateAsync({
        title: title.trim(),
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Bogota",
        attendees: invitees,
      });
      setCreatedMeeting(meeting);
      if (meetWindow && meeting.meetUrl) {
        meetWindow.opener = null;
        meetWindow.location.replace(meeting.meetUrl);
      } else {
        meetWindow?.close();
      }
    } catch {
      meetWindow?.close();
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col gap-4">
      <PageHeaderCard
        icon={Video}
        title="Start Meet"
        description="Create a Google Calendar event and open its Meet link right away."
      />

      {connection.isPending ? (
        <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground" role="status">
          <LoaderCircle className="size-4 animate-spin" />Checking Google Calendar connection…
        </div>
      ) : connection.isError ? (
        <div className="rounded-xl border border-destructive/40 p-5 text-sm">
          <p className="text-destructive">Could not load your Google Calendar connection.</p>
          <Button type="button" variant="outline" className="mt-3" onClick={() => void connection.refetch()}>Try again</Button>
        </div>
      ) : connection.data?.configured === false ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Google Calendar must be configured by a system administrator.</p>
      ) : connection.data?.connected ? (
        <>
          <p className="text-sm text-muted-foreground">Connected as <span className="font-medium text-foreground">{connection.data.email}</span></p>
          <Card className="max-w-2xl">
            <CardHeader><CardTitle className="text-base">New meeting</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={startMeet} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="quick-meet-title">Meeting title</Label>
                  <Input id="quick-meet-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={255} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="quick-meet-duration">Duration</Label>
                  <select id="quick-meet-duration" className="h-10 w-full rounded-md border border-input bg-input px-3 text-sm sm:w-48" value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)}>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="quick-meet-attendees">Invitees <span className="font-normal text-muted-foreground">(optional)</span></Label>
                  <Textarea id="quick-meet-attendees" value={attendees} onChange={(event) => setAttendees(event.target.value)} placeholder="name@example.com, another@example.com" rows={3} />
                  <p className="text-xs text-muted-foreground">Separate email addresses with commas or new lines. Google Calendar emails each invitee the event and Meet link.</p>
                </div>
                <Button type="submit" disabled={createMeeting.isPending || !title.trim()}>
                  {createMeeting.isPending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <CalendarPlus className="mr-2 size-4" />}
                  {createMeeting.isPending ? "Starting Meet…" : "Start Meet now"}
                </Button>
              </form>
            </CardContent>
          </Card>
          {createdMeeting?.meetUrl ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4 sm:max-w-2xl">
              <div>
                <p className="font-medium">{createdMeeting.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">The event is on your calendar. Share the Meet link with anyone joining.</p>
              </div>
              <div className="flex gap-2">
                <Button asChild><a href={createdMeeting.meetUrl} target="_blank" rel="noopener noreferrer"><Video className="mr-2 size-4" />Join Meet</a></Button>
                {createdMeeting.calendarUrl ? <Button asChild variant="outline" aria-label="Open event in Google Calendar"><a href={createdMeeting.calendarUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" /></a></Button> : null}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <section className="rounded-xl border border-dashed p-6">
          <h2 className="font-semibold">Connect Google Calendar</h2>
          <p className="mt-1 text-sm text-muted-foreground">Connect your account before creating a Meet link.</p>
          <Button type="button" className="mt-4" onClick={() => connectGoogleCalendar("/meet")}>Connect Google Calendar</Button>
        </section>
      )}
    </div>
  );
}
