import Link from "next/link";

export function GoogleCalendarPrivacyNotice() {
  return (
    <p className="text-xs text-muted-foreground">
      Maros uses Calendar data to manage the events you request. <Link className="underline underline-offset-4" href="/privacy-policy">Read the privacy policy.</Link>
    </p>
  );
}
