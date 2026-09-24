import type { Metadata } from "next";
import Script from "next/script";
import { SessionWrapper } from "@/components/SessionWrapper";
import { AuthNav } from "@/components/AuthNav";
import { ChatWidget } from "@/components/ChatWidget";
import "./globals.css";

export const metadata: Metadata = {
  title: "Southeast Precision Partners | Strategic Continuity for Founder-Led Businesses",
  description: "SEP Partners acquires and operates high-quality lower-middle-market companies in the I-85 and I-77 Industrial Corridors.",
};

// Product analytics. The key comes from the environment only; with it unset the
// script is not rendered at all.
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
const posthogSnippet = POSTHOG_KEY
  ? `!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);posthog.init(${JSON.stringify(POSTHOG_KEY)},{api_host:${JSON.stringify(POSTHOG_HOST)},capture_pageview:"history_change",capture_pageleave:true,persistence:"localStorage+cookie"});`
  : null;

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
              <div className="flex items-center gap-3">
                <a href="/" className="text-xs text-text-secondary hover:text-foreground transition-colors">Home</a>
                <a href="/about" className="text-xs text-text-secondary hover:text-foreground transition-colors">About</a>
                <span className="text-border-custom">|</span>
                <a href="/deals/mosaic" className="text-xs text-text-secondary hover:text-foreground transition-colors">Project Mosaic</a>
                <a href="/details" className="text-xs text-text-secondary hover:text-foreground transition-colors">Details</a>
                <a href="/crm" className="text-xs text-text-secondary hover:text-foreground transition-colors">CRM</a>
                <a href="/outreach" className="text-xs text-text-secondary hover:text-foreground transition-colors">Outreach</a>
                <a href="/map" className="text-xs text-text-secondary hover:text-foreground transition-colors">Map</a>
                <a href="/import" className="text-xs text-text-secondary hover:text-foreground transition-colors">Import</a>
                <a href="/submit" className="text-xs text-text-secondary hover:text-foreground transition-colors">Submit</a>
                <div className="border-l border-border-custom pl-3 ml-1">
                  <AuthNav />
                </div>
              </div>
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
              <div className="border-t border-white/10 pt-4 text-[10px] text-center">
                &copy; {new Date().getFullYear()} Southeast Precision Partners, LLC. All Rights Reserved. | Confidential
              </div>
            </div>
          </footer>

          <ChatWidget />
        </SessionWrapper>
        {posthogSnippet ? (
          <Script id="posthog" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: posthogSnippet }} />
        ) : null}
      </body>
    </html>
  );
}
