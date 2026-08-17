import type { Metadata } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import "../styles/globals.css";
import { AppProviders } from "./AppProviders";
import { AppShell } from "./AppShell";
import { Toaster } from "@/components/ui/sonner";
import { fetchCurrentUser } from "@/shared/auth/currentUser";

declare global {
  interface Window {
    initMaps?: () => void;
  }
}

export const metadata: Metadata = {
  title: "Maros Next App",
  description: "Next.js application with Clean Architecture",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Published notes are read by people with no account here, so asking the API who
  // they are would be a guaranteed 401 on every one of those requests. Middleware
  // stamps the pathname precisely so this can be skipped.
  const isPublicReader = (await headers()).get("x-pathname")?.startsWith("/p/") ?? false;

  // Only real on pages behind middleware's auth check — on /login there is
  // no session cookie yet, and fetchCurrentUser resolves to null.
  const currentUser = isPublicReader ? null : await fetchCurrentUser();

  return (
    <html lang="en" className="dark">
      <body className="min-h-svh bg-background text-foreground font-sans">
        <AppProviders currentUser={currentUser}>
          <AppShell>{children}</AppShell>
          <Toaster />
        </AppProviders>

        <Script id="google-maps-init" strategy="beforeInteractive">
          {`window.initMaps = function () { window.dispatchEvent(new Event('google-maps-loaded')); };`}
        </Script>

        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMaps`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

