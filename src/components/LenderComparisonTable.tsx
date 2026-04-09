import { scfLenders, arLenders } from "@/lib/data";

export function LenderComparisonTable() {
  return (
    <div className="space-y-8">
      {/* Section A: SCF */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Section A — SCF Vendor Early Payment</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border-custom">
                <th className="text-left py-2 px-2 text-text-secondary font-medium">Lender</th>
                <th className="text-left py-2 px-2 text-text-secondary font-medium">Type</th>
                <th className="text-left py-2 px-2 text-text-secondary font-medium">Facility Fit</th>
                <th className="text-left py-2 px-2 text-text-secondary font-medium">Rate</th>
                <th className="text-left py-2 px-2 text-text-secondary font-medium">Approval</th>
                <th className="text-left py-2 px-2 text-text-secondary font-medium">Meets Target?</th>
              </tr>
            </thead>
            <tbody>
              {scfLenders.map((l) => (
                <tr key={l.name} className="border-b border-border-custom/50">
                  <td className="py-2 px-2 font-medium">
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline">
                      {l.name}
                    </a>
                  </td>
                  <td className="py-2 px-2 text-text-secondary">{l.type}</td>
                  <td className="py-2 px-2 text-text-secondary">{l.facilityFit}</td>
                  <td className="py-2 px-2 text-text-secondary">{l.rate}</td>
                  <td className="py-2 px-2 text-text-secondary">{l.approval}</td>
                  <td className="py-2 px-2 text-foreground">{l.meetsTarget}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section B: A/R */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Section B — A/R Factoring Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border-custom">
                <th className="text-left py-2 px-2 text-text-secondary font-medium">Lender</th>
                <th className="text-left py-2 px-2 text-text-secondary font-medium">Type</th>
                <th className="text-left py-2 px-2 text-text-secondary font-medium">Rate</th>
                <th className="text-left py-2 px-2 text-text-secondary font-medium">Approval</th>
                <th className="text-left py-2 px-2 text-text-secondary font-medium">Meets 3.0% Target?</th>
              </tr>
            </thead>
            <tbody>
              {arLenders.map((l) => (
                <tr key={l.name} className="border-b border-border-custom/50">
                  <td className="py-2 px-2 font-medium">
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline">
                      {l.name}
                    </a>
                  </td>
                  <td className="py-2 px-2 text-text-secondary">{l.type}</td>
                  <td className="py-2 px-2 text-text-secondary">{l.rate}</td>
                  <td className="py-2 px-2 text-text-secondary">{l.approval}</td>
                  <td className="py-2 px-2 text-foreground">{l.meetsTarget}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-accent-blue/5 border border-accent-blue/15 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <span className="text-accent-amber text-lg">&#9733;</span>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Recommended</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Run parallel RFP to{" "}
              <a href="https://www.ecapital.com" target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline">eCapital</a>
              {" + "}
              <a href="https://www.rivierafinance.com" target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline">Riviera Finance</a>
              {" "}for a combined SCF+A/R facility. Both can likely hit
              the 3.0–3.5% target. Separately, pursue{" "}
              <a href="https://www.liveoakbank.com" target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline">Live Oak Bank</a>
              {" "}SBA 7(a) LOC for term debt. Layer in
              AmEx/Chase Ink business cards immediately for zero-cost vendor float while facilities are being set up.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
