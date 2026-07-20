import { NextRequest, NextResponse } from "next/server";
import { currentClearance } from "@/lib/guard";
import { hasClearance } from "@/lib/access";

// ─────────────────────────────────────────────────────────────────────────────
// Guardrailed deal assistant.
//
// The chatbot is embedded on every page, including fully public ones, so its
// responses are the single biggest data-leak surface on the platform. Answers
// are therefore split by classification:
//
//   • PUBLIC_KB       — general, non-sensitive firm/thesis info. Anyone.
//   • CONFIDENTIAL_KB — deal financials (EV, EBITDA, cap stack, LP/GP names &
//                       amounts, returns, waterfall). Authenticated investors
//                       and partners only.
//
// Anonymous / under-cleared users never receive confidential figures — not from
// the local knowledge base and not from the LLM (its system prompt is scrubbed
// of all numbers and told to refuse). This is the "public vs private" split
// applied at the data level.
// ─────────────────────────────────────────────────────────────────────────────

// Public-safe answers — no financials, no partner names, no deal economics.
const PUBLIC_KB: Record<string, string> = {
  "sep|southeast precision|company|who are you|about": "Southeast Precision Partners (SEP) is a Charlotte, NC-based lower-middle-market private equity firm. We acquire and operate founder-led businesses in the I-85/I-77 industrial corridors, focusing on Industrial Services, Specialty Manufacturing, and Logistics.",
  "thesis|strategy|focus|invest": "SEP partners with founder-led lower-middle-market companies in the Southeast, providing capital and operational stewardship to preserve legacy while scaling the business. Target sectors: industrial services, specialty manufacturing, and logistics/distribution.",
  "deal|mosaic|current|overview|what is": "SEP has an active acquisition in the building-materials distribution space. Detailed deal economics, financials, and returns are confidential and available to authorized investors after signing in. You can request access from the Project Mosaic page or by contacting the team.",
  "submit|sell|my business|selling": "If you're a business owner interested in a conversation, you can use the 'Submit a Deal' form on our site. We review every submission and typically respond within 48 hours.",
  "contact|email|phone|reach|get in touch": "You can reach Southeast Precision Partners at info@sep-partners.com or (704) 920-8593. HQ: 5960 Fairview Road, Suite 400, Charlotte, NC 28210.",
  "access|login|sign in|investor|confidential": "Confidential deal materials — financials, capital structure, and return projections — require an authorized investor account. Use 'Investor Login' at the top of the page, or request data-room access from the Project Mosaic page.",
};

// Confidential answers — deal financials. Authorized viewers only.
const CONFIDENTIAL_KB: Record<string, string> = {
  "deal|mosaic|overview|about the deal|what is": "Project Mosaic is a leveraged buyout of Tile Center Group, an established tile and stone distributor in Georgia. Enterprise value: $2.49M at 4.5x entry multiple. Total raise: $2.9M. LTM revenue: $4.95M with $554K pro-forma EBITDA (11.2% margin). Managing Partner: Keith Piper, Southeast Precision Partners.",
  "tile center|target|business": "Tile Center Group is an established tile and stone distributor in Georgia with ~$5M annual revenue and 11% EBITDA margins. Profitable, asset-light, 3 years of audited history. Products include porcelain, ceramic, natural stone, and mosaics for residential and commercial customers.",
  "revenue|sales|top line": "LTM Revenue is $4.95M (entry basis ~$4.68M per the 5-year plan). Projected: Yr1 $5.5M, Yr2 $7.43M, Yr3 $10.4M, Yr4 $14.03M, Yr5 $17.19M — a 17.5%/35%/40%/35%/22.5% YoY growth path.",
  "ebitda|margin|profitability|earnings": "Entry EBITDA: ~$380K (8.1% margin). Projected: Yr1 $495K (9.0%), Yr2 $891K (12.0%), Yr3 $1.46M (14.0%), Yr4 $2.32M (16.5%), Yr5 $3.09M (18.0%).",
  "normalization|bridge|baseline": "EBITDA Bridge: Baseline $334K (CIM) → +$90K rent reclamation → +$28K Florence optimization → $452K normalized Day 1 → +$56.8K SCF float → +$45.2K COGS reduction → $554K Year 1 pro-forma. Note: a per-year bridge tying organic growth vs. initiative impact to the real 5-year plan is in progress — this normalization walk predates that plan.",
  "capital|structure|cap stack|sources|raise": "Total raise: $2.9M. SBA Term Loan (Live Oak Bank): $2.24M (77.2%) at 10%, 15-yr term. GP Equity (Keith Piper): $280K (9.7%) — 10% of purchase price. JP Equity: $100K (3.4%) — 5% equity + 11% carry = 16% effective. Seller Note: $280K (9.7%) — 10% seller financing.",
  "waterfall|split|distribution|profit": "Each year, distribute the lesser of ⅓ of Net Income or Free Cash Flow. JP receives that pool × their vested equity % for the year (4% → 8% → 12% → 16% → 20% over the 5-year hold); GP receives the remainder. JP has no upfront cash investment — equity vests as the company creates value.",
  "returns|moic|irr|exit": "5-year cumulative operating distributions: GP ~$1.64M, JP ~$298K (excludes exit proceeds — an exit-valuation model for the new capital structure is still being built, so MOIC/IRR aren't final yet).",
  "gp|keith|managing partner": "Keith Piper is the Managing Partner, investing $280K (10% of the $2.8M purchase price). He receives the distributable pool remainder each year after JP's vested share. 5-year cumulative distributions: ~$1.64M (excludes exit proceeds).",
  "jp|junior partner": "JP has no cash investment — equity vests 0% → 20% over the 5-year hold as the company creates value (JP equity value grows from $0 to ~$4.5M by Year 5). Each year JP receives the distributable pool × their vested %. 5-year cumulative distributions: ~$298K (excludes exit proceeds).",
  "sba|loan|senior|debt|lender": "The SBA Term Loan (Live Oak Bank) provides $2.24M in senior acquisition debt at 10%, 15-yr term, plus a separate $250K SBA working-capital line of credit. Bank debt — principal and interest, not an equity/MOIC position.",
  "initiative|value creation|growth|phase": "3 phases, 12 initiatives. Phase 1 (Yr1): +$129.1K EBITDA — SCF integration, COGS audit, A/R factoring, marketing, real estate. Phase 2 (Yr2-3): +$165K EBITDA — commercial sales, digital/3D, inventory, commissions. Phase 3 (Yr4-5): +$110K EBITDA — delivery center, geo expansion, lean ops. Per-initiative schedules (steps, financial impact, reasoning) are being built out on the Delivery Plan.",
  "scf|supply chain|float": "SCF Integration: 2% vendor discount via LP liquidity = +$56.8K EBITDA. 90-day float mechanics: Day 1 order → Day 10 intermediary pays vendor → Day 15 delivery + invoice → Day 75 builder pays → Day 90 repay intermediary. 1% transaction cost, ~$700K working capital freed.",
  "risk|concern|downside": "3 key risks: 1) Execution risk — multiple simultaneous initiatives require focused management bandwidth. 2) Builder market cyclicality — commercial sales growth assumes sustained Georgia construction demand. 3) Debt service — $2.52M total debt at entry (SBA term loan + seller note); model requires >$300K/yr FCF to service.",
  "contact|email|phone|address": "Keith Piper | Managing Partner | deals@sep-partners.com. HQ: 5960 Fairview Road, Suite 400, Charlotte, NC 28210. Phone: (704) 920-8593. General: info@sep-partners.com.",
};

const GATED_REPLY =
  "That information is part of our confidential deal materials and is only available to authorized investors. Please sign in with an investor account (top-right 'Investor Login'), or request data-room access from the Project Mosaic page. I'm happy to answer general questions about Southeast Precision Partners in the meantime.";

function findAnswer(query: string, kb: Record<string, string>): { answer: string; score: number } {
  const q = query.toLowerCase();
  let bestMatch = "";
  let bestScore = 0;

  for (const [keywords, answer] of Object.entries(kb)) {
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
  return { answer: bestMatch, score: bestScore };
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || "";

    // Determine viewer clearance. Investors & partners may receive confidential
    // deal figures; anonymous / under-cleared users get public answers only.
    const role = await currentClearance();
    const authorized = hasClearance(role, "confidential");

    // ── Public visitors ────────────────────────────────────────────────────
    if (!authorized) {
      const pub = findAnswer(lastMessage, PUBLIC_KB);
      const conf = findAnswer(lastMessage, CONFIDENTIAL_KB);

      // If the question is best answered by confidential material (and no
      // strong public match), refuse rather than leak.
      if (conf.score > 0 && conf.score >= pub.score) {
        return NextResponse.json({ reply: GATED_REPLY, classification: "public", gated: true });
      }

      if (pub.score > 0) {
        return NextResponse.json({ reply: pub.answer, classification: "public" });
      }

      return NextResponse.json({
        reply:
          "I can answer general questions about Southeast Precision Partners — who we are, our investment thesis, how to submit a business, and how to request investor access. Confidential deal financials require an authorized investor sign-in.",
        classification: "public",
      });
    }

    // ── Authorized investors / partners ──────────────────────────────────────
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      try {
        const { default: Anthropic } = await import("@anthropic-ai/sdk");
        const client = new Anthropic({ apiKey });
        const response = await client.messages.create({
          model: process.env.ANTHROPIC_CHAT_MODEL || "claude-sonnet-5",
          max_tokens: 1024,
          system: `You are the deal assistant for Southeast Precision Partners, speaking to an AUTHORIZED, signed-in investor or partner. You may share confidential Project Mosaic (Tile Center Group LBO) details. Be concise and professional. Key data: EV $2.49M, Revenue $4.95M, EBITDA $554K, Total raise $2.9M, GP Keith Piper $280K (10% of purchase price), JP $0 cash (0%→20% equity vesting over 5 yrs), SBA Term Loan (Live Oak Bank) $2.24M at 10%/15-yr + $250K working-capital LOC, Seller Note $280K at 10%. 5-year plan: revenue $5.5M→$17.19M, EBITDA $495K→$3.09M. Exit-valuation model not yet finalized — don't state exit MOIC/IRR figures.`,
          messages: messages.map((m: { role: string; content: string }) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        });
        const textBlock = response.content.find((b) => b.type === "text");
        if (textBlock) return NextResponse.json({ reply: textBlock.text, classification: "confidential" });
      } catch {
        // Fall through to local KB
      }
    }

    // Local confidential knowledge base fallback (no API key needed).
    const conf = findAnswer(lastMessage, CONFIDENTIAL_KB);
    if (conf.score > 0) {
      return NextResponse.json({ reply: conf.answer, classification: "confidential" });
    }
    return NextResponse.json({
      reply:
        "I can answer questions about the Project Mosaic deal — the business, capital structure, returns, initiatives, risks, scenarios, lenders, and SEP Partners. Could you be more specific about what you'd like to know?",
      classification: "confidential",
    });
  } catch {
    return NextResponse.json({ reply: "Something went wrong. Please try again." });
  }
}
