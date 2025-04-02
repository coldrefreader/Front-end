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
  const [selectedAnswer, setSelectedAnswer] = useState(null); // New state for selected answer
  const [hostName, setHostName] = useState("");      // New state for host name
  const [opponentName, setOpponentName] = useState(""); // New state for opponent name

  // Client-side answer submission
  const handleAnswer = (selectedAnswer) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) {
      console.error("⚠️ No current question available!");
      return;
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
    setHasAnswered(true);
    setSelectedAnswer(selectedAnswer); // Store the selected answer
    console.log(`📡 Sending answer: ${selectedAnswer || "No answer"} from ${storedUsername}`);
    socket.emit("answer", { lobbyId, username: storedUsername, answer: selectedAnswer || "No Answer" });
  };

  // Socket initialization and game state updates
  useEffect(() => {
    const socketInstance = io("http://localhost:5080");
    setSocket(socketInstance);

    const storedUserId = sessionStorage.getItem("userId");
    const storedUsername = sessionStorage.getItem("username");
    if (!storedUserId || !storedUsername) {
      console.error("⚠️ User ID or Username not found in sessionStorage!");
      return;
    }

    socketInstance.emit("joinLobby", lobbyId, storedUsername, storedUserId);

    socketInstance.on("gameState", (data) => {
      console.log("📡 Game State Updated:", data);
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        console.error("No questions received in game state.");
      }
      setCurrentQuestionIndex(data.currentQuestionIndex);
      setPlayerScore(data.playerScores[storedUsername] || 0);
      
      // Determine opponent key from playerScores (assuming exactly two players)
      const keys = Object.keys(data.playerScores);
      const opponentKey = keys.find((key) => key !== storedUsername) || "";
      setOpponentScore(data.playerScores[opponentKey] || 0);
      
      // Determine host and opponent names based on the isOwner flag.
      const isOwner = sessionStorage.getItem("isOwner") === "true";
      if (isOwner) {
        setHostName(storedUsername);
        setOpponentName(opponentKey);
      } else {
        setHostName(opponentKey);
        setOpponentName(storedUsername);
      }
      
      setTimer(data.timer);
      setHasAnswered(false);
      setSelectedAnswer(null); // Reset selected answer for the next question
    });

    socketInstance.on("gameOver", (finalState) => {
      console.log("📡 Game Over received:", finalState);
      setGameOver(true);
      if (finalState.gameSessionId) {
        sessionStorage.setItem("gameSessionId", finalState.gameSessionId);
      }
      const gameSessionId = sessionStorage.getItem("gameSessionId");
      const finalGameStatePayload = {
        playerScores: finalState.playerScores,
      };
      const isOwner = sessionStorage.getItem("isOwner") === "true";
      if (isOwner && gameSessionId) {
        fetch(`http://localhost:8080/v1/game-sessions/finalise/${gameSessionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(finalGameStatePayload),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("✅ Game finalized:", data);
            setTimeout(() => navigate(`/match-result/${data.gameSessionId}`), 1000);
          })
          .catch((err) => console.error("Finalization error:", err));
      } else {
        setTimeout(() => {
          navigate(`/match-result/${gameSessionId}`);
        }, 2000);
      }
    });

    socketInstance.on("gameSessionFinalized", (data) => {
      console.log("Game session finalized broadcast received:", data);
      sessionStorage.setItem("gameSessionId", data.gameSessionId);
    });

    return () => socketInstance.disconnect();
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
        <p className="player-score">{hostName || "Host"}: {playerScore}</p>
        <p className="opponent-score">{opponentName || "Opponent"}: {opponentScore}</p>
      </div>
      <div className="question-container">
        {currentQuestion ? (
          <h2 dangerouslySetInnerHTML={{ __html: splitText(currentQuestion.text, 40) }}></h2>
        ) : (
          <p>No question found</p>
        )}
      </div>
      <div className="answer-container-wrapper">
        {currentQuestion?.choices.map((choice, index) => {
          const isSelected = selectedAnswer !== null;
          const hideButton = isSelected && choice !== selectedAnswer;
          return (
            <button
              key={index}
              className={`answer-container ${hideButton ? "hidden" : ""}`}
              onClick={() => handleAnswer(choice)}
              disabled={isSelected && !hideButton}  // disable if an answer is already selected
            >
              {choice}
            </button>
          );
        })}
      </div>
    </div>
  );
}
