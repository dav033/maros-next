import type { Metadata } from "next";
import Script from "next/script";
import "../styles/globals.css";
import { AppProviders } from "./AppProviders";
import { MobileMenuButton, Sidebar, SidebarProvider } from "@dav033/dav-components";
import { SIDEBAR_CONFIG } from "@/components/sidebar/sidebarConfig";

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
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en">
      <body className="flex h-screen">
        <AppProviders>
          <SidebarProvider>
            <MobileMenuButton />
            <Sidebar config={SIDEBAR_CONFIG} />
            <main className="flex-1 overflow-auto p-4 lg:p-6 lg:ml-80">{children}</main>
          </SidebarProvider>
        </AppProviders>

        <Script id="google-maps-init" strategy="beforeInteractive">
          {`window.initMaps = function () { window.dispatchEvent(new Event('google-maps-loaded')); };`}
        </Script>

        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyC-f-9Onj4n6jVVjP9MryKvm3aQgyxx5zM&libraries=places&callback=initMaps`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
