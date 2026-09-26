"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ExternalLink, LoaderCircle, Video } from "lucide-react";
import { PageHeaderCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { optimizedApiClient } from "@/shared/infra/http/OptimizedApiClient";
import { connectGoogleCalendar } from "../../connectGoogleCalendar";
import {
  googleCalendarConnectionKey,
  googleCalendarMeetingsKey,
  type GoogleCalendarConnection,
  type GoogleCalendarMeeting,
} from "../../types";

function formatDate(value: string, includeDate: boolean): string {
  return new Intl.DateTimeFormat(undefined, {
    ...(includeDate ? { dateStyle: "medium" as const } : {}),
    timeStyle: "short",
  }).format(new Date(value));
}

export function CalendarPage() {
  const connection = useQuery({
    queryKey: googleCalendarConnectionKey,
    queryFn: async () => (await optimizedApiClient.get<GoogleCalendarConnection>("/google-calendar/connection")).data,
  });
  const meetings = useQuery({
    queryKey: googleCalendarMeetingsKey,
    queryFn: async () => (await optimizedApiClient.get<GoogleCalendarMeeting[]>("/google-calendar/meetings")).data,
    enabled: connection.data?.connected === true,
  });
  const now = Date.now();
  const upcoming = (meetings.data ?? []).filter((meeting) => new Date(meeting.startsAt).getTime() >= now);
  const past = (meetings.data ?? []).filter((meeting) => new Date(meeting.startsAt).getTime() < now).reverse();

  return (
    <div className="flex w-full flex-1 flex-col gap-4">
      <PageHeaderCard
        icon={CalendarDays}
        title="Calendar"
        description="Meetings scheduled from Maros with your Google Calendar."
        rightSlot={
          <Button asChild>
            <Link href="/meet"><Video className="mr-2 size-4" />Start Meet</Link>
          </Button>
        }
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
          {meetings.isPending ? (
            <div className="space-y-3" role="status" aria-label="Loading meetings">
              {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-16 animate-pulse rounded-xl bg-muted" />)}
            </div>
          ) : meetings.isError ? (
            <div className="rounded-xl border border-destructive/40 p-5 text-sm">
              <p className="text-destructive">Could not load your meetings.</p>
              <Button type="button" variant="outline" className="mt-3" onClick={() => void meetings.refetch()}>Try again</Button>
            </div>
          ) : (
            <>
              <MeetingSection title="Upcoming" items={upcoming} />
              <MeetingSection title="Past meetings" items={past} />
            </>
          )}
        </>
      ) : (
        <section className="rounded-xl border border-dashed p-6">
          <h2 className="font-semibold">Connect Google Calendar</h2>
          <p className="mt-1 text-sm text-muted-foreground">Connect your account to see scheduled meetings and create Meet links from Maros.</p>
          <Button type="button" className="mt-4" onClick={() => connectGoogleCalendar("/calendar")}>Connect Google Calendar</Button>
        </section>
      )}
    </div>
  );
}

function MeetingSection({ title, items }: { title: string; items: GoogleCalendarMeeting[] }) {
  return (
    <section aria-label={title} className="rounded-xl border bg-card">
      <header className="border-b px-4 py-3 sm:px-6">
        <h2 className="font-semibold">{title}<span className="ml-2 text-xs font-normal text-muted-foreground">{items.length}</span></h2>
      </header>
      {items.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground sm:px-6">{title === "Upcoming" ? "No upcoming meetings. Start a Meet to create one." : "No past meetings."}</p>
      ) : (
        <div className="divide-y">
          {items.map((meeting) => (
            <article key={meeting.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-medium">{meeting.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(meeting.startsAt, true)} · {meeting.attendees.length} invitee{meeting.attendees.length === 1 ? "" : "s"}
                  {meeting.entityKind && meeting.entityId ? ` · Linked to ${meeting.entityKind} #${meeting.entityId}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                {meeting.meetUrl ? <Button asChild size="sm"><a href={meeting.meetUrl} target="_blank" rel="noopener noreferrer"><Video className="mr-1.5 size-3.5" />Join</a></Button> : null}
                {meeting.calendarUrl ? <Button asChild size="sm" variant="outline" aria-label="Open event in Google Calendar"><a href={meeting.calendarUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-3.5" /></a></Button> : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
