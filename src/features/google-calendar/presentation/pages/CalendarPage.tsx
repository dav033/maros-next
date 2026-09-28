"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { addDays, addMonths, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, ExternalLink, List, LoaderCircle, Pencil, Search, Trash2, Video } from "lucide-react";
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

type CalendarMode = "month" | "agenda";
type AgendaPeriod = "upcoming" | "past";

const WEEKDAYS = Array.from({ length: 7 }, (_, index) =>
  format(addDays(startOfWeek(new Date(2024, 0, 7)), index), "EEE"),
);

function formatDate(value: string, includeDate: boolean): string {
  return new Intl.DateTimeFormat(undefined, {
    ...(includeDate ? { dateStyle: "medium" as const } : {}),
    timeStyle: "short",
  }).format(new Date(value));
}

export function CalendarPage() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<CalendarMode>("month");
  const [period, setPeriod] = useState<AgendaPeriod>("upcoming");
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date());
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
  const matchingMeetings = useMemo(() => {
    const term = search.trim().toLowerCase();
    return allMeetings.filter((meeting) =>
      !term || meeting.title.toLowerCase().includes(term) || meeting.attendees.some((email) => email.toLowerCase().includes(term)),
    );
  }, [allMeetings, search]);
  const meetingsByDay = useMemo(() => {
    const grouped = new Map<string, GoogleCalendarMeeting[]>();
    for (const meeting of matchingMeetings) {
      const key = format(new Date(meeting.startsAt), "yyyy-MM-dd");
      grouped.set(key, [...(grouped.get(key) ?? []), meeting]);
    }
    return grouped;
  }, [matchingMeetings]);
  const monthDays = useMemo(() => {
    const firstDay = startOfWeek(startOfMonth(month));
    return Array.from({ length: 42 }, (_, index) => addDays(firstDay, index));
  }, [month]);
  const visibleMeetings = matchingMeetings
    .filter((meeting) => period === "upcoming"
      ? new Date(meeting.startsAt).getTime() >= now
      : new Date(meeting.startsAt).getTime() < now)
    .sort((a, b) => period === "upcoming"
      ? new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      : new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
  const selectedDayMeetings = [...(meetingsByDay.get(format(selectedDate, "yyyy-MM-dd")) ?? [])]
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  const monthMeetingCount = matchingMeetings.filter((meeting) => isSameMonth(new Date(meeting.startsAt), month)).length;

  const renderMeeting = (meeting: GoogleCalendarMeeting) => (
    <article key={meeting.id} className="flex flex-col gap-4 px-4 py-4 transition-colors hover:bg-elev-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-container text-primary-on-container">
          <span className="font-display text-xs font-semibold uppercase">{format(new Date(meeting.startsAt), "MMM")}</span>
          <span className="text-base font-semibold leading-none">{format(new Date(meeting.startsAt), "d")}</span>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="max-w-full truncate text-sm font-medium">{meeting.title}</h3>
            <span className="rounded-full bg-elev-4 px-2.5 py-1 text-xs font-medium text-muted-foreground">{meeting.isOrganizer ? "Organized by you" : "Invited"}</span>
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
        {meeting.isOrganizer && new Date(meeting.startsAt).getTime() >= now ? (
          <>
            <Button type="button" size="sm" variant="outline" onClick={() => setMeetingToEdit(meeting)}><Pencil className="mr-1.5 size-3.5" />Edit</Button>
            <Button type="button" size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setMeetingToCancel(meeting)} aria-label={`Cancel ${meeting.title}`}><Trash2 className="size-3.5" /></Button>
          </>
        ) : null}
      </div>
    </article>
  );

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
        <p className="rounded-2xl border border-dashed border-line bg-elev-1 px-4 py-3 text-sm text-muted-foreground">Google Calendar must be configured by a system administrator before you can create or manage events.</p>
      ) : connection.data?.connected ? (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-line bg-primary-container px-4 py-3 text-sm text-primary-on-container">Google Calendar connected <span aria-hidden="true">·</span><span className="font-medium">{connection.data.email}</span></p>
      ) : (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-line bg-elev-1 px-4 py-4">
          <div>
            <h2 className="text-sm font-medium">Connect Google Calendar to create meetings</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Invitations from Maros colleagues will still appear here.</p>
            <div className="mt-2"><GoogleCalendarPrivacyNotice /></div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => connectGoogleCalendar("/calendar")}>Connect Calendar</Button>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col gap-4 border-b border-line bg-elev-3 px-4 py-4 sm:px-6">
          <div>
            <h2 className="font-semibold">Your calendar</h2>
            <p className="mt-1 text-sm text-muted-foreground">See meetings by day or browse your agenda.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative min-w-0 sm:w-64 sm:flex-1 lg:flex-none">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search meetings or people" className="pl-9" aria-label="Search meetings or people" />
            </div>
            <div className="flex w-fit rounded-xl bg-elev-4 p-1" aria-label="Calendar view">
              <Button type="button" size="sm" variant="ghost" className={mode === "month" ? "rounded-lg bg-elev-5 text-foreground shadow-sm hover:bg-elev-5" : "rounded-lg text-muted-foreground"} aria-pressed={mode === "month"} onClick={() => setMode("month")}><CalendarDays className="mr-1.5 size-3.5" />Month</Button>
              <Button type="button" size="sm" variant="ghost" className={mode === "agenda" ? "rounded-lg bg-elev-5 text-foreground shadow-sm hover:bg-elev-5" : "rounded-lg text-muted-foreground"} aria-pressed={mode === "agenda"} onClick={() => setMode("agenda")}><List className="mr-1.5 size-3.5" />Agenda</Button>
            </div>
            {mode === "agenda" ? (
              <div className="flex w-fit rounded-xl bg-elev-4 p-1" aria-label="Meeting period">
                <Button type="button" size="sm" variant="ghost" className={period === "upcoming" ? "rounded-lg bg-elev-5 text-foreground shadow-sm hover:bg-elev-5" : "rounded-lg text-muted-foreground"} aria-pressed={period === "upcoming"} onClick={() => setPeriod("upcoming")}>Upcoming</Button>
                <Button type="button" size="sm" variant="ghost" className={period === "past" ? "rounded-lg bg-elev-5 text-foreground shadow-sm hover:bg-elev-5" : "rounded-lg text-muted-foreground"} aria-pressed={period === "past"} onClick={() => setPeriod("past")}>Past</Button>
              </div>
            ) : null}
          </div>
        </div>

        {mode === "month" ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
              <div>
                <h3 className="text-lg font-semibold">{format(month, "MMMM yyyy")}</h3>
                <p className="text-sm text-muted-foreground">{monthMeetingCount} {monthMeetingCount === 1 ? "meeting" : "meetings"}{search ? " match your search" : " this month"}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Button type="button" variant="outline" size="icon" className="rounded-xl" aria-label="Previous month" onClick={() => { const nextMonth = addMonths(month, -1); setMonth(nextMonth); setSelectedDate(nextMonth); }}><ChevronLeft className="size-4" /></Button>
                <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => { const today = new Date(); setMonth(startOfMonth(today)); setSelectedDate(today); }}>Today</Button>
                <Button type="button" variant="outline" size="icon" className="rounded-xl" aria-label="Next month" onClick={() => { const nextMonth = addMonths(month, 1); setMonth(nextMonth); setSelectedDate(nextMonth); }}><ChevronRight className="size-4" /></Button>
              </div>
            </div>
            {meetings.isError ? (
              <div className="mx-4 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm sm:mx-6">
                <span className="text-destructive">Could not load your meetings.</span>
                <Button type="button" variant="outline" size="sm" onClick={() => void meetings.refetch()}>Try again</Button>
              </div>
            ) : meetings.isPending ? (
              <p className="px-4 pb-3 text-sm text-muted-foreground" role="status">Loading meetings…</p>
            ) : null}
            <div className="grid grid-cols-7 border-l border-t" aria-label={`${format(month, "MMMM yyyy")} calendar`}>
              {WEEKDAYS.map((weekday) => <div key={weekday} className="border-b border-r border-line bg-elev-3 px-1 py-2 text-center font-display text-xs font-semibold text-muted-foreground sm:px-2">{weekday}</div>)}
              {monthDays.map((day) => {
                const dayMeetings = meetingsByDay.get(format(day, "yyyy-MM-dd")) ?? [];
                const selected = isSameDay(day, selectedDate);
                const currentMonth = isSameMonth(day, month);
                const today = isSameDay(day, new Date());
                return (
                  <button
                    key={format(day, "yyyy-MM-dd")}
                    type="button"
                    aria-label={`${format(day, "EEEE, MMMM d, yyyy")}: ${dayMeetings.length} ${dayMeetings.length === 1 ? "meeting" : "meetings"}`}
                    aria-pressed={selected}
                    aria-current={today ? "date" : undefined}
                    onClick={() => { setSelectedDate(day); if (!currentMonth) setMonth(startOfMonth(day)); }}
                    className={`min-w-0 min-h-[4.75rem] border-b border-r border-line p-2 text-left transition-colors hover:bg-elev-3 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:min-h-28 ${currentMonth ? "bg-elev-2" : "bg-elev-1 text-fg-faint"} ${selected ? "bg-primary-container ring-1 ring-inset ring-primary" : ""}`}
                  >
                    <span className="mb-1 flex items-center justify-between gap-1">
                      <span className={`flex size-6 items-center justify-center rounded-full text-xs font-medium ${selected ? "bg-primary text-primary-foreground" : today ? "bg-primary-container text-primary-on-container" : currentMonth ? "text-foreground" : "text-muted-foreground"}`}>{format(day, "d")}</span>
                      {dayMeetings.length ? <span className="flex items-center gap-1 text-xs text-primary sm:hidden"><span className="size-1.5 rounded-full bg-primary" />{dayMeetings.length}</span> : null}
                    </span>
                    <span className="hidden space-y-1 md:block">
                      {dayMeetings.slice(0, 2).map((meeting) => (
                        <span key={meeting.id} className="flex min-w-0 items-center gap-1 rounded-md bg-primary-container px-1.5 py-1 text-xs leading-tight text-primary-on-container">
                          <span className="shrink-0 tabular-nums">{format(new Date(meeting.startsAt), "h:mm a")}</span>
                          <span className="truncate">{meeting.title}</span>
                        </span>
                      ))}
                      {dayMeetings.length > 2 ? <span className="block truncate px-1 text-xs text-muted-foreground">+{dayMeetings.length - 2} more</span> : null}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="border-t border-line px-0 py-4 sm:py-6">
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6">
                <h3 className="font-semibold">{format(selectedDate, "EEEE, MMMM d")}</h3>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">{selectedDayMeetings.length} {selectedDayMeetings.length === 1 ? "meeting" : "meetings"}</span>
              </div>
              {selectedDayMeetings.length ? <div className="mt-2 divide-y">{selectedDayMeetings.map(renderMeeting)}</div> : (
                <div className="px-6 py-8 text-center">
                  <p className="text-sm font-medium">No meetings this day</p>
                  <p className="mt-1 text-sm text-muted-foreground">Choose another date or add an event.</p>
                  {connection.data?.connected ? <Button asChild variant="secondary" className="mt-3"><Link href="/meet"><CalendarDays className="mr-2 size-4" />Add event</Link></Button> : null}
                </div>
              )}
            </div>
          </>
        ) : meetings.isPending ? (
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
            <CalendarDays className="mx-auto size-8 text-fg-faint" />
            <h3 className="mt-3 text-sm font-medium">{search ? "No matching meetings" : period === "upcoming" ? "Nothing scheduled yet" : "No past meetings"}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{search ? "Try a different title or participant email." : period === "upcoming" ? "Add an event for any day and invite teammates or guests." : "Completed meetings will appear here."}</p>
            {!search && period === "upcoming" && connection.data?.connected ? <Button asChild className="mt-4"><Link href="/meet"><CalendarDays className="mr-2 size-4" />Schedule a meeting</Link></Button> : null}
          </div>
        ) : (
          <div className="divide-y">{visibleMeetings.map(renderMeeting)}</div>
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
