import type { JSX } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useApiGet } from "../hooks/useApiGet";
import { usePlayerEvolution } from "../hooks/usePlayerEvolution";
import type { PlayerSearchResult } from "../types/player";
import PlayerPicker from "../components/PlayerPicker";
import MetricSelector from "../components/MetricSelector";
import ComparisonChart from "../components/ComparisonChart";

const DEFAULT_METRIC_COUNT = 1;

function ComparePage(): JSX.Element {
  const [searchParams] = useSearchParams();

  const [playerA, setPlayerA] = useState<PlayerSearchResult | null>(null);
  const [playerB, setPlayerB] = useState<PlayerSearchResult | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);

  const preselectedId: string | null = searchParams.get("playerA");
  const { data: preselectedPlayer } = useApiGet<PlayerSearchResult>(
    !playerA && preselectedId ? `/players/${preselectedId}` : null,
  );
  useEffect((): void => {
    if (preselectedPlayer) setPlayerA(preselectedPlayer);
  }, [preselectedPlayer]);

  const {
    data: evolutionA,
    loading: loadingA,
    error: errorA,
  } = usePlayerEvolution(playerA?.player_id);
  const {
    data: evolutionB,
    loading: loadingB,
    error: errorB,
  } = usePlayerEvolution(playerB?.player_id);
  const loading: boolean = loadingA || loadingB;
  const error: string | null = errorA ?? errorB;

  useEffect((): void => {
    if (evolutionA)
      setSelectedMetrics(
        evolutionA.available_metrics.slice(0, DEFAULT_METRIC_COUNT),
      );
  }, [evolutionA]);

  function toggleMetric(metric: string): void {
    setSelectedMetrics((prev: string[]) =>
      prev.includes(metric)
        ? prev.filter((m: string) => m !== metric)
        : [...prev, metric],
    );
  }

  return (
    <div className="compare-page">
      <h1>Players Comparison</h1>
      <p className="evolution-page__note">
        Compares the history of two different players based on normalised
        percentile by season for the same position.
      </p>

      <div className="compare-pickers">
        <PlayerPicker
          label="Player A"
          selected={playerA}
          onSelect={setPlayerA}
          onClear={(): void => setPlayerA(null)}
        />
        <PlayerPicker
          label="Player B"
          selected={playerB}
          onSelect={setPlayerB}
          onClear={(): void => setPlayerB(null)}
        />
      </div>

      {loading && <p className="status-message">Loading...</p>}
      {error && <p className="error">{error}</p>}

      {evolutionA && evolutionB && (
        <>
          <MetricSelector
            availableMetrics={evolutionA.available_metrics}
            selectedMetrics={selectedMetrics}
            onToggle={toggleMetric}
          />

          <div className="charts-grid">
            {selectedMetrics.map((metric: string) => (
              <ComparisonChart
                key={metric}
                metric={metric}
                nameA={evolutionA.name}
                nameB={evolutionB.name}
                seasonsA={evolutionA.seasons}
                seasonsB={evolutionB.seasons}
              />
            ))}
          </div>

          {selectedMetrics.length === 0 && (
            <p className="status-message">Select at least one metric</p>
          )}
        </>
      )}
    </div>
  );
}

export default ComparePage;
