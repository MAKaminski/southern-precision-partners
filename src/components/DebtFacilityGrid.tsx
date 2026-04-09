import { debtFacilities } from "@/lib/data";

export function DebtFacilityGrid() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3">Debt Facility Detail</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-custom">
              <th className="text-left py-2 px-2 text-text-secondary font-medium">Facility</th>
              <th className="text-left py-2 px-2 text-text-secondary font-medium">Lender</th>
              <th className="text-left py-2 px-2 text-text-secondary font-medium">Amount</th>
              <th className="text-left py-2 px-2 text-text-secondary font-medium">Rate</th>
              <th className="text-left py-2 px-2 text-text-secondary font-medium">Structure</th>
              <th className="text-left py-2 px-2 text-text-secondary font-medium">Maturity</th>
              <th className="text-left py-2 px-2 text-text-secondary font-medium">Recourse</th>
            </tr>
          </thead>
          <tbody>
            {debtFacilities.map((f) => (
              <tr key={f.name} className="border-b border-border-custom/50">
                <td className="py-2 px-2 text-foreground font-medium">{f.name}</td>
                <td className="py-2 px-2 text-text-secondary">{f.lender}</td>
                <td className="py-2 px-2 text-text-secondary">{f.amount}</td>
                <td className="py-2 px-2 text-text-secondary">{f.rate}</td>
                <td className="py-2 px-2 text-text-secondary">{f.structure}</td>
                <td className="py-2 px-2 text-text-secondary">{f.maturity}</td>
                <td className="py-2 px-2 text-text-secondary">{f.recourse}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
