import type { JSX } from "react";
import { Link } from "react-router-dom";
import type { PlayerSearchResult } from "../types/player";

interface Props {
  player: PlayerSearchResult;
}

function PlayerCard({ player }: Props): JSX.Element {
  return (
    <div className="player-card">
      <div className="player-card__main">
        <h3>{player.name}</h3>
        <p className="player-card__meta">
          {player.position} ({player.sub_position}) · {player.current_club}
        </p>
        <p className="player-card__seasons">
          Available Seasons: {player.available_seasons.join(", ")}
        </p>
      </div>
      <Link to={`/players/${player.player_id}/evolution`} className="button">
        Evolution Chart
      </Link>
    </div>
  );
}

export default PlayerCard;
