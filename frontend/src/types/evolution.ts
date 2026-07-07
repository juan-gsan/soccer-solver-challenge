export type Trend = "improved" | "declined" | "stable";

export interface MetricPoint {
  metric: string;
  player_value: number;
  position_average: number | null;
  percentile: number | null;
  trend: Trend | null;
}

export interface SeasonEvolution {
  season: string;
  metrics: MetricPoint[];
}

export interface PlayerEvolutionResponse {
  player_id: number;
  name: string;
  position: string;
  sub_position: string;
  available_metrics: string[];
  seasons: SeasonEvolution[];
}
