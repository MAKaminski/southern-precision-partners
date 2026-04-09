// CRM contacts grouped by which deal initiative they support
export interface CRMContact {
  name: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  url?: string;
  notes?: string;
  priority: number;
  status: "ready" | "in-progress" | "contacted" | "follow-up" | "closed";
}

export interface InitiativeGroup {
  initiative: string;
  phase: number;
  description: string;
  ebitdaImpact: string;
  color: string;
  contacts: CRMContact[];
}

export const initiativeGroups: InitiativeGroup[] = [
  {
    initiative: "Supply Chain Finance (SCF)",
    phase: 1,
    description: "2% early-pay vendor discount via LP liquidity — +$56.8K EBITDA",
    ebitdaImpact: "+$56,800",
    color: "#2563EB",
    contacts: [
      { name: "Business Development", company: "eCapital", title: "New Client Inquiry", email: "info@ecapital.com", phone: "(305) 779-9095", url: "https://www.ecapital.com", notes: "Top priority — reverse factoring specialist. Request SE regional team.", priority: 1, status: "ready" },
      { name: "Atlanta Branch Manager", company: "Riviera Finance", title: "Branch Manager", email: "atlanta@rivierafinance.com", phone: "(404) 745-9800", url: "https://www.rivierafinance.com", notes: "Closest branch. $200K–$2M facility range.", priority: 2, status: "ready" },
      { name: "Account Executive", company: "Triumph Business Capital", title: "New Business", email: "info@triumphbusinesscapital.com", phone: "(866) 854-2404", url: "https://www.triumphbusinesscapital.com", notes: "Request construction/building materials specialist.", priority: 3, status: "ready" },
      { name: "Sales Team", company: "C2FO", title: "Enterprise Sales", email: "info@c2fo.com", phone: "(816) 651-3225", url: "https://www.c2fo.com", notes: "Only if large corporate buyers (HD, Lowes) exist.", priority: 4, status: "ready" },
    ],
  },
  {
    initiative: "A/R Factoring",
    phase: 1,
    description: "Eliminate bad debt risk, free working capital — Risk mitigation",
    ebitdaImpact: "Risk Mitigation",
    color: "#2563EB",
    contacts: [
      { name: "A/R Factoring Division", company: "eCapital", title: "Non-Recourse Specialist", email: "ar@ecapital.com", phone: "(305) 779-9095", url: "https://www.ecapital.com", notes: "Combined SCF+A/R facility preferred. 2.5–4.0% / 30d.", priority: 1, status: "ready" },
      { name: "Non-Recourse Team", company: "Riviera Finance", title: "A/R Factoring Manager", email: "factoring@rivierafinance.com", phone: "(800) 872-7484", url: "https://www.rivierafinance.com", notes: "1–3% / 30d. Strong for combined facility.", priority: 2, status: "ready" },
      { name: "Small Business Team", company: "Bluevine", title: "Account Specialist", email: "support@bluevine.com", phone: "(888) 216-9619", url: "https://www.bluevine.com", notes: "Backup only — APR may be too high. Fast online approval.", priority: 5, status: "ready" },
    ],
  },
  {
    initiative: "COGS Reduction / Bulk Purchasing",
    phase: 1,
    description: "1.5% rebate via vendor renegotiation & bulk-buy warehousing — +$45.2K EBITDA",
    ebitdaImpact: "+$45,200",
    color: "#2563EB",
    contacts: [
      { name: "Commercial Sales", company: "Daltile (Mohawk)", title: "Regional Account Manager", email: "commercial@daltile.com", phone: "(800) 933-8453", url: "https://www.daltile.com", notes: "Largest US tile manufacturer. Negotiate volume rebate program.", priority: 1, status: "ready" },
      { name: "Dealer Program", company: "MSI Surfaces", title: "Southeast Territory Manager", email: "dealers@msisurfaces.com", phone: "(800) 532-2842", url: "https://www.msisurfaces.com", notes: "Major natural stone supplier. Bulk pricing on countertop slabs.", priority: 1, status: "ready" },
      { name: "Pro Desk / Commercial", company: "Floor & Decor", title: "Commercial Account Manager", email: "pro@flooranddecor.com", phone: "(404) 300-2945", url: "https://www.flooranddecor.com", notes: "Potential wholesale sourcing partner for commodity tile.", priority: 2, status: "ready" },
      { name: "Distribution Sales", company: "Emser Tile", title: "SE Distribution Manager", email: "sales@emser.com", phone: "(323) 650-2000", url: "https://www.emser.com", notes: "Premium tile lines. Negotiate exclusive distribution rights.", priority: 2, status: "ready" },
      { name: "Dealer Services", company: "Crossville Tile", title: "Dealer Program Manager", email: "dealers@crossvilleinc.com", phone: "(931) 484-2110", url: "https://www.crossvilleinc.com", notes: "Tennessee-based — close logistics. Porcelain specialist.", priority: 3, status: "ready" },
    ],
  },
  {
    initiative: "Real Estate Acquisition",
    phase: 1,
    description: "Acquire property ($1M), eliminate $1,666/mo lease — +$20K EBITDA",
    ebitdaImpact: "+$20,000",
    color: "#2563EB",
    contacts: [
      { name: "SBA Lending Division", company: "Live Oak Bank", title: "SBA Loan Officer", email: "sba@liveoakbank.com", phone: "(910) 790-5867", url: "https://www.liveoakbank.com", notes: "SBA 7(a) for acquisition + real estate. Strong track record.", priority: 1, status: "ready" },
      { name: "Commercial Real Estate", company: "NAI Earle Furman", title: "Industrial Broker", email: "info@naief.com", phone: "(864) 232-9040", url: "https://www.naief.com", notes: "SE industrial real estate specialist. Property valuation + comps.", priority: 2, status: "ready" },
      { name: "Commercial Lending", company: "South State Bank", title: "Commercial Lender", email: "commercial@southstatebank.com", phone: "(800) 277-2175", url: "https://www.southstatebank.com", notes: "Regional bank — competitive CRE rates for owner-occupied.", priority: 2, status: "ready" },
    ],
  },
  {
    initiative: "Marketing Launch (Geo-fenced SEM)",
    phase: 1,
    description: "Geo-fenced digital marketing campaign — +$150K revenue, +$25K EBITDA",
    ebitdaImpact: "+$25,000",
    color: "#2563EB",
    contacts: [
      { name: "Account Strategist", company: "Google Ads (Direct)", title: "SMB Account Strategist", email: "N/A — use ads.google.com", phone: "(866) 246-6453", notes: "Set up geo-fenced campaigns for GA tile keywords. Budget: $3K/mo.", priority: 1, status: "ready" },
      { name: "Digital Marketing", company: "Scorpion (Agency)", title: "Home Services Vertical", email: "info@scorpion.co", phone: "(866) 344-1238", url: "https://www.scorpion.co", notes: "Specialized in home services marketing. SEM + SEO + GMB optimization.", priority: 2, status: "ready" },
      { name: "Social Media Ads", company: "Meta Business (Facebook/Instagram)", title: "SMB Advertiser", email: "N/A — use business.facebook.com", phone: "(650) 543-4800", notes: "Visual ads for tile showroom. Target homeowners + designers in radius.", priority: 3, status: "ready" },
    ],
  },
  {
    initiative: "Commercial Sales / Project Financing",
    phase: 2,
    description: "90-day float for builders via SCF — +$450K revenue, +$90K EBITDA",
    ebitdaImpact: "+$90,000",
    color: "#059669",
    contacts: [
      { name: "Sales Team", company: "Resolve Pay", title: "Account Executive", email: "sales@resolvepay.com", phone: "(415) 234-5678", url: "https://www.resolvepay.com", notes: "B2B BNPL — extend net terms to builder customers automatically.", priority: 1, status: "ready" },
      { name: "Purchasing Director", company: "Mungo Homes", title: "VP Procurement", email: "purchasing@mungohomes.com", phone: "(803) 749-5580", notes: "Volume builder — key commercial sales target in Columbia.", priority: 1, status: "ready" },
      { name: "VP Purchasing", company: "Great Southern Homes", title: "Supply Chain Manager", email: "vendors@greatsouthernhomes.com", phone: "(803) 520-1111", notes: "Volume builder — Lexington/Columbia SC.", priority: 1, status: "ready" },
      { name: "Procurement", company: "DR Horton — SC Division", title: "Area Purchasing Manager", email: "purchasing@drhorton.com", phone: "(817) 390-8200", url: "https://www.drhorton.com", notes: "Largest US homebuilder. Massive volume potential.", priority: 1, status: "ready" },
    ],
  },
  {
    initiative: "Digital / 3D Visualizer",
    phase: 2,
    description: "E-commerce + 3D design tool — +$200K revenue, +$40K EBITDA",
    ebitdaImpact: "+$40,000",
    color: "#059669",
    contacts: [
      { name: "Sales Team", company: "Roomvo", title: "Flooring Visualizer Sales", email: "sales@roomvo.com", phone: "(604) 600-0051", url: "https://www.roomvo.com", notes: "Leading tile/flooring visualizer. Embed on website. ~$500/mo.", priority: 1, status: "ready" },
      { name: "Partner Program", company: "TileCloud", title: "US Sales", email: "partners@tilecloud.com", phone: "(888) 845-3256", url: "https://www.tilecloud.com", notes: "Tile-specific e-commerce platform with 3D visualization.", priority: 2, status: "ready" },
      { name: "Web Development", company: "BigCommerce", title: "B2B E-Commerce", email: "sales@bigcommerce.com", phone: "(888) 699-8911", url: "https://www.bigcommerce.com", notes: "B2B e-commerce platform for dealer/contractor ordering portal.", priority: 3, status: "ready" },
    ],
  },
  {
    initiative: "Geographic Expansion (Location 3)",
    phase: 3,
    description: "New satellite location — +$400K revenue, +$60K EBITDA",
    ebitdaImpact: "+$60,000",
    color: "#D97706",
    contacts: [
      { name: "Industrial Leasing", company: "CBRE — Columbia SC", title: "Industrial Broker", email: "columbia@cbre.com", phone: "(803) 254-8000", url: "https://www.cbre.com", notes: "Scout 3,000-5,000 SF warehouse/showroom space in Columbia metro.", priority: 1, status: "ready" },
      { name: "Commercial Leasing", company: "Colliers — SC", title: "Industrial Specialist", email: "sc@colliers.com", phone: "(843) 723-1202", url: "https://www.colliers.com", notes: "Alternative to CBRE for SC market intel.", priority: 2, status: "ready" },
      { name: "Business Licensing", company: "City of Columbia — Business License", title: "Licensing Office", email: "businesslicense@columbiasc.gov", phone: "(803) 545-3400", notes: "Business license requirements for new location.", priority: 3, status: "ready" },
    ],
  },
  {
    initiative: "Delivery Profit Center",
    phase: 3,
    description: "Tiered delivery fees, leased truck — +$80K revenue, +$35K EBITDA",
    ebitdaImpact: "+$35,000",
    color: "#D97706",
    contacts: [
      { name: "Commercial Leasing", company: "Penske Truck Leasing", title: "Fleet Advisor", email: "leasing@penske.com", phone: "(800) 526-0798", url: "https://www.pensketruckleasing.com", notes: "16-26ft box truck lease. ~$1,200-$1,800/mo. GPS tracking included.", priority: 1, status: "ready" },
      { name: "Commercial Fleet", company: "Ryder", title: "Fleet Solutions", email: "fleet@ryder.com", phone: "(800) 793-3765", url: "https://www.ryder.com", notes: "Full-service lease alternative. Maintenance included.", priority: 2, status: "ready" },
      { name: "Last-Mile Delivery", company: "Frayt Technologies", title: "Business Development", email: "sales@frayt.com", phone: "(513) 866-0596", url: "https://www.frayt.com", notes: "On-demand delivery marketplace for overflow capacity.", priority: 3, status: "ready" },
    ],
  },
];
