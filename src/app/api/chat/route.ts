import { NextRequest, NextResponse } from "next/server";

// Knowledge base — answers without external API
const KB: Record<string, string> = {
  // Deal basics
  "deal|mosaic|overview|about the deal|what is": "Project Mosaic is a leveraged buyout of Tile Center Group, an established tile and stone distributor in Georgia. Enterprise value: $2.49M at 4.5x entry multiple. Total raise: $3.1M. LTM revenue: $4.95M with $554K pro-forma EBITDA (11.2% margin). Managing Partner: Keith Piper, Southeast Precision Partners.",
  "tile center|target|business": "Tile Center Group is an established tile and stone distributor in Georgia with ~$5M annual revenue and 11% EBITDA margins. Profitable, asset-light, 3 years of audited history. Products include porcelain, ceramic, natural stone, and mosaics for residential and commercial customers.",
  "revenue|sales|top line": "LTM Revenue is $4.95M. Pro-forma Year 1 revenue is $4.8M with 5% organic growth projected: Yr1 $4.8M, Yr2 $5.04M, Yr3 $5.29M, Yr4 $5.56M, Yr5 $5.83M. Post-initiative revenue targets reach $6.3M by Year 5.",

  // EBITDA & financials
  "ebitda|margin|profitability|earnings": "Baseline EBITDA (from CIM): $334K. After normalization (rent reclamation +$90K, Florence optimization +$28K): $452K. After operational alpha (SCF float +$56.8K, COGS reduction +$45.2K): $554K Year 1 pro-forma. EBITDA scales from 11.5% to 15.0% over 5 years organically. With initiatives, target Year 5 EBITDA: $958K.",
  "normalization|bridge|baseline": "EBITDA Bridge: Baseline $334K (CIM) → +$90K rent reclamation → +$28K Florence optimization → $452K normalized Day 1 → +$56.8K SCF float → +$45.2K COGS reduction → $554K Year 1 pro-forma.",

  // Capital structure
  "capital|structure|cap stack|sources|raise": "Total raise: $3.1M. LP Debt (Pete — Senior): $2.4M (77.4%) at 10% IO or 7% + 5% kicker. GP Equity (Keith Piper): $400K (12.9%) — 79% profit share. JP Equity: $100K (3.2%) — 5% equity + 11% carry = 16% effective. Seller Note: $200K (6.5%) at 6%, 5-yr amort.",
  "waterfall|split|distribution|profit": "Distribution waterfall: First return invested capital ($400K GP + $100K JP = $500K). Then split remaining profits: GP 79% / JP 16% / LP kicker 5%. This ensures GP MOIC is 16-22% higher than JP across all scenarios.",

  // Returns
  "returns|moic|irr|exit": "Base case ($9M exit EV): GP MOIC 13.05x (66% IRR), JP MOIC 10.76x (60% IRR), LP 1.46x. Bear (4.5x): GP 3.77x, JP 3.24x. Bull (7.5x): GP 17.49x, JP 14.36x. Stretch (9x): GP 21.94x, JP 17.96x. GP is always 16-22% higher than JP.",
  "gp|keith|managing partner": "Keith Piper is the Managing Partner. GP invests $400K for 79% profit share. Base case MOIC: 13.05x, IRR: 66%. Exit proceeds (base): $5.22M.",
  "jp|junior partner": "JP invests $100K for 5% equity + 11% carried interest (16% effective profit share). Base case MOIC: 10.76x, IRR: 60%. Exit proceeds (base): $1.08M.",
  "lp|pete|senior|debt": "LP (Pete) provides $2.4M senior debt. Scenario 1: 10% IO, 5-yr bullet. Scenario 2: 7% IO + 5% equity kicker. Base case total proceeds: $3.51M, MOIC: 1.46x.",

  // Initiatives
  "initiative|value creation|growth|phase": "3 phases, 12 initiatives. Phase 1 (Yr1): +$129.1K EBITDA — SCF integration, COGS audit, A/R factoring, marketing, real estate. Phase 2 (Yr2-3): +$165K EBITDA — commercial sales, digital/3D, inventory, commissions. Phase 3 (Yr4-5): +$110K EBITDA — delivery center, geo expansion, lean ops.",
  "scf|supply chain|float": "SCF Integration: 2% vendor discount via LP liquidity = +$56.8K EBITDA. 90-day float mechanics: Day 1 order → Day 10 intermediary pays vendor → Day 15 delivery + invoice → Day 75 builder pays → Day 90 repay intermediary. 1% transaction cost, ~$700K working capital freed.",

  // Risks
  "risk|concern|downside": "3 key risks: 1) Execution risk — multiple simultaneous initiatives require focused management bandwidth. 2) Builder market cyclicality — commercial sales growth assumes sustained Georgia construction demand. 3) Debt service — $2.6M total debt at entry; model requires >$300K/yr FCF to service.",

  // Scenarios
  "scenario|bear|bull|stretch": "Scenario 1 (10% IO): LP gets $240K/yr interest. DSCR ranges 1.93x to 3.05x. Scenario 2 (7% + 5% kicker): LP gets $168K/yr interest + 5% equity upside. Higher FCF for equity holders. Both scenarios assume $9M exit EV in Year 5.",

  // Company
  "sep|southeast precision|company|who are you": "Southeast Precision Partners (SEP) is a Charlotte, NC-based lower-middle-market PE firm. We acquire and operate founder-led businesses in the I-85/I-77 industrial corridors. Focus: Industrial Services, Specialty Manufacturing, Logistics. Target: $2M-$7M EV, 10% FCF yield, 3.0x+ MOIC in 5 years.",
  "contact|email|phone|address": "Keith Piper | Managing Partner | deals@sep-partners.com. HQ: 5960 Fairview Road, Suite 400, Charlotte, NC 28210. Phone: (704) 920-8593. General: info@sep-partners.com.",
};

function findAnswer(query: string): string {
  const q = query.toLowerCase();
  let bestMatch = "";
  let bestScore = 0;

  for (const [keywords, answer] of Object.entries(KB)) {
    const terms = keywords.split("|");
    let score = 0;
    for (const term of terms) {
      if (q.includes(term)) score += term.length;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = answer;
    }
  }

  if (bestScore > 0) return bestMatch;
  return "I can answer questions about the Project Mosaic deal — the business, capital structure, returns, initiatives, risks, scenarios, lenders, and SEP Partners. Could you be more specific about what you'd like to know?";
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || "";

    // Try Anthropic API if key is available
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      try {
        const { default: Anthropic } = await import("@anthropic-ai/sdk");
        const client = new Anthropic({ apiKey });
        const response = await client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          system: `You are the deal assistant for Southeast Precision Partners. Answer questions about Project Mosaic (Tile Center Group LBO). Be concise and professional. Key data: EV $2.49M, Revenue $4.95M, EBITDA $554K, Total raise $3.1M, GP Keith Piper $400K/79%, JP $100K/16%, LP $2.4M debt. Base exit $9M. GP MOIC 13.05x, JP 10.76x.`,
          messages: messages.map((m: { role: string; content: string }) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        });
        const textBlock = response.content.find((b) => b.type === "text");
        if (textBlock) return NextResponse.json({ reply: textBlock.text });
      } catch {
        // Fall through to local KB
      }
    }

    // Local knowledge base fallback (no API key needed)
    const reply = findAnswer(lastMessage);
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ reply: "Something went wrong. Please try again." });
  }
}
