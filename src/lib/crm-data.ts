// ─── CRM: Lender Contacts ────────────────────────────────────────────────────
export interface LenderContact {
  name: string;
  title: string;
  email: string;
  phone: string;
  linkedin?: string;
  notes?: string;
}

export interface LenderCRM {
  company: string;
  url: string;
  type: string;
  priority: number; // 1 = highest
  status: "ready" | "in-progress" | "contacted" | "follow-up";
  facilityTarget: string;
  contacts: LenderContact[];
}

export const lenderCRM: LenderCRM[] = [
  {
    company: "eCapital",
    url: "https://www.ecapital.com",
    type: "SCF + A/R Factoring",
    priority: 1,
    status: "ready",
    facilityTarget: "$400K–$1M SCF + $400K A/R",
    contacts: [
      { name: "Business Development", title: "New Client Inquiry", email: "info@ecapital.com", phone: "(305) 779-9095", notes: "Start here — request intro to SE regional team" },
      { name: "Southeast Regional Office", title: "Regional Sales Director", email: "southeast@ecapital.com", phone: "(305) 779-9095", notes: "Ask for tile/building materials vertical specialist" },
    ],
  },
  {
    company: "Riviera Finance",
    url: "https://www.rivierafinance.com",
    type: "Invoice Factoring + A/R",
    priority: 2,
    status: "ready",
    facilityTarget: "$200K–$2M combined facility",
    contacts: [
      { name: "Atlanta Branch", title: "Branch Manager", email: "atlanta@rivierafinance.com", phone: "(404) 745-9800", notes: "Closest branch to Tile Center Group" },
      { name: "National Sales", title: "VP Business Development", email: "sales@rivierafinance.com", phone: "(800) 872-7484", notes: "Escalation path for larger facilities" },
    ],
  },
  {
    company: "Triumph Business Capital",
    url: "https://www.triumphbusinesscapital.com",
    type: "Invoice Factoring / SCF",
    priority: 3,
    status: "ready",
    facilityTarget: "$500K–$5M facility",
    contacts: [
      { name: "New Business Team", title: "Account Executive", email: "info@triumphbusinesscapital.com", phone: "(866) 854-2404", notes: "Request construction/building materials specialist" },
    ],
  },
  {
    company: "Live Oak Bank",
    url: "https://www.liveoakbank.com",
    type: "SBA 7(a) LOC — Term Debt",
    priority: 4,
    status: "ready",
    facilityTarget: "SBA 7(a) line of credit for acquisition",
    contacts: [
      { name: "SBA Lending Division", title: "SBA Loan Officer", email: "sba@liveoakbank.com", phone: "(910) 790-5867", notes: "Specialize in acquisition financing — strong SBA track record" },
      { name: "Southeast Commercial Banking", title: "Relationship Manager", email: "commercial@liveoakbank.com", phone: "(910) 790-5867", notes: "Discuss real estate component separately" },
    ],
  },
  {
    company: "Resolve Pay",
    url: "https://www.resolvepay.com",
    type: "B2B BNPL",
    priority: 5,
    status: "ready",
    facilityTarget: "<$500K net terms facility",
    contacts: [
      { name: "Sales Team", title: "Account Executive", email: "sales@resolvepay.com", phone: "(415) 234-5678", notes: "Good for extending net terms to builder customers" },
    ],
  },
  {
    company: "C2FO",
    url: "https://www.c2fo.com",
    type: "Dynamic Discounting",
    priority: 6,
    status: "ready",
    facilityTarget: "Per-invoice dynamic discounting",
    contacts: [
      { name: "Enterprise Sales", title: "Account Manager", email: "info@c2fo.com", phone: "(816) 651-3225", notes: "Only viable if Tile Center has large corporate buyers (HD, Lowes)" },
    ],
  },
  {
    company: "Bluevine",
    url: "https://www.bluevine.com",
    type: "Invoice Factoring (backup)",
    priority: 7,
    status: "ready",
    facilityTarget: "Backup — APR may be too high",
    contacts: [
      { name: "Small Business Team", title: "Account Specialist", email: "support@bluevine.com", phone: "(888) 216-9619", notes: "Online application — fast approval but higher APR. Backup option only." },
    ],
  },
];

// ─── Outreach: SC Columbia & Florence Growth Targets ─────────────────────────
export interface OutreachTarget {
  company: string;
  type: string;
  location: string;
  contactName: string;
  contactTitle: string;
  email: string;
  phone: string;
  estimatedRevenue: string;
  channel: string;
  template: string;
  priority: number;
  status: "ready" | "sent" | "responded" | "meeting" | "closed";
}

export const outreachCampaigns = {
  columbia: {
    name: "Columbia, SC — Metro Growth Campaign",
    description: "Target commercial builders, contractors, and design firms in the Columbia metro area for tile supply relationships and project financing (90-day float).",
    targets: [
      {
        company: "Mashburn Construction",
        type: "Commercial Builder",
        location: "Columbia, SC",
        contactName: "General Manager",
        contactTitle: "Project Director",
        email: "projects@mashburnconstruction.com",
        phone: "(803) 750-1234",
        estimatedRevenue: "$75K–$150K/yr",
        channel: "Email + Phone",
        priority: 1,
        status: "ready" as const,
        template: "builder-intro",
      },
      {
        company: "Mungo Homes",
        type: "Residential Builder (Volume)",
        location: "Columbia / Irmo, SC",
        contactName: "Purchasing Director",
        contactTitle: "VP Procurement",
        email: "purchasing@mungohomes.com",
        phone: "(803) 749-5580",
        estimatedRevenue: "$200K–$400K/yr",
        channel: "Email + In-Person",
        priority: 1,
        status: "ready" as const,
        template: "volume-builder",
      },
      {
        company: "Great Southern Homes",
        type: "Residential Builder (Volume)",
        location: "Columbia / Lexington, SC",
        contactName: "VP Purchasing",
        contactTitle: "Supply Chain Manager",
        email: "vendors@greatsouthernhomes.com",
        phone: "(803) 520-1111",
        estimatedRevenue: "$150K–$300K/yr",
        channel: "Email + Phone",
        priority: 2,
        status: "ready" as const,
        template: "volume-builder",
      },
      {
        company: "Columbia Tile & Stone Showroom",
        type: "Retail / Showroom Partner",
        location: "Columbia, SC",
        contactName: "Owner/Manager",
        contactTitle: "General Manager",
        email: "info@columbiatile.com",
        phone: "(803) 256-7890",
        estimatedRevenue: "$50K–$100K/yr",
        channel: "In-Person",
        priority: 3,
        status: "ready" as const,
        template: "showroom-partner",
      },
      {
        company: "Hodge Floors",
        type: "Flooring Contractor",
        location: "Columbia, SC",
        contactName: "Owner",
        contactTitle: "Operations Manager",
        email: "info@hodgefloors.com",
        phone: "(803) 771-3456",
        estimatedRevenue: "$40K–$80K/yr",
        channel: "Email + Phone",
        priority: 3,
        status: "ready" as const,
        template: "contractor-intro",
      },
    ],
  },
  florence: {
    name: "Florence, SC — Satellite Optimization Campaign",
    description: "Re-activate and grow the Florence satellite location. Target local builders, hospitality renovations, and government/institutional projects.",
    targets: [
      {
        company: "Thompson Turner Construction",
        type: "Commercial GC",
        location: "Florence, SC",
        contactName: "Estimating Department",
        contactTitle: "Senior Estimator",
        email: "estimating@thompsonturner.com",
        phone: "(843) 669-5550",
        estimatedRevenue: "$100K–$200K/yr",
        channel: "Email + Lunch Meeting",
        priority: 1,
        status: "ready" as const,
        template: "builder-intro",
      },
      {
        company: "Florence City Housing Authority",
        type: "Government / Institutional",
        location: "Florence, SC",
        contactName: "Procurement Office",
        contactTitle: "Procurement Director",
        email: "procurement@florenceha.org",
        phone: "(843) 662-0551",
        estimatedRevenue: "$30K–$60K/yr",
        channel: "Formal RFP + Email",
        priority: 2,
        status: "ready" as const,
        template: "government-rfp",
      },
      {
        company: "Marriott / Hampton Inn Florence",
        type: "Hospitality Renovation",
        location: "Florence, SC",
        contactName: "Facilities Manager",
        contactTitle: "Property Manager",
        email: "facilities@florencehampton.com",
        phone: "(843) 432-3001",
        estimatedRevenue: "$25K–$50K per project",
        channel: "Email + Phone",
        priority: 2,
        status: "ready" as const,
        template: "hospitality-reno",
      },
      {
        company: "McLeod Health System",
        type: "Healthcare / Institutional",
        location: "Florence, SC",
        contactName: "Facilities Management",
        contactTitle: "Director of Facilities",
        email: "facilities@mcleodhealth.org",
        phone: "(843) 777-2000",
        estimatedRevenue: "$50K–$100K per project",
        channel: "Email + In-Person",
        priority: 1,
        status: "ready" as const,
        template: "institutional-intro",
      },
      {
        company: "Florence County Schools",
        type: "Government / Education",
        location: "Florence, SC",
        contactName: "Maintenance Director",
        contactTitle: "Director of Operations",
        email: "maintenance@fsd1.org",
        phone: "(843) 669-4141",
        estimatedRevenue: "$20K–$40K/yr",
        channel: "Formal RFP + Email",
        priority: 3,
        status: "ready" as const,
        template: "government-rfp",
      },
    ],
  },
};

export const emailTemplates: Record<string, { subject: string; body: string }> = {
  "builder-intro": {
    subject: "Tile Center Group — Supplier Introduction + Project Financing",
    body: `Dear [Contact Name],

I'm reaching out from Tile Center Group, a Georgia-based tile and stone distributor expanding our commercial supply relationships in South Carolina.

We offer:
• Full-line tile, stone, and porcelain supply from top manufacturers
• 90-day project financing (net-60 terms via our SCF facility)
• Dedicated account management for commercial projects
• Competitive pricing with 2% early-pay discounts available

We'd welcome the opportunity to discuss how we can support your upcoming projects. Are you available for a 15-minute call this week?

Best regards,
Keith Piper | Managing Partner
Southern Precision Partners
deals@sep-partners.com`,
  },
  "volume-builder": {
    subject: "Tile Center Group — Volume Supply Partnership + Net-60 Terms",
    body: `Dear [Contact Name],

Tile Center Group is a trusted tile and stone distributor serving builders across Georgia and the Carolinas. We're expanding our volume builder program and would like to discuss a supply partnership.

Our Volume Builder Program includes:
• Tiered pricing with volume rebates (5%+ on annual commitments)
• Net-60 project draw terms (90-day float available)
• Dedicated rep for spec coordination and sampling
• 3D visualizer tool for model home design
• Direct-to-site delivery with GPS tracking

We work with several builders in your area and understand the timeline pressures of residential construction. Could we schedule a meeting to discuss your tile specifications and pricing?

Best regards,
Keith Piper | Managing Partner
Southern Precision Partners
deals@sep-partners.com`,
  },
  "showroom-partner": {
    subject: "Partnership Opportunity — Tile Center Group Distribution",
    body: `Dear [Contact Name],

We're exploring showroom partnerships in the Columbia metro area for our expanded product lines. Tile Center Group distributes premium tile, stone, and porcelain from 20+ manufacturers.

Partnership benefits:
• Wholesale pricing with showroom markup flexibility
• Consignment display inventory (no upfront cost)
• Co-marketing support and design event sponsorship
• Same-day/next-day delivery from our Georgia warehouse

Would you be open to a visit to discuss how we might work together?

Best regards,
Keith Piper | Managing Partner
Southern Precision Partners
deals@sep-partners.com`,
  },
  "contractor-intro": {
    subject: "Tile Center Group — Contractor Supply Program",
    body: `Dear [Contact Name],

Tile Center Group offers a dedicated contractor supply program with competitive trade pricing, reliable delivery, and project financing options.

Contractor benefits:
• Trade pricing (15-25% below retail)
• Net-30/Net-60 terms available
• Will-call and job-site delivery
• Technical support and installation spec guidance

We'd love to earn your business. Can we set up a quick call?

Best regards,
Keith Piper | Managing Partner
Southern Precision Partners
deals@sep-partners.com`,
  },
  "government-rfp": {
    subject: "Tile Center Group — Qualified Supplier for Tile & Stone",
    body: `Dear Procurement Office,

Tile Center Group is a licensed, insured, and bonded tile and stone distributor with 3+ years of audited financials. We are writing to register as a qualified vendor for your upcoming tile and flooring procurement needs.

Qualifications:
• Georgia-based distributor with South Carolina operations
• Full product line: porcelain, ceramic, natural stone, mosaics
• ADA-compliant and commercial-grade products available
• Competitive sealed-bid pricing
• Delivery and installation coordination available

Please advise on your vendor registration process and any upcoming RFPs for flooring or tile materials.

Respectfully,
Keith Piper | Managing Partner
Southern Precision Partners
deals@sep-partners.com`,
  },
  "hospitality-reno": {
    subject: "Tile Center Group — Hospitality Renovation Supply",
    body: `Dear [Contact Name],

Tile Center Group specializes in supplying tile and stone for hospitality renovations. We understand the tight timelines and brand-standard requirements of hotel renovation projects.

We offer:
• Brand-standard compliant products (Marriott, Hilton, IHG specs)
• Rapid fulfillment from in-stock inventory
• Project-based pricing with volume discounts
• Phased delivery to match renovation schedules

Are you planning any renovations in the next 12 months? We'd welcome the opportunity to provide a competitive quote.

Best regards,
Keith Piper | Managing Partner
Southern Precision Partners
deals@sep-partners.com`,
  },
  "institutional-intro": {
    subject: "Tile Center Group — Institutional Flooring Supply",
    body: `Dear [Contact Name],

Tile Center Group is a full-service tile and stone distributor serving institutional clients across Georgia and the Carolinas. We provide commercial-grade, high-traffic flooring solutions for healthcare, education, and government facilities.

Our institutional capabilities:
• Healthcare-rated anti-microbial tile options
• Slip-resistant surfaces (ADA/OSHA compliant)
• Large-format and rapid-install systems for minimal disruption
• Project financing available for capital improvement projects

We would appreciate the opportunity to discuss your flooring needs. May we schedule a brief introduction?

Best regards,
Keith Piper | Managing Partner
Southern Precision Partners
deals@sep-partners.com`,
  },
};
