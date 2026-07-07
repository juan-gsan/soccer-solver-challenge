export const METRIC_LABELS: Record<string, string> = {
  goals: "Goals",
  assists: "Assists",
  minutes_played: "Minutes",
  matches_played: "Games",
  goal_involvements: "Goals + Assists",
};

export function metricLabel(metric: string): string {
  return METRIC_LABELS[metric] ?? metric;
}

export const TREND_LABELS: Record<string, string> = {
  improved: "Improved",
  declined: "Declined",
  stable: "Stable",
};

export const TREND_COLORS: Record<string, string> = {
  improved: "#22c55e",
  declined: "#f87171",
  stable: "#94a3b8",
};

export const TREND_ARROWS: Record<string, string> = {
  improved: "▲",
  declined: "▼",
  stable: "▬",
};
