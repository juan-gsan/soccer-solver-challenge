import type { ChangeEvent, JSX } from "react";
import { useState } from "react";
import { useApiGet } from "../hooks/useApiGet";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import type { PlayerSearchResponse, PlayerSearchResult } from "../types/player";

interface Props {
  label: string;
  selected: PlayerSearchResult | null;
  onSelect: (player: PlayerSearchResult) => void;
  onClear: () => void;
}

function PlayerPicker({
  label,
  selected,
  onSelect,
  onClear,
}: Props): JSX.Element {
  const [query, setQuery] = useState<string>("");
  const debouncedQuery: string = useDebouncedValue(query, 300);
  const searchPath: string | null =
    debouncedQuery.trim().length >= 2
      ? `/players/search?name=${encodeURIComponent(debouncedQuery.trim())}&limit=5`
      : null;

  const { data, loading, error } = useApiGet<PlayerSearchResponse>(searchPath);
  const suggestions: PlayerSearchResult[] = data?.results ?? [];

  function handleQueryChange(event: ChangeEvent<HTMLInputElement>): void {
    setQuery(event.target.value);
  }

  function handleSelect(player: PlayerSearchResult): void {
    onSelect(player);
    setQuery("");
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
        onChange={handleQueryChange}
        placeholder="Search Player..."
      />
      {loading && <p className="status-message">Searching...</p>}
      {error && <p className="error">{error}</p>}
      {suggestions.length > 0 && (
        <ul className="player-picker__suggestions">
          {suggestions.map((player: PlayerSearchResult) => (
            <li key={player.player_id}>
              <button type="button" onClick={(): void => handleSelect(player)}>
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
