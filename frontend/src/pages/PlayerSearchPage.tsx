import { useState } from "react";
import { apiGet, ApiError } from "../api/client";
import type { PlayerSearchResponse } from "../types/player";
import PlayerCard from "../components/PlayerCard";

function PlayerSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlayerSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) {
      setError("Please write at least two characters");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<PlayerSearchResponse>(
        `/players/search?name=${encodeURIComponent(query.trim())}`,
      );
      setResults(data);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Error searching players",
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
          placeholder="Player Name (example: Haaland)"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {results && (
        <div className="results">
          <p className="results__count">
            {results.count} result{results.count !== 1 ? "s" : ""} for "
            {results.query}"
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
