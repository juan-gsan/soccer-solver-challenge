import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function App() {
  const [backendStatus, setBackendStatus] = useState<string>("checking...");

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setBackendStatus(data.message))
      .catch(() => setBackendStatus("could not connect to backend"));
  }, []);

  return (
    <div className="landing">
      <h1>SoccerSolver</h1>
      <p>Hello world 👋</p>
      <p className="status">Backend Health Check: {backendStatus}</p>
    </div>
  );
}

export default App;
