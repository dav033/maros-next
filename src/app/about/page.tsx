import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-svh bg-background px-6 py-16 text-foreground sm:py-24">
      <div className="mx-auto max-w-3xl space-y-10">
        <header className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Maros Construction</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Maros Construction CRM</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            A workspace for authorized Maros Construction team members to manage customers, projects, tasks, invoices, and meetings.
          </p>
        </header>

        <section className="space-y-3 rounded-2xl border bg-card p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold">Calendar and Google Meet</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Team members can connect Google Calendar when they choose to schedule a meeting. Maros creates, updates, or cancels events on the connected user’s primary calendar, creates a Google Meet link, and can send invitations to the email addresses selected for that event. Maros does not import or search unrelated calendar events.
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            Google account information is used to sign in to Maros. Calendar access is requested separately and only when a user connects Calendar.
          </p>
        </section>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <Link className="underline underline-offset-4" href="/privacy-policy">Privacy policy</Link>
          <Link className="underline underline-offset-4" href="/login">Sign in</Link>
          <a className="underline underline-offset-4" href="mailto:info@marosconstruction.com">Contact Maros Construction</a>
        </nav>
      </div>
    </main>
  );
}
