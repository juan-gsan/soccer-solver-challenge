import type { ChangeEvent, FormEvent, JSX } from "react";
import { useState } from "react";
import { useApiGet } from "../hooks/useApiGet";
import { useLazyApiGet } from "../hooks/useLazyApiGet";
import type { PlayerSearchResponse } from "../types/player";
import { METRIC_LABELS, metricLabel } from "../constants/metrics";
import PlayerCard from "../components/PlayerCard";

const TOP_METRIC_OPTIONS: string[] = Object.keys(METRIC_LABELS);

function PlayerSearchPage(): JSX.Element {
  const [query, setQuery] = useState<string>("");
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [topMetric, setTopMetric] = useState<string>("goals");
  const [validationError, setValidationError] = useState<string | null>(null);

  const { data: topPlayers } = useApiGet<PlayerSearchResponse>(
    !hasSearched ? `/players/top?metric=${topMetric}&limit=5` : null,
  );

  const {
    data: searchResults,
    loading,
    error: searchError,
    execute: runSearch,
  } = useLazyApiGet<PlayerSearchResponse>();

  async function handleSearch(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    if (query.trim().length < 2) {
      setValidationError("Write down at least two characters");
      return;
    }
    setValidationError(null);
    setHasSearched(true);
    await runSearch(`/players/search?name=${encodeURIComponent(query.trim())}`);
  }

  function handleQueryChange(event: ChangeEvent<HTMLInputElement>): void {
    setQuery(event.target.value);
  }

  function handleMetricChange(event: ChangeEvent<HTMLSelectElement>): void {
    setTopMetric(event.target.value);
  }

  const results: PlayerSearchResponse | null = hasSearched
    ? searchResults
    : topPlayers;
  const error: string | null =
    validationError ?? (hasSearched ? searchError : null);

  return (
    <div className="search-page">
      <h1>Search Player</h1>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder="Player Name (ex. Haaland)"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {results && (
        <div className="results">
          <div className="results__header">
            <p className="results__count">
              {hasSearched
                ? `${results.count} result${results.count !== 1 ? "s" : ""} for "${results.query}"`
                : "Top Players"}
            </p>
            {!hasSearched && (
              <label className="top-metric-select">
                by
                <select value={topMetric} onChange={handleMetricChange}>
                  {TOP_METRIC_OPTIONS.map((metric: string) => (
                    <option key={metric} value={metric}>
                      {metricLabel(metric)}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          {results.results.map((player) => (
            <PlayerCard key={player.player_id} player={player} />
          ))}
        </div>
      )}
    </div>
  );
}

export default PlayerSearchPage;
