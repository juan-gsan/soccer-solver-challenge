import { useState } from "react";
import { apiGet, ApiError } from "../api/client";
import type { PlayerSearchResponse, PlayerSearchResult } from "../types/player";

interface Props {
  label: string;
  selected: PlayerSearchResult | null;
  onSelect: (player: PlayerSearchResult) => void;
  onClear: () => void;
}

function PlayerPicker({ label, selected, onSelect, onClear }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlayerSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(value: string) {
    setQuery(value);
    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<PlayerSearchResponse>(
        `/players/search?name=${encodeURIComponent(value.trim())}&limit=5`,
      );
      setSuggestions(data.results);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error searching");
    } finally {
      setLoading(false);
    }
  }

  if (selected) {
    return (
      <div className="player-picker player-picker--selected">
        <div>
          <p className="player-picker__label">{label}</p>
          <p className="player-picker__name">{selected.name}</p>
          <p className="player-picker__meta">
            {selected.position} · {selected.current_club}
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="player-picker__clear"
        >
          Swap
        </button>
      </div>
    );
  }

  return (
    <div className="player-picker">
      <p className="player-picker__label">{label}</p>
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search player..."
      />
      {loading && <p className="status-message">Searching...</p>}
      {error && <p className="error">{error}</p>}
      {suggestions.length > 0 && (
        <ul className="player-picker__suggestions">
          {suggestions.map((player) => (
            <li key={player.player_id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(player);
                  setQuery("");
                  setSuggestions([]);
                }}
              >
                {player.name} <span>({player.position})</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PlayerPicker;
