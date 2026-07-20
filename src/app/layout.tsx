import type { Metadata } from "next";
import { SessionWrapper } from "@/components/SessionWrapper";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Southeast Precision Partners | Strategic Continuity for Founder-Led Businesses",
  description: "SEP Partners acquires and operates high-quality lower-middle-market companies in the I-85 and I-77 Industrial Corridors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SessionWrapper>
          <AppShell>{children}</AppShell>
        </SessionWrapper>
      </body>
    </html>
  );
}
