"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { optimizedApiClient } from "@/shared/infra/http/OptimizedApiClient";
import { MeetingParticipantsPicker } from "./MeetingParticipantsPicker";
import { googleCalendarMeetingsKey, type GoogleCalendarMeeting, type UpdateGoogleCalendarMeeting } from "../types";

function localDateTimeValue(value: string): string {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function MeetingEditDialog({
  meeting,
  open,
  onOpenChange,
}: {
  meeting: GoogleCalendarMeeting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [attendees, setAttendees] = useState<string[]>([]);

  useEffect(() => {
    if (!open || !meeting) return;
    setTitle(meeting.title);
    setStartsAt(localDateTimeValue(meeting.startsAt));
    setDurationMinutes(Math.max(15, Math.round((new Date(meeting.endsAt).getTime() - new Date(meeting.startsAt).getTime()) / 60_000)));
    setAttendees(meeting.attendees);
  }, [meeting, open]);

  const update = useMutation({
    mutationFn: async (input: UpdateGoogleCalendarMeeting) => (await optimizedApiClient.patch<GoogleCalendarMeeting>(`/google-calendar/meetings/${meeting?.id}`, input)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: googleCalendarMeetingsKey });
      toast.success("Meeting updated. Google Calendar notified the participants.");
      onOpenChange(false);
    },
    onError: (error: unknown) => toast.error(error instanceof Error ? error.message : "Could not update the meeting."),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!startsAt) return;
    const start = new Date(startsAt);
    const end = new Date(start.getTime() + durationMinutes * 60_000);
    update.mutate({
      title: title.trim(),
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
          <DialogTitle>Edit meeting</DialogTitle>
          <DialogDescription>Update the event details or participants. Google Calendar will email everyone about the changes.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-meeting-title">Meeting title</Label>
            <Input id="edit-meeting-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={255} required />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_150px]">
            <div className="space-y-1.5">
              <Label htmlFor="edit-meeting-start">Date and time</Label>
              <Input id="edit-meeting-start" type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-meeting-duration">Duration (minutes)</Label>
              <Input id="edit-meeting-duration" type="number" min={15} max={480} step={15} value={durationMinutes} onChange={(event) => setDurationMinutes(Number(event.target.value))} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Participants</Label>
            <MeetingParticipantsPicker value={attendees} onChange={setAttendees} disabled={update.isPending} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={update.isPending || !meeting || !title.trim() || !startsAt || durationMinutes < 15 || durationMinutes > 480}>
              {update.isPending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <CalendarClock className="mr-2 size-4" />}
              {update.isPending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
