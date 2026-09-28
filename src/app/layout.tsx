import type { Metadata } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
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

// tailwind.config.ts reads these three variables as font-display, font-sans
// and font-mono. Figures belong in the mono face.
const fontDisplay = Archivo({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const fontSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Maros Construction CRM",
  description: "Construction project, customer, task, and meeting management for Maros Construction.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Public pages do not need a CRM session lookup.
  const publicPath = (await headers()).get("x-pathname") ?? "";
  const isPublicPage =
    publicPath.startsWith("/p/") ||
    publicPath === "/about" ||
    publicPath === "/privacy-policy";

  // Only real on pages behind middleware's auth check — on /login there is
  // no session cookie yet, and fetchCurrentUser resolves to null.
  const currentUser = isPublicPage ? null : await fetchCurrentUser();

  return (
    // "dark" is rendered on the server so the first paint is already themed:
    // next-themes only applies its class from a client script, and anything
    // behind the `dark:` variant would flash unthemed until it runs. It strips
    // theme names only when it applies its own, so the two coexist.
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`}
    >
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
