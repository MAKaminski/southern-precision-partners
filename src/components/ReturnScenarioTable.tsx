import { scenarios } from "@/lib/data";

export function ReturnScenarioTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-custom">
            <th className="text-left py-2 text-text-secondary font-medium">Scenario</th>
            <th className="text-right py-2 text-text-secondary font-medium">Exit Multiple</th>
            <th className="text-right py-2 text-text-secondary font-medium">JP MOIC</th>
            <th className="text-right py-2 text-text-secondary font-medium">JP IRR</th>
          </tr>
        </thead>
        <tbody>
          {scenarios.map((s) => (
            <tr
              key={s.name}
              className={`border-b border-border-custom/50 ${s.name === "Base" ? "bg-accent-blue/5" : ""}`}
            >
              <td className="py-2 font-medium text-foreground">{s.name}</td>
              <td className="py-2 text-right text-text-secondary">{s.exitMultiple}</td>
              <td className="py-2 text-right text-accent-green font-semibold">{s.jpMoic}</td>
              <td className="py-2 text-right text-accent-green font-semibold">{s.jpIrr}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
