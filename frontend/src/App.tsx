import { Routes, Route, Link } from "react-router-dom";
import PlayerSearchPage from "./pages/PlayerSearchPage";
import PlayerEvolutionPage from "./pages/PlayerEvolutionPage";
import ComparePage from "./pages/ComparePage";

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/">SoccerSolver - Player Search</Link>
        <Link to="/compare">Evolution Comparison</Link>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<PlayerSearchPage />} />
          <Route
            path="/players/:playerId/evolution"
            element={<PlayerEvolutionPage />}
          />
          <Route path="/compare" element={<ComparePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
