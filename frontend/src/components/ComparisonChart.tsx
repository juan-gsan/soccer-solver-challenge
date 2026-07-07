import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SeasonEvolution } from "../types/evolution";
import { metricLabel } from "../constants/metrics";

interface Props {
  metric: string;
  nameA: string;
  nameB: string;
  seasonsA: SeasonEvolution[];
  seasonsB: SeasonEvolution[];
}

interface ComparisonRow {
  season: string;
  playerA: number | null;
  playerB: number | null;
}

function buildComparisonData(
  metric: string,
  seasonsA: SeasonEvolution[],
  seasonsB: SeasonEvolution[],
): ComparisonRow[] {
  const allSeasons = new Set<string>([
    ...seasonsA.map((s) => s.season),
    ...seasonsB.map((s) => s.season),
  ]);
  const sortedSeasons = Array.from(allSeasons).sort();

  return sortedSeasons.map((season) => {
    const pointA = seasonsA
      .find((s) => s.season === season)
      ?.metrics.find((m) => m.metric === metric);
    const pointB = seasonsB
      .find((s) => s.season === season)
      ?.metrics.find((m) => m.metric === metric);
    return {
      season,
      playerA: pointA?.percentile ?? null,
      playerB: pointB?.percentile ?? null,
    };
  });
}

function consistencyScore(values: Array<number | null>): number | null {
  const nums = values.filter((v): v is number => v !== null);
  if (nums.length < 2) return null;
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  const variance =
    nums.reduce((sum, v) => sum + (v - mean) ** 2, 0) / nums.length;
  return Math.round(Math.sqrt(variance) * 10) / 10;
}

function ComparisonTooltip({
  active,
  payload,
  label,
  nameA,
  nameB,
}: {
  active?: boolean;
  payload?: Array<{ payload: ComparisonRow }>;
  label?: string;
  nameA: string;
  nameB: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__season">{label}</p>
      <p>
        {nameA}:{" "}
        {row.playerA !== null ? `percent ${row.playerA}` : "No data available"}
      </p>
      <p>
        {nameB}:{" "}
        {row.playerB !== null ? `percent ${row.playerB}` : "No data available"}
      </p>
    </div>
  );
}

function ComparisonChart({ metric, nameA, nameB, seasonsA, seasonsB }: Props) {
  const data = buildComparisonData(metric, seasonsA, seasonsB);
  const consistencyA = consistencyScore(data.map((d) => d.playerA));
  const consistencyB = consistencyScore(data.map((d) => d.playerB));

  return (
    <div className="metric-chart">
      <div className="metric-chart__header">
        <h3>{metricLabel(metric)}</h3>
        <span className="comparison-scale-note">
          scale: percent vs. same position
        </span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="season" stroke="#94a3b8" fontSize={12} />
          <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
          <Tooltip
            content={<ComparisonTooltip nameA={nameA} nameB={nameB} />}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="playerA"
            name={nameA}
            stroke="#22c55e"
            strokeWidth={2}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="playerB"
            name={nameB}
            stroke="#60a5fa"
            strokeWidth={2}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
      {(consistencyA !== null || consistencyB !== null) && (
        <p className="consistency-note">
          Consistency (percent deviation, less = more constant): {nameA}{" "}
          {consistencyA ?? "—"} · {nameB} {consistencyB ?? "—"}
        </p>
      )}
    </div>
  );
}

export default ComparisonChart;
