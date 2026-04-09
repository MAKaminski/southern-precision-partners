import type { Metadata } from "next";
import { SessionWrapper } from "@/components/SessionWrapper";
import { AuthNav } from "@/components/AuthNav";
import { ChatWidget } from "@/components/ChatWidget";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Mosaic | Southern Precision Partners",
  description: "Tile Center Group — Leveraged Buyout | Confidential",
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
          {/* Confidential Banner */}
          <div className="sticky top-0 z-50 bg-accent-blue/5 border-b border-accent-blue/15 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 py-2 text-center text-xs tracking-wide text-accent-blue font-medium">
              CONFIDENTIAL — For Discussion Purposes Only | Project Mosaic | Southern Precision Partners
            </div>
          </div>

          {/* Navigation */}
          <nav className="sticky top-[33px] z-40 bg-background/90 backdrop-blur-md border-b border-border-custom">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-semibold tracking-tight text-foreground">
                Project Mosaic
              </span>
              <div className="flex items-center gap-4">
                <a href="/" className="text-sm text-text-secondary hover:text-foreground transition-colors">Summary</a>
                <a href="/details" className="text-sm text-text-secondary hover:text-foreground transition-colors">Details</a>
                <a href="/crm" className="text-sm text-text-secondary hover:text-foreground transition-colors">CRM</a>
                <a href="/outreach" className="text-sm text-text-secondary hover:text-foreground transition-colors">Outreach</a>
                <a href="/map" className="text-sm text-text-secondary hover:text-foreground transition-colors">Map</a>
                <a href="/submit" className="text-sm text-text-secondary hover:text-foreground transition-colors">Submit Deal</a>
                <div className="border-l border-border-custom pl-4 ml-2">
                  <AuthNav />
                </div>
              </div>
            </div>
          </nav>

          <main className="flex-1">{children}</main>

          <footer className="border-t border-border-custom py-6 text-center text-xs text-text-secondary">
            &copy; {new Date().getFullYear()} Southern Precision Partners. All rights reserved. Confidential.
          </footer>

          <ChatWidget />
        </SessionWrapper>
      </body>
    </html>
  );
}
