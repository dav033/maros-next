import type { Metadata } from "next";
import Script from "next/script";
import { Work_Sans } from "next/font/google";
import "../styles/globals.css";
import { AppProviders } from "./AppProviders";
import { AppShell } from "./AppShell";
import { Toaster } from "@/components/ui/sonner";

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-work-sans",
  display: "swap",
});

declare global {
  interface Window {
    initMaps?: () => void;
  }
}

export const metadata: Metadata = {
  title: "Maros Next App",
  description: "Next.js application with Clean Architecture",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${workSans.variable}`}>
      <body className="min-h-svh bg-background text-foreground font-sans">
        <AppProviders>
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

