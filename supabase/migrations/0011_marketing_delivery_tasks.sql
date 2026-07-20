-- ============================================================
-- Southern Precision Partners — Marketing & Growth delivery tasks
-- Applied to the dedicated Supabase project `southern-precision-partners`
-- (ref yscxrvuwwfpjuciuawcv). Committed here for reproducibility.
--
-- Seeds the Delivery Plan (delivery_tasks) with the concrete initiatives
-- derived from the Marketing Playbooks on the Marketing & Growth tab
-- (src/components/spp/MarketingPlaybooks.tsx), which are themselves grounded
-- in the real customer-segment composition. Every row is owned by the
-- "Marketing & Growth" function (not M or K) and tagged system = 'marketing'
-- so the Delivery Plan's Tab column links straight through to /marketing.
--
-- Dates are sequenced against capacity: list-building, memberships and SEO
-- land in Q4 2026 as the integration foundation completes (deal closes
-- Q3 2026); the referral, win-back, pricing and loyalty PROGRAMS follow in
-- 2027 once customer accounts have been migrated into the CRM. All fields
-- are editable in-app — these are a starting sequence to refine with the
-- marketing & growth lead, not fixed commitments.
--
-- Idempotent: each row is inserted only if a task with the same title does
-- not already exist, so re-running is a no-op and in-app edits are preserved.
-- ============================================================

insert into public.delivery_tasks
  (delivery_year, system, title, next_step, owner, start_date, end_date, status, sort_order)
select v.delivery_year, v.system, v.title, v.next_step, v.owner,
       v.start_date::date, v.end_date::date, 'not_started', v.sort_order
from (values
  -- ---- Year 1 (2026): foundation — build the reachable universe ----
  (1, 'marketing',
   'Marketing: SC LLR contractor-license outreach list (Columbia + Florence)',
   'Pull active GC / residential-builder licenses from the public SC LLR lookup as a cold-outreach list',
   'Marketing & Growth', '2026-10-01', '2026-10-31', 900),
  (1, 'marketing',
   'Marketing: County building-permit prospecting list (Richland / Lexington / Florence)',
   'Stand up a weekly permit pull with the GC-of-record for timed, in-market outreach',
   'Marketing & Growth', '2026-10-15', '2026-11-15', 901),
  (1, 'marketing',
   'Marketing: HBA & trade-association vendor memberships (Midlands, Pee Dee, NTCA/CTDA/AGC)',
   'Join the Midlands & Pee Dee HBA chapters and register as a vendor member for visibility',
   'Marketing & Growth', '2026-10-01', '2026-12-15', 902),
  (1, 'marketing',
   'Marketing: Local SEO/SEM for Columbia & Florence supplier searches',
   'Optimize for "tile distributor Columbia SC" and "flooring supplier Florence SC"',
   'Marketing & Growth', '2026-11-01', '2026-12-31', 903),
  -- ---- Year 2 (2027): activation — turn the base into paid channels ----
  (2, 'marketing',
   'Marketing: Installer referral program (refer-a-fellow-installer account credit)',
   'Design the account-credit structure with sales; launch to Tier 1 installers',
   'Marketing & Growth', '2027-01-05', '2027-02-28', 904),
  (2, 'marketing',
   'Marketing: Quarterly top-account referral calls (top 10-15 Tier 1)',
   'Build the call list and script the "who else should we be serving?" outreach',
   'Marketing & Growth', '2027-01-15', '2027-12-31', 905),
  (2, 'marketing',
   'Marketing: Win-back email/SMS for 90+ day lapsed Tier 2/3 accounts',
   'Segment lapsed accounts by last_sale_date and draft the win-back sequence',
   'Marketing & Growth', '2027-01-05', '2027-02-15', 906),
  (2, 'marketing',
   'Marketing: Bundled trade pricing & small-order-fee waiver at a volume threshold',
   'Model the threshold with finance and pilot with Tier 3 accounts',
   'Marketing & Growth', '2027-02-01', '2027-03-31', 907),
  (2, 'marketing',
   'Marketing: Tier 3 "graduating account" auto-upgrade to Tier 2 pricing',
   'Flag rising-order-frequency Tier 3 accounts and define the upgrade trigger',
   'Marketing & Growth', '2027-03-01', '2027-04-30', 908),
  (2, 'marketing',
   'Marketing: Showroom review-generation program (Google / Yelp)',
   'Add a post-purchase review request to the homeowner checkout flow',
   'Marketing & Growth', '2027-01-15', '2027-02-28', 909),
  (2, 'marketing',
   'Marketing: Local community channel presence (Nextdoor / Facebook groups / HOA)',
   'Identify Columbia & Florence neighborhood groups and set a content calendar',
   'Marketing & Growth', '2027-02-01', '2027-03-31', 910),
  (2, 'marketing',
   'Marketing: Homeowner "refer a friend" post-project program',
   'Design the post-completion postcard/email with a referral incentive',
   'Marketing & Growth', '2027-02-15', '2027-03-31', 911),
  (2, 'marketing',
   'Marketing: Repeat-buyer mini-loyalty discount (2+ purchase individuals)',
   'Define the loyalty segment from order history and set a next-project discount',
   'Marketing & Growth', '2027-03-01', '2027-04-15', 912)
) as v(delivery_year, system, title, next_step, owner, start_date, end_date, sort_order)
where not exists (
  select 1 from public.delivery_tasks d where d.title = v.title
);
