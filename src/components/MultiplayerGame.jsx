import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "../styles/MultiplayerGame.css";

export default function MultiplayerGame() {
  const { lobbyId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [timer, setTimer] = useState(20);
  const [gameOver, setGameOver] = useState(false);
  const [socket, setSocket] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  // Client-side answer submission; note: we do NOT advance the question here.
  const handleAnswer = (selectedAnswer) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) {
      console.error("⚠️ No current question available!");
      return;
    }
    if (!currentQuestion) {
      console.error("No current question available for index:", currentQuestionIndex);
    }
    const storedUsername = sessionStorage.getItem("username");
    if (!storedUsername) {
      console.error("⚠️ Username not found in sessionStorage!");
      return;
    }
    if (hasAnswered) {
      console.log("Already answered for this question.");
      return;
    }
    setHasAnswered(true); // Prevent further submissions for this question

    console.log(`📡 Sending answer: ${selectedAnswer || "No answer"} from ${storedUsername}`);
    socket.emit("answer", { lobbyId, username: storedUsername, answer: selectedAnswer || "No Answer" });
  };

  // Socket initialization and game state updates
  useEffect(() => {
    const socket = io("http://localhost:5080");
    setSocket(socket);

    const storedUserId = sessionStorage.getItem("userId");
    const storedUsername = sessionStorage.getItem("username");
    console.log("Retrieved userId:", storedUserId);
    if (!storedUserId || !storedUsername) {
      console.error("⚠️ User ID or Username not found in sessionStorage!");
      return;
    }

    socket.emit("joinLobby", lobbyId, storedUsername, storedUserId);

    socket.on("gameState", (data) => {
      console.log("📡 Game State Updated:", data);
      if (data.questions && data.questions.length > 0) {
        console.log("Questions received:", data.questions);
        setQuestions(data.questions);
      } else {
        console.error("No questions received in game state.");
      }
      setCurrentQuestionIndex(data.currentQuestionIndex);
      setPlayerScore(data.playerScores[storedUsername] || 0);
      const opponentKey = Object.keys(data.playerScores).find((key) => key !== storedUsername);
      setOpponentScore(data.playerScores[opponentKey] || 0);
      setTimer(data.timer);
      setHasAnswered(false);
    });
    

    // Listen for game over event
    socket.on("gameOver", (finalState) => {
      console.log("📡 Game Over received:", finalState);
      setGameOver(true);
      if (finalState.gameSessionId) {
        sessionStorage.setItem("gameSessionId", finalState.gameSessionId);
      }
      const gameSessionId = sessionStorage.getItem("gameSessionId");
      const finalGameStatePayload = {
        playerScores: finalState.playerScores
      };
    
      // Only the owner should finalize
      const isOwner = sessionStorage.getItem("isOwner") === "true";
      if (isOwner && gameSessionId) {
        fetch(`http://localhost:8080/v1/game-sessions/finalise/${gameSessionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(finalGameStatePayload)
        })
          .then(res => res.json())
          .then(data => {
            console.log("✅ Game finalized:", data);
            setTimeout(() => navigate(`/match-result/${data.gameSessionId}`), 1000);
          })
          .catch(err => console.error("Finalization error:", err));
      } else {
        setTimeout(() => {
          navigate(`/match-result/${gameSessionId}`);
        }, 2000);
      }
    });
    
    
    // Optionally, also listen for a "gameSessionFinalized" event:
    socket.on("gameSessionFinalized", (data) => {
      console.log("Game session finalized broadcast received:", data);
      sessionStorage.setItem("gameSessionId", data.gameSessionId);
    });

    // Cleanup on unmount
    return () => socket.disconnect();
  }, [lobbyId, navigate]);

  // Timer countdown useEffect
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else {
      if (questions.length > 0 && !hasAnswered) {
        handleAnswer(null);
      }
    }
  }, [timer, questions, hasAnswered]);

  if (!questions.length) return <h2>Loading Questions...</h2>;
  if (gameOver) return <h2>Game Over! Redirecting...</h2>;

  const currentQuestion = questions[currentQuestionIndex];

  const splitText = (text, length) => {
    const words = text.split(" ");
    let lines = [];
    let currentLine = "";
    words.forEach((word) => {
      if ((currentLine + word).length <= length) {
        currentLine += `${word} `;
      } else {
        lines.push(currentLine.trim());
        currentLine = `${word} `;
      }
    });
    lines.push(currentLine.trim());
    return lines.join("<br>");
  };

  return (
    <div className="multiplayer-game-container">
      <div className="title-container">
      </div>
      <div className="timer-container">
        <div className="timer-clock">
          <svg width="200" height="200" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" stroke="none" fill="blue" />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="yellow"
              strokeWidth="3"
              fill="none"
              strokeDasharray={Math.PI * 2 * 45}
              strokeDashoffset={(timer / 20) * Math.PI * 2 * 45}
              style={{ transition: "stroke-dashoffset 1s linear", transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
            />
            <text x="50" y="55" textAnchor="middle" fill="white" fontSize="20">
              {timer}s
            </text>
          </svg>
        </div>
      </div>
      <div className="score-container">
        <p className="player-score">Host: {playerScore}</p>
        <p className="opponent-score">Opponent: {opponentScore}</p>
      </div>
      <div className="question-container">
        {currentQuestion ? (
          <h2 dangerouslySetInnerHTML={{ __html: splitText(currentQuestion.text, 40) }}></h2>
        ) : (
          <p>No question found</p>
        )}
      </div>
      <div className="answer-container-wrapper">
        {currentQuestion?.choices.map((choice, index) => (
          <button key={index} className="answer-container" onClick={() => handleAnswer(choice)}>
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
}
