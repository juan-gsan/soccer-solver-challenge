import { Routes, Route, Link, useLocation } from "react-router-dom";
import PlayerSearchPage from "./pages/PlayerSearchPage";
import PlayerEvolutionPage from "./pages/PlayerEvolutionPage";
import ComparePage from "./pages/ComparePage";

function App() {
  const location = useLocation();

  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/">SoccerSolver - Player Search</Link>
        <Link to="/compare">Player Comparison</Link>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<PlayerSearchPage key={location.key} />} />
          <Route
            path="/players/:playerId/evolution"
            element={<PlayerEvolutionPage />}
          />
          <Route path="/compare" element={<ComparePage key={location.key} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
