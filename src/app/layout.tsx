import type { Metadata } from "next";
import "../styles/globals.css";
import { AppProviders } from "./AppProviders";
import Sidebar from "@/components/sidebar/Sidebar";
import { SidebarProvider } from "@/components/sidebar/SidebarContext";
import { MobileMenuButton } from "@/components/sidebar/MobileMenuButton";

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
            <Sidebar />
            <main className="flex-1 overflow-auto lg:ml-80">{children}</main>
          </SidebarProvider>
        </AppProviders>
      </body>
    </html>
  );
}
