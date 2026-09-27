import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-svh bg-background px-6 py-12 text-foreground sm:py-20">
      <article className="prose prose-invert mx-auto max-w-3xl prose-headings:tracking-tight prose-a:text-primary">
        <Link href="/about" className="text-sm">Maros Construction CRM</Link>
        <h1>Privacy Policy</h1>
        <p>Effective September 26, 2026</p>
        <p>
          This policy explains how Maros Construction CRM (“Maros”) accesses and uses Google user data when you sign in or choose to connect Google Calendar.
        </p>

        <h2>Google account information</h2>
        <p>
          When you sign in with Google, Maros receives your name, email address, and profile image to identify your Maros account and create your signed-in session.
        </p>

        <h2>Google Calendar information</h2>
        <p>
          Calendar access is optional. If you connect Google Calendar, Maros receives the connected Google email address and authorization tokens. When you schedule or manage a meeting, Maros uses Google Calendar to create, update, or cancel that event on your primary calendar and to create a Google Meet link. Maros does not import or search your unrelated calendar events.
        </p>
        <p>
          Maros stores the connected Google email address and encrypted authorization tokens, together with meeting details needed by the CRM: the event ID, title, start and end times, attendee email addresses, Google Calendar link, Meet link, and any linked Maros lead or task.
        </p>

        <h2>How information is used and shared</h2>
        <p>
          Google account information is used to sign you in. Calendar information is used to provide the meeting and calendar features you request. If you add participants, their email addresses and the event details are sent to Google Calendar so it can create the event and deliver invitations or updates. Google handles those calendar invitations under its own services and policies.
        </p>
        <p>
          Maros’s use and transfer of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.
        </p>

        <h2>Storage, revocation, and deletion</h2>
        <p>
          Calendar connection details and meeting records are stored in the Maros CRM backend. Authorization tokens are encrypted before storage. Deleting a Maros user account deletes its stored Calendar connection and meeting records.
        </p>
        <p>
          You can revoke Maros’s Google access in your Google Account security settings. Revocation stops future access but does not by itself remove data already stored by Maros or cancel events already created in Google Calendar. To request deletion of stored Calendar connection or meeting data, contact Maros at <a href="mailto:info@marosconstruction.com">info@marosconstruction.com</a>.
        </p>

        <h2>Contact</h2>
        <p>
          For questions or data deletion requests, email <a href="mailto:info@marosconstruction.com">info@marosconstruction.com</a>.
        </p>
        <p><Link href="/about">About Maros Construction CRM</Link></p>
      </article>
    </main>
  );
}
