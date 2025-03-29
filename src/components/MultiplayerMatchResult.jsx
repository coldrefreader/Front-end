import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/MultiplayerMatchResult.css";

export default function MultiplayerMatchResult() {
  const { matchId } = useParams();
  const [matchResult, setMatchResult] = useState(null);

  useEffect(() => {
    // Use the correct endpoint
    fetch(`http://localhost:8080/v1/game-sessions/${matchId}`, { credentials: "include" })
      .then((response) => response.json())
      .then((data) => setMatchResult(data))
      .catch((error) => console.error("Error fetching match result:", error));
  }, [matchId]);

  if (!matchResult) return <h2>Loading Match Result...</h2>;

  const { player1Score, player2Score } = matchResult;
  const result = player1Score > player2Score ? "Victory" : "Defeat";

  return (
    <div className="match-result-container">
      <h2>Match Result</h2>
      <div className="score-container">
        <p className="player-score">Player: {player1Score}</p>
        <p className="opponent-score">Opponent: {player2Score}</p>
      </div>
      <h3 className="result">{result}</h3>
    </div>
  );
}
