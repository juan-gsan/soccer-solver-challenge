import { describe, expect, it } from "vitest";
import { buildChartData } from "../components/MetricChart";
import type { SeasonEvolution } from "../types/evolution";

describe("buildChartData", () => {
  it("maps each season to its player value, average, percentile and trend", () => {
    const seasons: SeasonEvolution[] = [
      {
        season: "2022/2023",
        metrics: [
          {
            metric: "goals",
            player_value: 12,
            position_average: 8,
            percentile: 85,
            trend: "improved",
          },
        ],
      },
    ];

    const result = buildChartData("goals", seasons);

    expect(result).toEqual([
      {
        season: "2022/2023",
        player: 12,
        positionAverage: 8,
        percentile: 85,
        trend: "improved",
      },
    ]);
  });

  it("defaults player value to 0 and the rest to null when the metric is missing that season", () => {
    const seasons: SeasonEvolution[] = [{ season: "2021/2022", metrics: [] }];

    const result = buildChartData("goals", seasons);

    expect(result).toEqual([
      {
        season: "2021/2022",
        player: 0,
        positionAverage: null,
        percentile: null,
        trend: null,
      },
    ]);
  });

  it("preserves season order as given (repository already sorts chronologically)", () => {
    const seasons: SeasonEvolution[] = [
      {
        season: "2021/2022",
        metrics: [
          {
            metric: "goals",
            player_value: 1,
            position_average: 1,
            percentile: 50,
            trend: null,
          },
        ],
      },
      {
        season: "2022/2023",
        metrics: [
          {
            metric: "goals",
            player_value: 2,
            position_average: 1,
            percentile: 90,
            trend: "improved",
          },
        ],
      },
    ];

    const result = buildChartData("goals", seasons);

    expect(result.map((r) => r.season)).toEqual(["2021/2022", "2022/2023"]);
  });
});
