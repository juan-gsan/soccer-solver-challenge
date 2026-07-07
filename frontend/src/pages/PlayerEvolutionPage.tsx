import type { JSX } from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { usePlayerEvolution } from "../hooks/usePlayerEvolution";
import MetricChart from "../components/MetricChart";
import MetricSelector from "../components/MetricSelector";

const DEFAULT_METRIC_COUNT = 3;

interface RouteParams extends Record<string, string | undefined> {
  playerId: string;
}

function PlayerEvolutionPage(): JSX.Element | null {
  const { playerId } = useParams<RouteParams>();
  const { data, loading, error } = usePlayerEvolution(playerId);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);

  useEffect((): void => {
    if (data) {
      setSelectedMetrics(data.available_metrics.slice(0, DEFAULT_METRIC_COUNT));
    }
  }, [data]);

  function toggleMetric(metric: string): void {
    setSelectedMetrics((prev: string[]) =>
      prev.includes(metric)
        ? prev.filter((m: string) => m !== metric)
        : [...prev, metric],
    );
  }

  if (loading) return <p className="status-message">Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!data) return null;

  if (data.seasons.length < 2) {
    return (
      <div className="evolution-page">
        <Link to="/" className="back-link">
          ← Back to Player Search
        </Link>
        <h1>{data.name}</h1>
        <p>
          There is only data for one season on this player, not enough history
          to show evolution
        </p>
      </div>
    );
  }

  return (
    <div className="evolution-page">
      <Link to="/" className="back-link">
        ← Back to Player Search
      </Link>
      <div className="evolution-page__header">
        <div>
          <h1>{data.name}</h1>
          <p className="evolution-page__meta">
            {data.position} ({data.sub_position})
          </p>
        </div>
        <Link to={`/compare?playerA=${data.player_id}`} className="button">
          Compare with another player
        </Link>
      </div>
      <p className="evolution-page__note">
        Comparisons are based on the average of players in the same position for
        each season. Trends are calculated based on normalised avg %, not based
        on absolute values.
      </p>

      <MetricSelector
        availableMetrics={data.available_metrics}
        selectedMetrics={selectedMetrics}
        onToggle={toggleMetric}
      />

      <div className="charts-grid">
        {selectedMetrics.map((metric: string) => (
          <MetricChart key={metric} metric={metric} seasons={data.seasons} />
        ))}
      </div>

      {selectedMetrics.length === 0 && (
        <p className="status-message">Select at least one metric</p>
      )}
    </div>
  );
}

export default PlayerEvolutionPage;
