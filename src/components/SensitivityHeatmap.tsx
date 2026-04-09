"use client";

interface SensitivityHeatmapProps {
  title: string;
  rowLabels: string[];
  colLabels: string[];
  data: number[][];
  baseRow?: number;
  baseCol?: number;
  suffix?: string;
}

export function SensitivityHeatmap({
  title,
  rowLabels,
  colLabels,
  data,
  baseRow,
  baseCol,
  suffix = "×",
}: SensitivityHeatmapProps) {
  // Find min/max for color scaling
  const flat = data.flat();
  const min = Math.min(...flat);
  const max = Math.max(...flat);

  function getColor(val: number): string {
    const ratio = (val - min) / (max - min);
    // Dark red → dark green
    const r = Math.round(220 * (1 - ratio));
    const g = Math.round(220 * ratio);
    return `rgba(${r}, ${g}, 60, 0.25)`;
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="py-2 px-2 text-left text-text-secondary font-medium">Exit Multiple</th>
              {colLabels.map((cl) => (
                <th key={cl} className="py-2 px-2 text-center text-text-secondary font-medium">{cl}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, ri) => (
              <tr key={ri}>
                <td className="py-1.5 px-2 text-text-secondary font-medium">{rowLabels[ri]}</td>
                {row.map((val, ci) => {
                  const isBase = ri === baseRow && ci === baseCol;
                  return (
                    <td
                      key={ci}
                      className={`py-1.5 px-2 text-center font-mono ${
                        isBase
                          ? "text-accent-blue font-bold ring-2 ring-accent-blue/50 rounded"
                          : "text-foreground"
                      }`}
                      style={{ backgroundColor: getColor(val) }}
                    >
                      {val.toFixed(1)}{suffix}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
