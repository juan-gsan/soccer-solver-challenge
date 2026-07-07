export interface PlayerSearchResult {
  player_id: number;
  name: string;
  position: string;
  sub_position: string;
  current_club: string;
  available_seasons: string[];
}

export interface PlayerSearchResponse {
  query: string;
  count: number;
  results: PlayerSearchResult[];
}
