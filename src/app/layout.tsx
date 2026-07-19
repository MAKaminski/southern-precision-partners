import type { Metadata } from "next";
import { SessionWrapper } from "@/components/SessionWrapper";
import { MainNav } from "@/components/MainNav";
import { ChatWidget } from "@/components/ChatWidget";
import { PageClassificationFooter } from "@/components/PageClassificationFooter";
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
          {/* Top bar */}
          <div className="bg-[#0F172A] text-white/60 text-[10px] text-center py-1.5 tracking-wide">
            Southeast Precision Partners, LLC | Charlotte, NC |{" "}
            <a href="mailto:info@sep-partners.com" className="text-white/80 hover:text-white">info@sep-partners.com</a>{" "}
            | (704) 920-8593
          </div>

          {/* Navigation */}
          <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border-custom">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <a href="/" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#0F172A] flex items-center justify-center text-white text-[10px] font-bold">
                  SEP
                </div>
                <span className="text-sm font-semibold tracking-tight text-foreground hidden sm:inline">
                  Southeast Precision Partners
                </span>
              </a>
              <MainNav />
            </div>
          </nav>

          <main className="flex-1">{children}</main>

          <footer className="bg-[#0F172A] text-white/50 py-8">
            <div className="max-w-5xl mx-auto px-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                <div>
                  <div className="text-white font-semibold text-sm mb-2">Southeast Precision Partners</div>
                  <p className="text-xs leading-relaxed">
                    Providing Capital and Stewardship for the Southeast Industrial Corridor.
                  </p>
                </div>
                <div>
                  <div className="text-white/70 text-xs font-semibold uppercase mb-2">Headquarters</div>
                  <p className="text-xs">5960 Fairview Road, Suite 400<br />Charlotte, NC 28210</p>
                </div>
                <div>
                  <div className="text-white/70 text-xs font-semibold uppercase mb-2">Contact</div>
                  <p className="text-xs">
                    <a href="mailto:info@sep-partners.com" className="text-blue-400 hover:text-blue-300">info@sep-partners.com</a>
                    <br />(704) 920-8593
                  </p>
                </div>
              </div>
              <div className="border-t border-white/10 pt-4 space-y-2">
                <PageClassificationFooter />
                <div className="text-[10px] text-center">
                  &copy; {new Date().getFullYear()} Southeast Precision Partners, LLC. All Rights Reserved.
                </div>
              </div>
            </div>
          </footer>

          <ChatWidget />
        </SessionWrapper>
      </body>
    </html>
  );
}
