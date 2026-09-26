export type GoogleCalendarConnection = {
  configured: boolean;
  connected: boolean;
  email?: string;
};

export type GoogleCalendarMeeting = {
  id: number;
  entityKind: "lead" | "task" | null;
  entityId: number | null;
  title: string;
  meetUrl: string | null;
  calendarUrl: string | null;
  startsAt: string;
  endsAt: string;
  attendees: string[];
};

export type CreateGoogleCalendarMeeting = {
  entityKind?: "lead" | "task";
  entityId?: number;
  title: string;
  startsAt: string;
  endsAt: string;
  timeZone: string;
  attendees: string[];
};

export const googleCalendarConnectionKey = ["google-calendar", "connection"] as const;
export const googleCalendarMeetingsKey = ["google-calendar", "meetings"] as const;
