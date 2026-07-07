import { useEffect, useState } from "react";
import { apiGet, ApiError } from "../api/client";
import type { PlayerSearchResponse } from "../types/player";
import { METRIC_LABELS, metricLabel } from "../constants/metrics";
import PlayerCard from "../components/PlayerCard";

const TOP_METRIC_OPTIONS = Object.keys(METRIC_LABELS);

function PlayerSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlayerSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [topMetric, setTopMetric] = useState("matches_played");

  useEffect(() => {
    if (hasSearched) return;
    apiGet<PlayerSearchResponse>(`/players/top?metric=${topMetric}&limit=5`)
      .then(setResults)
      .catch(() => {});
  }, [topMetric, hasSearched]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) {
      setError("Write down at least two characters");
      return;
    }
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const data = await apiGet<PlayerSearchResponse>(
        `/players/search?name=${encodeURIComponent(query.trim())}`,
      );
      setResults(data);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Error searching player",
      );
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="search-page">
      <h1>Search Player</h1>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
                ? `${results.count} results${results.count !== 1 ? "s" : ""} for "${results.query}"`
                : "Top Players"}
            </p>
            {!hasSearched && (
              <label className="top-metric-select">
                by
                <select
                  value={topMetric}
                  onChange={(e) => setTopMetric(e.target.value)}
                >
                  {TOP_METRIC_OPTIONS.map((metric) => (
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
