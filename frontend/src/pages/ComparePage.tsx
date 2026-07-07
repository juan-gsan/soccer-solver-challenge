import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiGet, ApiError } from "../api/client";
import type { PlayerSearchResult } from "../types/player";
import type { PlayerEvolutionResponse } from "../types/evolution";
import PlayerPicker from "../components/PlayerPicker";
import MetricSelector from "../components/MetricSelector";
import ComparisonChart from "../components/ComparisonChart";

const DEFAULT_METRIC_COUNT = 1;

function ComparePage() {
  const [searchParams] = useSearchParams();

  const [playerA, setPlayerA] = useState<PlayerSearchResult | null>(null);
  const [playerB, setPlayerB] = useState<PlayerSearchResult | null>(null);

  const [evolutionA, setEvolutionA] = useState<PlayerEvolutionResponse | null>(
    null,
  );
  const [evolutionB, setEvolutionB] = useState<PlayerEvolutionResponse | null>(
    null,
  );

  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const preselectedId = searchParams.get("playerA");
    if (!preselectedId || playerA) return;
    apiGet<PlayerSearchResult>(`/players/${preselectedId}`)
      .then(setPlayerA)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (!playerA || !playerB) return;
    setLoading(true);
    setError(null);
    Promise.all([
      apiGet<PlayerEvolutionResponse>(
        `/players/${playerA.player_id}/evolution`,
      ),
      apiGet<PlayerEvolutionResponse>(
        `/players/${playerB.player_id}/evolution`,
      ),
    ])
      .then(([dataA, dataB]) => {
        setEvolutionA(dataA);
        setEvolutionB(dataB);
        setSelectedMetrics(
          dataA.available_metrics.slice(0, DEFAULT_METRIC_COUNT),
        );
      })
      .catch((err) => {
        setError(
          err instanceof ApiError ? err.message : "Error loading comparison",
        );
      })
      .finally(() => setLoading(false));
  }, [playerA, playerB]);

  function toggleMetric(metric: string) {
    setSelectedMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric],
    );
  }

  return (
    <div className="compare-page">
      <h1>Player Comparison</h1>
      <p className="evolution-page__note">
        Compares the history of two different players based on normalised
        percent by season for the same position.
      </p>

      <div className="compare-pickers">
        <PlayerPicker
          label="Player A"
          selected={playerA}
          onSelect={setPlayerA}
          onClear={() => {
            setPlayerA(null);
            setEvolutionA(null);
          }}
        />
        <PlayerPicker
          label="Player B"
          selected={playerB}
          onSelect={setPlayerB}
          onClear={() => {
            setPlayerB(null);
            setEvolutionB(null);
          }}
        />
      </div>

      {loading && <p className="status-message">Loading comparison...</p>}
      {error && <p className="error">{error}</p>}

      {evolutionA && evolutionB && (
        <>
          <MetricSelector
            availableMetrics={evolutionA.available_metrics}
            selectedMetrics={selectedMetrics}
            onToggle={toggleMetric}
          />

          <div className="charts-grid">
            {selectedMetrics.map((metric) => (
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
