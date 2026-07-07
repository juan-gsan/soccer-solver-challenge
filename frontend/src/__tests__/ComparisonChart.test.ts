import { describe, expect, it } from "vitest";
import {
  buildComparisonData,
  consistencyScore,
} from "../components/ComparisonChart";
import type { SeasonEvolution } from "../types/evolution";

function makeSeason(
  season: string,
  metric: string,
  percentile: number,
): SeasonEvolution {
  return {
    season,
    metrics: [
      {
        metric,
        player_value: 0,
        position_average: null,
        percentile,
        trend: null,
      },
    ],
  };
}

describe("buildComparisonData", () => {
  it("merges two players onto a shared, sorted season axis", () => {
    const seasonsA = [
      makeSeason("2021/2022", "goals", 40),
      makeSeason("2022/2023", "goals", 60),
    ];
    const seasonsB = [makeSeason("2022/2023", "goals", 80)];

    const result = buildComparisonData("goals", seasonsA, seasonsB);

    expect(result.map((r) => r.season)).toEqual(["2021/2022", "2022/2023"]);
  });

  it("fills missing seasons for one player with null instead of 0", () => {
    const seasonsA = [makeSeason("2021/2022", "goals", 40)];
    const seasonsB = [makeSeason("2022/2023", "goals", 80)];

    const result = buildComparisonData("goals", seasonsA, seasonsB);

    const first = result.find((r) => r.season === "2021/2022");
    expect(first?.playerA).toBe(40);
    expect(first?.playerB).toBeNull(); // player B has no data that season — must NOT be 0
  });

  it("reads the percentile for the requested metric only", () => {
    const seasonsA: SeasonEvolution[] = [
      {
        season: "2022/2023",
        metrics: [
          {
            metric: "goals",
            player_value: 0,
            position_average: null,
            percentile: 90,
            trend: null,
          },
          {
            metric: "assists",
            player_value: 0,
            position_average: null,
            percentile: 30,
            trend: null,
          },
        ],
      },
    ];
    const result = buildComparisonData("assists", seasonsA, []);
    expect(result[0]?.playerA).toBe(30);
  });
});

describe("consistencyScore", () => {
  it("returns null when fewer than 2 data points exist", () => {
    expect(consistencyScore([50])).toBeNull();
    expect(consistencyScore([])).toBeNull();
  });

  it("ignores nulls when computing the score", () => {
    // Only [50, 50] should count -> perfectly consistent -> stddev 0
    expect(consistencyScore([50, null, 50])).toBe(0);
  });

  it("is 0 for perfectly consistent percentiles across seasons", () => {
    expect(consistencyScore([70, 70, 70])).toBe(0);
  });

  it("is higher for more volatile percentiles", () => {
    const stable = consistencyScore([70, 72, 68]);
    const volatile = consistencyScore([10, 90, 20]);
    expect(stable).not.toBeNull();
    expect(volatile).not.toBeNull();
    expect(volatile as number).toBeGreaterThan(stable as number);
  });
});
