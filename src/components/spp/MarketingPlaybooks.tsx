"use client";

import { useMemo } from "react";
import type { CustomerWithSales } from "@/lib/spp-queries";
import { classifyCustomers } from "@/lib/customer-segmentation";

const money = (v: number) =>
  Math.abs(v) >= 1_000_000 ? `$${(v / 1_000_000).toFixed(2)}M` : `$${Math.round(v).toLocaleString()}`;

export function MarketingPlaybooks({ customers }: { customers: CustomerWithSales[] }) {
  const classified = useMemo(() => classifyCustomers(customers), [customers]);
  const tier1 = classified.filter((c) => c.segment === "b2b_tier1");
  const tier23 = classified.filter((c) => c.segment === "b2b_tier2" || c.segment === "b2b_tier3");
  const indiv = classified.filter((c) => c.segment === "individual_repeat" || c.segment === "individual_single");

  return (
    <section>
      <h2 className="text-sm font-semibold text-foreground mb-1">Marketing Playbooks</h2>
      <p className="text-[11px] text-text-secondary mb-3">
        Grounded in the real composition of the segments above (customer names, order patterns, and trade
        signals) — a starting point to work from with the marketing &amp; growth lead, not a finished plan.
      </p>

      <div className="space-y-4">
        <Playbook
          title="B2B Tier 1 — Key Accounts"
          stat={`${tier1.length} accounts · ${money(tier1.reduce((s, c) => s + (Number(c.customer.lifetime_sales) || 0), 0))} lifetime`}
          profile="Reading the actual names in this tier: general contractors and residential/commercial builders
            (MWS Construction, Alan Sturkie Builders, Covert Homes, Dunbar Builders, Old Glory Construction,
            Capital City Builders), specialty tile/flooring contractors (Carolina Tile, Elite Tile, L.C. Tile,
            Extreme Tile Co), a design-build firm (Gallup Design Build), a developer (Sandlapper Dev), and several
            high-volume independent installers (Todd K. Corley at 252 lifetime orders, Teddy Dowling, Barry Wise,
            Marvin Tisdale) who place frequent small material orders — consistent with working tradespeople buying
            job-by-job, not one-off consumers."
          findMore={[
            "SC LLR contractor license lookup is public — pull newly-licensed and active GC/residential-builder licenses in the Columbia and Florence trade areas as a cold-outreach list.",
            "County building-permit databases (Richland/Lexington for Columbia, Florence County) list active new-construction and remodel permits with the GC of record — a warm, timed prospecting list (they need materials now).",
            "Join/sponsor the local HBA chapters (Midlands / Columbia, Pee Dee / Florence) and trade associations (NTCA, CTDA, AGC of SC) that this tier's builders and installers already belong to — vendor-member visibility beats cold outreach in trades.",
            "Local SEO/SEM for \"tile distributor Columbia SC\" and \"flooring supplier Florence SC\" — this is how an in-market GC or installer already searching for a new supplier finds one.",
            "The Pro Desk Activation initiative already on the Delivery Plan is the physical version of this same play — a dedicated fast lane for exactly this tier's traffic pattern.",
          ]}
          referrals={[
            "Every GC in this tier runs a roster of subs on each job — ask which tile/flooring installer they're using on their current project and open a trade account for that installer directly; this is how referrals already flow informally in the trades.",
            "Top independent installers compete for the same subcontract bids and know each other — a formal \"refer a fellow installer, both get an account credit\" program turns that existing network into a paid channel.",
            "A quarterly 15-minute call or email to the top 10-15 accounts in this tier — \"who else should we be serving?\" — with a small credit per successful referral, aimed at builders who already sit inside the same regional HBA chapter as their peers.",
          ]}
        />

        <Playbook
          title="B2B Tier 2 &amp; 3 — Core &amp; Growth Accounts"
          stat={`${tier23.length} accounts · ${money(tier23.reduce((s, c) => s + (Number(c.customer.lifetime_sales) || 0), 0))} lifetime`}
          profile="A longer tail of the same trade profile at lower volume — smaller builders, tile subcontractors,
            and independent installers who order less often. Order recency (last_sale_date) is already on file per
            customer, so lapsed vs. active accounts in this tier are identifiable today."
          findMore={[
            "Lower-touch versions of the Tier 1 channels: email/SMS win-back campaigns to accounts with no order in 90+ days, and inside-sales outbound calling rather than field reps.",
            "Bundled trade pricing or a small-order-fee waiver at a volume threshold gives a concrete reason for a Tier 3 account to consolidate more of their spend here.",
          ]}
          referrals={[
            "Flag Tier 3 accounts with rising order frequency (a \"graduating\" account) and proactively offer Tier 2 volume pricing — accelerating organic growth is cheaper than acquiring a new account from scratch.",
          ]}
        />

        <Playbook
          title="Non-Business — Homeowners &amp; One-Off Buyers"
          stat={`${indiv.length} customers · ${money(indiv.reduce((s, c) => s + (Number(c.customer.lifetime_sales) || 0), 0))} lifetime`}
          profile="Small dollar, low order count, no company-name signal — most likely homeowners or DIY renovators
            buying for a single project rather than a trade account."
          findMore={[
            "Showroom experience and post-purchase review requests (Google/Yelp) — homeowners research suppliers by reviews far more than trade accounts do.",
            "Local community channels (neighborhood Facebook groups, HOA newsletters, Nextdoor) reach this buyer directly in a way trade-association channels don't.",
          ]}
          referrals={[
            "\"Love your new tile? Refer a friend\" — a simple postcard or follow-up email after project completion. Homeowners refer neighbors and friends at a much higher rate than they respond to paid ads.",
            "Repeat individual buyers (2+ purchases, likely small landlords or serial renovators) are a natural mini-loyalty segment — a modest discount on their next project costs little against their already-demonstrated repeat behavior.",
          ]}
        />
      </div>
    </section>
  );
}

function Playbook({
  title, stat, profile, findMore, referrals,
}: { title: string; stat: string; profile: string; findMore: string[]; referrals: string[] }) {
  return (
    <div className="border border-border-custom rounded-lg p-4">
      <div className="flex items-baseline justify-between flex-wrap gap-1 mb-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-[10px] font-mono text-text-secondary">{stat}</span>
      </div>
      <p className="text-xs text-text-secondary mb-3">{profile}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-[10px] font-semibold text-foreground uppercase tracking-wide mb-1">
            Find more like them
          </h4>
          <ul className="space-y-1.5">
            {findMore.map((item, i) => (
              <li key={i} className="text-xs text-text-secondary flex gap-1.5">
                <span className="text-accent-blue shrink-0">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-semibold text-foreground uppercase tracking-wide mb-1">
            Win with our customers
          </h4>
          <ul className="space-y-1.5">
            {referrals.map((item, i) => (
              <li key={i} className="text-xs text-text-secondary flex gap-1.5">
                <span className="text-accent-green shrink-0">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
