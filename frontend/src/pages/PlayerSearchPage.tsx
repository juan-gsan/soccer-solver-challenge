import { useEffect, useState } from "react";
import { apiGet, ApiError } from "../api/client";
import type { PlayerSearchResponse } from "../types/player";
import PlayerCard from "../components/PlayerCard";

function PlayerSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlayerSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    apiGet<PlayerSearchResponse>("/players/top?limit=5")
      .then(setResults)
      .catch(() => {});
  }, []);

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
      setError(err instanceof ApiError ? err.message : "Error searching");
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
          <p className="results__count">
            {hasSearched
              ? `${results.count} results${results.count !== 1 ? "s" : ""} for "${results.query}"`
              : "Top Players per appearances"}
          </p>
          {results.results.map((player) => (
            <PlayerCard key={player.player_id} player={player} />
          ))}
        </div>
      )}
    </div>
  );
}

export default PlayerSearchPage;
