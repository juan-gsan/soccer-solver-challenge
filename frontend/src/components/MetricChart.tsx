import type { JSX } from "react";
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
import type { SeasonEvolution, Trend } from "../types/evolution";
import { metricLabel, TREND_COLORS } from "../constants/metrics";
import TrendBadge from "./TrendBadge";

interface Props {
  metric: string;
  seasons: SeasonEvolution[];
}

export interface ChartRow {
  season: string;
  player: number;
  positionAverage: number | null;
  percentile: number | null;
  trend: Trend | null;
}

interface PlayerDotProps {
  cx?: number;
  cy?: number;
  payload?: ChartRow;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartRow }>;
  label?: string;
}

export function buildChartData(
  metric: string,
  seasons: SeasonEvolution[],
): ChartRow[] {
  return seasons.map((season): ChartRow => {
    const point = season.metrics.find((m) => m.metric === metric);
    return {
      season: season.season,
      player: point?.player_value ?? 0,
      positionAverage: point?.position_average ?? null,
      percentile: point?.percentile ?? null,
      trend: point?.trend ?? null,
    };
  });
}

function PlayerDot({ cx, cy, payload }: PlayerDotProps): JSX.Element | null {
  if (cx === undefined || cy === undefined || !payload) return null;
  const color = payload.trend ? TREND_COLORS[payload.trend] : "#22c55e";
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={color}
      stroke="#0f172a"
      strokeWidth={1}
    />
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: ChartTooltipProps): JSX.Element | null {
  const firstEntry = payload?.[0];
  if (!active || !firstEntry) return null;
  const row = firstEntry.payload;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__season">{label}</p>
      <p>Player: {row.player}</p>
      <p>
        Average:{" "}
        {row.positionAverage !== null ? row.positionAverage.toFixed(1) : "—"}
      </p>
      {row.percentile !== null && <p>Percentile: {row.percentile}</p>}
    </div>
  );
}

function MetricChart({ metric, seasons }: Props): JSX.Element {
  const data = buildChartData(metric, seasons);
  const lastPoint: ChartRow | undefined = data[data.length - 1];

  return (
    <div className="metric-chart">
      <div className="metric-chart__header">
        <h3>{metricLabel(metric)}</h3>
        {lastPoint?.trend && <TrendBadge trend={lastPoint.trend} />}
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="season" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip content={<ChartTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="player"
            name="Player"
            stroke="#22c55e"
            strokeWidth={2}
            dot={<PlayerDot />}
          />
          <Line
            type="monotone"
            dataKey="positionAverage"
            name="Average"
            stroke="#64748b"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MetricChart;
