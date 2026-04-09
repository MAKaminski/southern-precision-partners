export interface OutreachTarget {
  company: string;
  type: string;
  location: string;
  contactTitle: string;
  estimatedRevenue: string;
  channel: string;
  priority: number;
  status: "ready" | "sent" | "responded" | "meeting" | "closed";
  template: string;
}

export interface OutreachCampaign {
  name: string;
  description: string;
  revenueTarget: string;
  targets: OutreachTarget[];
}

export const expandedCampaigns: Record<string, OutreachCampaign> = {
  columbia: {
    name: "Columbia, SC Metro",
    description: "State capital, University of South Carolina, major military base (Fort Jackson). Fastest-growing inland metro in SC. Target commercial builders, volume residential, and institutional.",
    revenueTarget: "$800K–$1.5M/yr",
    targets: [
      { company: "Mungo Homes", type: "Residential Builder (Volume)", location: "Irmo, SC", contactTitle: "VP Procurement", estimatedRevenue: "$300K–$500K/yr", channel: "Email + In-Person", priority: 1, status: "ready", template: "volume-builder" },
      { company: "Great Southern Homes", type: "Residential Builder (Volume)", location: "Lexington, SC", contactTitle: "Supply Chain Manager", estimatedRevenue: "$200K–$400K/yr", channel: "Email + Phone", priority: 1, status: "ready", template: "volume-builder" },
      { company: "DR Horton — Columbia Division", type: "Residential Builder (National)", location: "Columbia, SC", contactTitle: "Area Purchasing Manager", estimatedRevenue: "$250K–$500K/yr", channel: "Email + In-Person", priority: 1, status: "ready", template: "volume-builder" },
      { company: "Lennar — Columbia", type: "Residential Builder (National)", location: "Columbia, SC", contactTitle: "Division Purchasing Director", estimatedRevenue: "$200K–$400K/yr", channel: "Email", priority: 1, status: "ready", template: "volume-builder" },
      { company: "Stanley Martin Homes", type: "Residential Builder", location: "Columbia, SC", contactTitle: "Purchasing Manager", estimatedRevenue: "$100K–$200K/yr", channel: "Email + Phone", priority: 2, status: "ready", template: "volume-builder" },
      { company: "Eastwood Homes", type: "Residential Builder", location: "Columbia, SC", contactTitle: "VP Operations", estimatedRevenue: "$80K–$150K/yr", channel: "Email + Phone", priority: 2, status: "ready", template: "volume-builder" },
      { company: "Essex Homes", type: "Custom Home Builder", location: "Columbia, SC", contactTitle: "Design Director", estimatedRevenue: "$60K–$120K/yr", channel: "Email + In-Person", priority: 2, status: "ready", template: "builder-intro" },
      { company: "Mashburn Construction", type: "Commercial GC", location: "Columbia, SC", contactTitle: "Project Director", estimatedRevenue: "$75K–$150K/yr", channel: "Email + Phone", priority: 1, status: "ready", template: "builder-intro" },
      { company: "M.B. Kahn Construction", type: "Commercial GC", location: "Columbia, SC", contactTitle: "Estimating Manager", estimatedRevenue: "$100K–$200K/yr", channel: "Email + Lunch", priority: 1, status: "ready", template: "builder-intro" },
      { company: "Holder Construction", type: "Commercial GC", location: "Columbia, SC", contactTitle: "Procurement Manager", estimatedRevenue: "$50K–$100K/yr", channel: "Email", priority: 2, status: "ready", template: "builder-intro" },
      { company: "Brantley Construction", type: "Commercial GC", location: "Columbia, SC", contactTitle: "Project Manager", estimatedRevenue: "$40K–$80K/yr", channel: "Email + Phone", priority: 2, status: "ready", template: "builder-intro" },
      { company: "Hodge Floors", type: "Flooring Contractor", location: "Columbia, SC", contactTitle: "Operations Manager", estimatedRevenue: "$40K–$80K/yr", channel: "Email + Phone", priority: 2, status: "ready", template: "contractor-intro" },
      { company: "Carolina Flooring Specialists", type: "Flooring Contractor", location: "West Columbia, SC", contactTitle: "Owner", estimatedRevenue: "$30K–$60K/yr", channel: "Phone + In-Person", priority: 3, status: "ready", template: "contractor-intro" },
      { company: "Columbia Tile & Stone", type: "Showroom / Retail", location: "Columbia, SC", contactTitle: "General Manager", estimatedRevenue: "$50K–$100K/yr", channel: "In-Person", priority: 2, status: "ready", template: "showroom-partner" },
      { company: "Palmetto Tile Distributors", type: "Distributor / Dealer", location: "Columbia, SC", contactTitle: "Owner", estimatedRevenue: "$60K–$100K/yr", channel: "In-Person", priority: 2, status: "ready", template: "showroom-partner" },
      { company: "Fox & Hound Interiors", type: "Interior Designer", location: "Columbia, SC", contactTitle: "Principal Designer", estimatedRevenue: "$15K–$30K/yr", channel: "Email", priority: 3, status: "ready", template: "contractor-intro" },
      { company: "Fort Jackson — USACE", type: "Government / Military", location: "Columbia, SC", contactTitle: "Contracting Officer", estimatedRevenue: "$50K–$100K/project", channel: "Formal RFP", priority: 1, status: "ready", template: "government-rfp" },
      { company: "Richland County School District", type: "Government / Education", location: "Columbia, SC", contactTitle: "Director of Operations", estimatedRevenue: "$30K–$60K/yr", channel: "Formal RFP", priority: 2, status: "ready", template: "government-rfp" },
      { company: "Lexington Medical Center", type: "Healthcare", location: "West Columbia, SC", contactTitle: "Facilities Director", estimatedRevenue: "$40K–$80K/project", channel: "Email + In-Person", priority: 2, status: "ready", template: "institutional-intro" },
      { company: "Prisma Health — Midlands", type: "Healthcare", location: "Columbia, SC", contactTitle: "Capital Projects Manager", estimatedRevenue: "$60K–$120K/project", channel: "Email + In-Person", priority: 1, status: "ready", template: "institutional-intro" },
      { company: "University of South Carolina", type: "Education / Institutional", location: "Columbia, SC", contactTitle: "Facilities Management", estimatedRevenue: "$50K–$100K/yr", channel: "Formal RFP", priority: 2, status: "ready", template: "government-rfp" },
      { company: "Greystar (Multi-Family)", type: "Multi-Family Developer", location: "Columbia, SC", contactTitle: "Regional VP Construction", estimatedRevenue: "$80K–$150K/project", channel: "Email + Phone", priority: 1, status: "ready", template: "builder-intro" },
      { company: "Landmark Construction", type: "Renovation Contractor", location: "Columbia, SC", contactTitle: "Project Estimator", estimatedRevenue: "$25K–$50K/yr", channel: "Phone", priority: 3, status: "ready", template: "contractor-intro" },
      { company: "Revere Design Build", type: "Design-Build Contractor", location: "Columbia, SC", contactTitle: "Design Director", estimatedRevenue: "$30K–$60K/yr", channel: "Email + In-Person", priority: 3, status: "ready", template: "contractor-intro" },
      { company: "The Meritage Group", type: "Residential Builder", location: "Columbia, SC", contactTitle: "Purchasing Agent", estimatedRevenue: "$80K–$150K/yr", channel: "Email + Phone", priority: 2, status: "ready", template: "volume-builder" },
      { company: "NHE Inc", type: "Property Management", location: "Columbia, SC", contactTitle: "Maintenance Director", estimatedRevenue: "$20K–$40K/yr", channel: "Email", priority: 3, status: "ready", template: "institutional-intro" },
      { company: "Hilton Columbia Center", type: "Hospitality", location: "Columbia, SC", contactTitle: "Facilities Manager", estimatedRevenue: "$20K–$40K/project", channel: "Email + Phone", priority: 3, status: "ready", template: "hospitality-reno" },
      { company: "LS3P Associates", type: "Architecture Firm", location: "Columbia, SC", contactTitle: "Senior Architect", estimatedRevenue: "$15K–$30K/yr", channel: "Email", priority: 3, status: "ready", template: "contractor-intro" },
    ],
  },
  florence: {
    name: "Florence, SC / Pee Dee Region",
    description: "Existing satellite location needs reactivation. I-95 corridor hub. Target local builders, healthcare (McLeod), hospitality renovations, and government/institutional.",
    revenueTarget: "$300K–$550K/yr",
    targets: [
      { company: "Thompson Turner Construction", type: "Commercial GC", location: "Florence, SC", contactTitle: "Senior Estimator", estimatedRevenue: "$100K–$200K/yr", channel: "Email + Lunch", priority: 1, status: "ready", template: "builder-intro" },
      { company: "McLeod Health System", type: "Healthcare", location: "Florence, SC", contactTitle: "Director of Facilities", estimatedRevenue: "$75K–$150K/project", channel: "Email + In-Person", priority: 1, status: "ready", template: "institutional-intro" },
      { company: "Florence County Schools (District 1)", type: "Government / Education", location: "Florence, SC", contactTitle: "Maintenance Director", estimatedRevenue: "$20K–$40K/yr", channel: "Formal RFP", priority: 2, status: "ready", template: "government-rfp" },
      { company: "Florence City Housing Authority", type: "Government", location: "Florence, SC", contactTitle: "Procurement Director", estimatedRevenue: "$30K–$60K/yr", channel: "Formal RFP", priority: 2, status: "ready", template: "government-rfp" },
      { company: "Hampton Inn & Suites Florence", type: "Hospitality", location: "Florence, SC", contactTitle: "Property Manager", estimatedRevenue: "$25K–$50K/project", channel: "Email + Phone", priority: 2, status: "ready", template: "hospitality-reno" },
      { company: "Courtyard by Marriott Florence", type: "Hospitality", location: "Florence, SC", contactTitle: "Facilities Manager", estimatedRevenue: "$20K–$40K/project", channel: "Email + Phone", priority: 3, status: "ready", template: "hospitality-reno" },
      { company: "Wilson & Associates Construction", type: "Commercial GC", location: "Florence, SC", contactTitle: "Owner", estimatedRevenue: "$40K–$80K/yr", channel: "Phone + In-Person", priority: 2, status: "ready", template: "builder-intro" },
      { company: "Pee Dee Builders", type: "Residential Builder", location: "Florence, SC", contactTitle: "Owner", estimatedRevenue: "$30K–$60K/yr", channel: "Phone", priority: 2, status: "ready", template: "builder-intro" },
      { company: "Francis Marion University", type: "Education", location: "Florence, SC", contactTitle: "Facilities Management", estimatedRevenue: "$20K–$40K/yr", channel: "Formal RFP", priority: 3, status: "ready", template: "government-rfp" },
      { company: "Floor Craft Florence", type: "Flooring Contractor", location: "Florence, SC", contactTitle: "Owner", estimatedRevenue: "$20K–$40K/yr", channel: "Phone", priority: 3, status: "ready", template: "contractor-intro" },
      { company: "HopeHealth Florence", type: "Healthcare", location: "Florence, SC", contactTitle: "Facilities Coordinator", estimatedRevenue: "$15K–$30K/project", channel: "Email", priority: 3, status: "ready", template: "institutional-intro" },
      { company: "Carolina Bank Florence", type: "Commercial Tenant", location: "Florence, SC", contactTitle: "Branch Operations", estimatedRevenue: "$10K–$20K/project", channel: "Email", priority: 3, status: "ready", template: "institutional-intro" },
    ],
  },
  charleston: {
    name: "Charleston, SC Metro",
    description: "Highest-growth market in SC. Luxury coastal homes, hospitality, and massive residential development. Premium tile ASP opportunity. I-26 corridor from Columbia.",
    revenueTarget: "$600K–$1.2M/yr",
    targets: [
      { company: "Lennar — Charleston", type: "Residential Builder (National)", location: "Charleston, SC", contactTitle: "Division Purchasing Director", estimatedRevenue: "$250K–$500K/yr", channel: "Email + In-Person", priority: 1, status: "ready", template: "volume-builder" },
      { company: "DR Horton — Charleston", type: "Residential Builder (National)", location: "Charleston, SC", contactTitle: "Area Purchasing Manager", estimatedRevenue: "$200K–$400K/yr", channel: "Email", priority: 1, status: "ready", template: "volume-builder" },
      { company: "Pulte Homes — Lowcountry", type: "Residential Builder (National)", location: "Charleston, SC", contactTitle: "Purchasing Director", estimatedRevenue: "$150K–$300K/yr", channel: "Email + Phone", priority: 1, status: "ready", template: "volume-builder" },
      { company: "Toll Brothers — SC", type: "Luxury Residential", location: "Mount Pleasant, SC", contactTitle: "Design Center Manager", estimatedRevenue: "$100K–$200K/yr", channel: "Email + In-Person", priority: 1, status: "ready", template: "volume-builder" },
      { company: "Homes by Dickerson", type: "Custom Builder", location: "Charleston, SC", contactTitle: "Owner/Builder", estimatedRevenue: "$50K–$100K/yr", channel: "Email + In-Person", priority: 2, status: "ready", template: "builder-intro" },
      { company: "Structures Building Company", type: "Custom Builder", location: "Charleston, SC", contactTitle: "Project Manager", estimatedRevenue: "$40K–$80K/yr", channel: "Email + Phone", priority: 2, status: "ready", template: "builder-intro" },
      { company: "Ravenel Associates", type: "Commercial GC", location: "Charleston, SC", contactTitle: "Estimating Director", estimatedRevenue: "$80K–$150K/yr", channel: "Email + Lunch", priority: 1, status: "ready", template: "builder-intro" },
      { company: "Choate Construction", type: "Commercial GC", location: "Charleston, SC", contactTitle: "Procurement Manager", estimatedRevenue: "$60K–$120K/yr", channel: "Email", priority: 2, status: "ready", template: "builder-intro" },
      { company: "Hyer Quality Construction", type: "Renovation Contractor", location: "Charleston, SC", contactTitle: "Owner", estimatedRevenue: "$30K–$60K/yr", channel: "Phone", priority: 2, status: "ready", template: "contractor-intro" },
      { company: "Charleston Tile & Stone", type: "Showroom / Retail", location: "Charleston, SC", contactTitle: "Owner", estimatedRevenue: "$60K–$120K/yr", channel: "In-Person", priority: 1, status: "ready", template: "showroom-partner" },
      { company: "Sea Island Tile", type: "Showroom / Retail", location: "Mount Pleasant, SC", contactTitle: "General Manager", estimatedRevenue: "$40K–$80K/yr", channel: "In-Person", priority: 2, status: "ready", template: "showroom-partner" },
      { company: "Mitchell Hill Interiors", type: "Interior Designer", location: "Charleston, SC", contactTitle: "Principal", estimatedRevenue: "$20K–$40K/yr", channel: "Email", priority: 3, status: "ready", template: "contractor-intro" },
      { company: "MUSC Health", type: "Healthcare", location: "Charleston, SC", contactTitle: "Capital Projects Director", estimatedRevenue: "$80K–$150K/project", channel: "Email + In-Person", priority: 1, status: "ready", template: "institutional-intro" },
      { company: "Charleston County School District", type: "Government / Education", location: "Charleston, SC", contactTitle: "Director of Facilities", estimatedRevenue: "$40K–$80K/yr", channel: "Formal RFP", priority: 2, status: "ready", template: "government-rfp" },
      { company: "Belmond Charleston Place", type: "Hospitality (Luxury)", location: "Charleston, SC", contactTitle: "Director of Engineering", estimatedRevenue: "$40K–$80K/project", channel: "Email + Phone", priority: 2, status: "ready", template: "hospitality-reno" },
      { company: "Hotel Bennett", type: "Hospitality (Luxury)", location: "Charleston, SC", contactTitle: "Facilities Director", estimatedRevenue: "$30K–$60K/project", channel: "Email", priority: 2, status: "ready", template: "hospitality-reno" },
      { company: "WestRock Co (Headquarters)", type: "Corporate / Commercial", location: "Charleston, SC", contactTitle: "Facilities Manager", estimatedRevenue: "$30K–$60K/project", channel: "Email", priority: 3, status: "ready", template: "institutional-intro" },
      { company: "Greystar — Charleston", type: "Multi-Family Developer", location: "Charleston, SC", contactTitle: "Construction Director", estimatedRevenue: "$100K–$200K/project", channel: "Email + In-Person", priority: 1, status: "ready", template: "builder-intro" },
      { company: "Liollio Architecture", type: "Architecture Firm", location: "Charleston, SC", contactTitle: "Materials Specifier", estimatedRevenue: "$15K–$30K/yr", channel: "Email", priority: 3, status: "ready", template: "contractor-intro" },
      { company: "Landmark Enterprises", type: "Commercial Developer", location: "Charleston, SC", contactTitle: "VP Construction", estimatedRevenue: "$60K–$100K/project", channel: "Email + Lunch", priority: 2, status: "ready", template: "builder-intro" },
    ],
  },
  greenville: {
    name: "Greenville / Upstate SC",
    description: "BMW/Michelin industrial corridor. Strong I-85 alignment. Growing luxury residential downtown + commercial development. Major reno cycle in historic buildings.",
    revenueTarget: "$500K–$900K/yr",
    targets: [
      { company: "DR Horton — Greenville", type: "Residential Builder (National)", location: "Greenville, SC", contactTitle: "Area Purchasing Manager", estimatedRevenue: "$200K–$400K/yr", channel: "Email", priority: 1, status: "ready", template: "volume-builder" },
      { company: "Meritage Homes — Greenville", type: "Residential Builder (National)", location: "Greenville, SC", contactTitle: "Division Purchasing", estimatedRevenue: "$150K–$300K/yr", channel: "Email + Phone", priority: 1, status: "ready", template: "volume-builder" },
      { company: "Smith Douglas Homes", type: "Residential Builder", location: "Greenville, SC", contactTitle: "Purchasing Manager", estimatedRevenue: "$80K–$150K/yr", channel: "Email + Phone", priority: 2, status: "ready", template: "volume-builder" },
      { company: "Dillard Jones Builders", type: "Custom Home Builder", location: "Greenville, SC", contactTitle: "Owner/Builder", estimatedRevenue: "$60K–$120K/yr", channel: "Email + In-Person", priority: 2, status: "ready", template: "builder-intro" },
      { company: "Harper General Contractors", type: "Commercial GC", location: "Greenville, SC", contactTitle: "Estimating Director", estimatedRevenue: "$80K–$150K/yr", channel: "Email + Lunch", priority: 1, status: "ready", template: "builder-intro" },
      { company: "Yeargin Potter Shackelford", type: "Commercial GC", location: "Greenville, SC", contactTitle: "Project Manager", estimatedRevenue: "$60K–$120K/yr", channel: "Email", priority: 2, status: "ready", template: "builder-intro" },
      { company: "Sherman Construction", type: "Commercial GC", location: "Greenville, SC", contactTitle: "Procurement", estimatedRevenue: "$40K–$80K/yr", channel: "Email + Phone", priority: 2, status: "ready", template: "builder-intro" },
      { company: "Greenville Tile & Marble", type: "Showroom / Retail", location: "Greenville, SC", contactTitle: "Owner", estimatedRevenue: "$50K–$100K/yr", channel: "In-Person", priority: 1, status: "ready", template: "showroom-partner" },
      { company: "Tile Outlets of Greenville", type: "Showroom / Retail", location: "Greenville, SC", contactTitle: "General Manager", estimatedRevenue: "$40K–$80K/yr", channel: "In-Person", priority: 2, status: "ready", template: "showroom-partner" },
      { company: "Prisma Health — Upstate", type: "Healthcare", location: "Greenville, SC", contactTitle: "Facilities Director", estimatedRevenue: "$80K–$150K/project", channel: "Email + In-Person", priority: 1, status: "ready", template: "institutional-intro" },
      { company: "BMW Manufacturing", type: "Corporate / Industrial", location: "Spartanburg, SC", contactTitle: "Facilities Management", estimatedRevenue: "$40K–$80K/project", channel: "Email", priority: 2, status: "ready", template: "institutional-intro" },
      { company: "Greenville County Schools", type: "Government / Education", location: "Greenville, SC", contactTitle: "Director of Facilities", estimatedRevenue: "$40K–$80K/yr", channel: "Formal RFP", priority: 2, status: "ready", template: "government-rfp" },
      { company: "Clemson University Facilities", type: "Education", location: "Clemson, SC", contactTitle: "Facilities Management", estimatedRevenue: "$50K–$100K/yr", channel: "Formal RFP", priority: 2, status: "ready", template: "government-rfp" },
      { company: "McMillan Pazdan Smith Architecture", type: "Architecture Firm", location: "Greenville, SC", contactTitle: "Materials Specifier", estimatedRevenue: "$15K–$30K/yr", channel: "Email", priority: 3, status: "ready", template: "contractor-intro" },
      { company: "Hughes Development", type: "Commercial Developer", location: "Greenville, SC", contactTitle: "VP Construction", estimatedRevenue: "$50K–$100K/project", channel: "Email + Lunch", priority: 2, status: "ready", template: "builder-intro" },
      { company: "Greenville Hilton", type: "Hospitality", location: "Greenville, SC", contactTitle: "Director of Engineering", estimatedRevenue: "$25K–$50K/project", channel: "Email", priority: 3, status: "ready", template: "hospitality-reno" },
    ],
  },
  myrtleBeach: {
    name: "Myrtle Beach / Grand Strand",
    description: "Fastest-growing metro in SC (12.8% construction growth). Tourism-driven hospitality reno cycle + massive new residential development. High seasonal demand.",
    revenueTarget: "$350K–$700K/yr",
    targets: [
      { company: "DR Horton — Myrtle Beach", type: "Residential Builder (National)", location: "Myrtle Beach, SC", contactTitle: "Area Purchasing Manager", estimatedRevenue: "$150K–$300K/yr", channel: "Email", priority: 1, status: "ready", template: "volume-builder" },
      { company: "Lennar — Grand Strand", type: "Residential Builder (National)", location: "Myrtle Beach, SC", contactTitle: "Purchasing Director", estimatedRevenue: "$100K–$200K/yr", channel: "Email + Phone", priority: 1, status: "ready", template: "volume-builder" },
      { company: "Beazer Homes — Myrtle Beach", type: "Residential Builder", location: "Myrtle Beach, SC", contactTitle: "Purchasing Agent", estimatedRevenue: "$80K–$150K/yr", channel: "Email", priority: 2, status: "ready", template: "volume-builder" },
      { company: "G&G Custom Homes", type: "Custom Builder", location: "Pawleys Island, SC", contactTitle: "Owner/Builder", estimatedRevenue: "$40K–$80K/yr", channel: "Phone + In-Person", priority: 2, status: "ready", template: "builder-intro" },
      { company: "Burroughs & Chapin", type: "Commercial Developer", location: "Myrtle Beach, SC", contactTitle: "VP Construction", estimatedRevenue: "$80K–$150K/project", channel: "Email + In-Person", priority: 1, status: "ready", template: "builder-intro" },
      { company: "Dargan Construction", type: "Commercial GC", location: "Myrtle Beach, SC", contactTitle: "Estimating Manager", estimatedRevenue: "$50K–$100K/yr", channel: "Email + Phone", priority: 2, status: "ready", template: "builder-intro" },
      { company: "Myrtle Beach Marriott Resort", type: "Hospitality (Large)", location: "Myrtle Beach, SC", contactTitle: "Director of Engineering", estimatedRevenue: "$40K–$80K/project", channel: "Email + Phone", priority: 1, status: "ready", template: "hospitality-reno" },
      { company: "Hilton Myrtle Beach Resort", type: "Hospitality (Large)", location: "Myrtle Beach, SC", contactTitle: "Facilities Manager", estimatedRevenue: "$30K–$60K/project", channel: "Email", priority: 2, status: "ready", template: "hospitality-reno" },
      { company: "Ocean Lakes Family Campground", type: "Hospitality / RV Resort", location: "Myrtle Beach, SC", contactTitle: "Facilities Director", estimatedRevenue: "$25K–$50K/project", channel: "Email + Phone", priority: 2, status: "ready", template: "hospitality-reno" },
      { company: "Coastal Carolina University", type: "Education", location: "Conway, SC", contactTitle: "Facilities Management", estimatedRevenue: "$30K–$60K/yr", channel: "Formal RFP", priority: 2, status: "ready", template: "government-rfp" },
      { company: "Horry County Schools", type: "Government / Education", location: "Conway, SC", contactTitle: "Director of Maintenance", estimatedRevenue: "$40K–$80K/yr", channel: "Formal RFP", priority: 2, status: "ready", template: "government-rfp" },
      { company: "Grand Strand Tile & Stone", type: "Showroom / Retail", location: "Myrtle Beach, SC", contactTitle: "Owner", estimatedRevenue: "$40K–$80K/yr", channel: "In-Person", priority: 2, status: "ready", template: "showroom-partner" },
      { company: "Tidewater Preservation", type: "Renovation Contractor", location: "Myrtle Beach, SC", contactTitle: "Project Manager", estimatedRevenue: "$20K–$40K/yr", channel: "Phone", priority: 3, status: "ready", template: "contractor-intro" },
      { company: "Conway Medical Center", type: "Healthcare", location: "Conway, SC", contactTitle: "Facilities Director", estimatedRevenue: "$30K–$60K/project", channel: "Email + In-Person", priority: 2, status: "ready", template: "institutional-intro" },
    ],
  },
};
