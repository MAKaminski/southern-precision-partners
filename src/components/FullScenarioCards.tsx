// Bear/Base/Bull/Stretch full-investor-return cards were removed 2026-07-20 —
// they were built on the old $9M-exit / $400K-GP-equity / $100K-JP-cash
// structure, none of which match the confirmed SBA-based structure and JP
// equity-vesting schedule. Re-deriving these needs an exit-valuation model,
// which doesn't exist yet. Tracked in ROADMAP.md.
export function FullScenarioCards() {
  return (
    <div className="text-sm text-text-secondary bg-surface border border-dashed border-border-custom rounded-lg p-4">
      Full investor returns by exit scenario are being rebuilt against the new SBA-based capital structure
      and JP equity-vesting schedule. Pending an exit-valuation model.
    </div>
  );
}
