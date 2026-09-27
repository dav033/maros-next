"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Clock3, ExternalLink, LoaderCircle, Pencil, Search, Trash2, Video } from "lucide-react";
import { toast } from "sonner";
import { PageHeaderCard } from "@/components/shared";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserDirectory } from "@/features/users/presentation/hooks/data/useUserDirectory";
import { optimizedApiClient } from "@/shared/infra/http/OptimizedApiClient";
import { connectGoogleCalendar } from "../../connectGoogleCalendar";
import { googleCalendarConnectionKey, googleCalendarMeetingsKey, type GoogleCalendarConnection, type GoogleCalendarMeeting } from "../../types";
import { MeetingEditDialog } from "../MeetingEditDialog";
import { GoogleCalendarPrivacyNotice } from "../GoogleCalendarPrivacyNotice";

type CalendarView = "upcoming" | "past";

function formatDate(value: string, includeDate: boolean): string {
  return new Intl.DateTimeFormat(undefined, {
    ...(includeDate ? { dateStyle: "medium" as const } : {}),
    timeStyle: "short",
  }).format(new Date(value));
}

export function CalendarPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<CalendarView>("upcoming");
  const [search, setSearch] = useState("");
  const [meetingToEdit, setMeetingToEdit] = useState<GoogleCalendarMeeting | null>(null);
  const [meetingToCancel, setMeetingToCancel] = useState<GoogleCalendarMeeting | null>(null);
  const { users } = useUserDirectory(true);
  const connection = useQuery({
    queryKey: googleCalendarConnectionKey,
    queryFn: async () => (await optimizedApiClient.get<GoogleCalendarConnection>("/google-calendar/connection")).data,
  });
  const meetings = useQuery({
    queryKey: googleCalendarMeetingsKey,
    queryFn: async () => (await optimizedApiClient.get<GoogleCalendarMeeting[]>("/google-calendar/meetings")).data,
  });
  const cancelMeeting = useMutation({
    mutationFn: async (id: number) => optimizedApiClient.delete(`/google-calendar/meetings/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: googleCalendarMeetingsKey });
      toast.success("Meeting cancelled. Google Calendar notified the participants.");
      setMeetingToCancel(null);
    },
    onError: (error: unknown) => toast.error(error instanceof Error ? error.message : "Could not cancel the meeting."),
  });

  const now = Date.now();
  const allMeetings = meetings.data ?? [];
  const visibleMeetings = allMeetings
    .filter((meeting) => view === "upcoming"
      ? new Date(meeting.startsAt).getTime() >= now
      : new Date(meeting.startsAt).getTime() < now)
    .filter((meeting) => {
      const term = search.trim().toLowerCase();
      return !term || meeting.title.toLowerCase().includes(term) || meeting.attendees.some((email) => email.includes(term));
    })
    .sort((a, b) => view === "upcoming"
      ? new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      : new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());

  return (
    <div className="flex w-full flex-1 flex-col gap-4">
      <PageHeaderCard
        icon={CalendarDays}
        title="Calendar"
        description="Schedule events, manage meetings, and join invitations from your Maros teammates."
        rightSlot={<Button asChild><Link href="/meet"><CalendarDays className="mr-2 size-4" />Add event</Link></Button>}
      />

      {connection.isPending ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status"><LoaderCircle className="size-4 animate-spin" />Checking Google Calendar…</div>
      ) : connection.isError ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
          <span className="text-destructive">Could not check the Google Calendar connection.</span>
          <Button type="button" variant="outline" size="sm" onClick={() => void connection.refetch()}>Try again</Button>
        </div>
      ) : connection.data?.configured === false ? (
        <p className="rounded-2xl border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground">Google Calendar must be configured by a system administrator before you can create or manage events.</p>
      ) : connection.data?.connected ? (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-primary/15 bg-primary/10 px-4 py-3 text-sm text-primary">Google Calendar connected <span aria-hidden="true" className="text-primary/60">·</span><span className="font-medium text-foreground">{connection.data.email}</span></p>
      ) : (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed bg-muted/20 px-4 py-4">
          <div>
            <h2 className="text-sm font-medium">Connect Google Calendar to create meetings</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Invitations from Maros colleagues will still appear here.</p>
            <div className="mt-2"><GoogleCalendarPrivacyNotice /></div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => connectGoogleCalendar("/calendar")}>Connect Calendar</Button>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col gap-4 border-b bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="font-semibold">Your meetings</h2>
            <p className="mt-1 text-sm text-muted-foreground">Events you organize and invitations shared with your Maros account.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search meetings or people" className="pl-9" aria-label="Search meetings or people" />
            </div>
            <div className="flex w-fit rounded-xl bg-muted p-1" aria-label="Meeting period">
              <Button type="button" size="sm" variant="ghost" className={view === "upcoming" ? "rounded-lg bg-background text-foreground shadow-sm hover:bg-background" : "rounded-lg text-muted-foreground"} aria-pressed={view === "upcoming"} onClick={() => setView("upcoming")}>Upcoming</Button>
              <Button type="button" size="sm" variant="ghost" className={view === "past" ? "rounded-lg bg-background text-foreground shadow-sm hover:bg-background" : "rounded-lg text-muted-foreground"} aria-pressed={view === "past"} onClick={() => setView("past")}>Past</Button>
            </div>
          </div>
        </div>

        {meetings.isPending ? (
          <div className="space-y-3 p-4 sm:p-6" role="status" aria-label="Loading meetings">
            {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-24 animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : meetings.isError ? (
          <div className="p-6 text-sm">
            <p className="text-destructive">Could not load your meetings.</p>
            <Button type="button" variant="outline" className="mt-3" onClick={() => void meetings.refetch()}>Try again</Button>
          </div>
        ) : visibleMeetings.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CalendarDays className="mx-auto size-8 text-muted-foreground/60" />
            <h3 className="mt-3 text-sm font-medium">{search ? "No matching meetings" : view === "upcoming" ? "Nothing scheduled yet" : "No past meetings"}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{search ? "Try a different title or participant email." : view === "upcoming" ? "Add an event for any day and invite teammates or guests." : "Completed meetings will appear here."}</p>
            {!search && view === "upcoming" && connection.data?.connected ? <Button asChild className="mt-4"><Link href="/meet"><CalendarDays className="mr-2 size-4" />Schedule a meeting</Link></Button> : null}
          </div>
        ) : (
          <div className="divide-y">
            {visibleMeetings.map((meeting) => (
              <article key={meeting.id} className="flex flex-col gap-4 px-4 py-4 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <span className="text-[10px] font-semibold uppercase">{new Intl.DateTimeFormat(undefined, { month: "short" }).format(new Date(meeting.startsAt))}</span>
                    <span className="text-base font-semibold leading-none">{new Intl.DateTimeFormat(undefined, { day: "numeric" }).format(new Date(meeting.startsAt))}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="max-w-full truncate text-sm font-medium">{meeting.title}</h3>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">{meeting.isOrganizer ? "Organized by you" : "Invited"}</span>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                      <Clock3 className="size-3.5" />{formatDate(meeting.startsAt, true)} · {formatDate(meeting.endsAt, false)} end
                      {meeting.entityKind && meeting.entityId ? <span>· Linked to {meeting.entityKind} #{meeting.entityId}</span> : null}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {meeting.attendees.length ? meeting.attendees.map((email) => users.find((person) => person.email.toLowerCase() === email.toLowerCase())?.name ?? email).join(", ") : "No participants invited"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:shrink-0">
                  {meeting.meetUrl ? <Button asChild size="sm"><a href={meeting.meetUrl} target="_blank" rel="noopener noreferrer"><Video className="mr-1.5 size-3.5" />Join</a></Button> : null}
                  {meeting.calendarUrl ? <Button asChild size="sm" variant="outline" aria-label="Open event in Google Calendar"><a href={meeting.calendarUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-3.5" /></a></Button> : null}
                  {meeting.isOrganizer && view === "upcoming" ? (
                    <>
                      <Button type="button" size="sm" variant="outline" onClick={() => setMeetingToEdit(meeting)}><Pencil className="mr-1.5 size-3.5" />Edit</Button>
                      <Button type="button" size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setMeetingToCancel(meeting)} aria-label={`Cancel ${meeting.title}`}><Trash2 className="size-3.5" /></Button>
                    </>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <MeetingEditDialog meeting={meetingToEdit} open={meetingToEdit !== null} onOpenChange={(open) => { if (!open) setMeetingToEdit(null); }} />
      <AlertDialog open={meetingToCancel !== null} onOpenChange={(open) => { if (!open) setMeetingToCancel(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this meeting?</AlertDialogTitle>
            <AlertDialogDescription>
              {meetingToCancel ? `“${meetingToCancel.title}” will be removed from Google Calendar. Google Calendar will email the cancellation to its participants.` : "This event will be removed and participants will be notified."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMeeting.isPending}>Keep meeting</AlertDialogCancel>
            <AlertDialogAction disabled={cancelMeeting.isPending} onClick={(event) => { event.preventDefault(); if (meetingToCancel) cancelMeeting.mutate(meetingToCancel.id); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {cancelMeeting.isPending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}Cancel meeting
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
