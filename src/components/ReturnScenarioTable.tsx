// Bear/Base/Bull/Stretch exit-multiple scenarios were removed 2026-07-20 —
// they were built on the old $9M-exit / $400K-GP-equity capital structure.
// Re-deriving exit-multiple sensitivity for JP's vesting equity needs an
// exit-valuation model, which doesn't exist yet. Tracked in ROADMAP.md.
export function ReturnScenarioTable() {
  return (
    <div className="text-sm text-text-secondary bg-surface border border-dashed border-border-custom rounded-lg p-4">
      Exit-scenario sensitivity (Bear/Base/Bull/Stretch) is being rebuilt against the new SBA-based capital
      structure and JP equity-vesting schedule. Pending an exit-valuation model.
    </div>
  );
}
