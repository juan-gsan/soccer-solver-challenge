import { TREND_ARROWS, TREND_COLORS, TREND_LABELS } from "../constants/metrics";

interface Props {
  trend: string;
}

function TrendBadge({ trend }: Props) {
  const color = TREND_COLORS[trend] ?? "#94a3b8";
  const label = TREND_LABELS[trend] ?? trend;
  const arrow = TREND_ARROWS[trend] ?? "";

  return (
    <span className="trend-badge" style={{ color, borderColor: color }}>
      {arrow} {label}
    </span>
  );
}

export default TrendBadge;
