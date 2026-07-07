import { useParams } from "react-router-dom";

function PlayerEvolutionPage() {
  const { playerId } = useParams();
  return (
    <div>
      <h1>Player Evolution Placeholder {playerId}</h1>
      <p>Create Charts</p>
    </div>
  );
}

export default PlayerEvolutionPage;
