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

  useEffect(() => {
    const socket = io("http://localhost:5080");
    setSocket(socket);

    socket.on("gameState", (data) => {
      setQuestions(data.questions);
      setCurrentQuestionIndex(data.currentQuestionIndex);
      setPlayerScore(data.playerScores["playerId"]); // Replace 'playerId' with actual player ID
      setOpponentScore(data.playerScores["opponentId"]); // Replace 'opponentId' with actual opponent ID
      setTimer(data.timer);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else {
      handleAnswer(null);
    }
  }, [timer]);

  if (!questions.length) return <h2>Loading Questions...</h2>;
  if (gameOver) return <h2>Game Over! Redirecting...</h2>;

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (selectedAnswer) => {
    if (!currentQuestion) return;

    const correctAnswerIndex = currentQuestion.correctAnswerIndex;
    const correctAnswer = currentQuestion.choices[correctAnswerIndex];

    const playerId = sessionStorage.getItem("userId");
    socket.emit("answer", { playerId, answer: selectedAnswer });

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimer(20);
    } else {
      setGameOver(true);
      setTimeout(() => navigate("/match-result"), 1000);
    }
  };

  const splitText = (text, length) => {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';

    words.forEach(word => {
      if ((currentLine + word).length <= length) {
        currentLine += `${word} `;
      } else {
        lines.push(currentLine.trim());
        currentLine = `${word} `;
      }
    });

    lines.push(currentLine.trim());
    return lines.join('<br>');
  };

  return (
    <div className="game-container">
      <div className="title-container">
        <h2 className="title">Multiplayer Mode</h2>
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
              style={{ transition: 'stroke-dashoffset 1s linear', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
            <text x="50" y="55" textAnchor="middle" fill="white" fontSize="20">
              {timer}s
            </text>
          </svg>
        </div>
      </div>
      <div className="score-container">
        <p className="player-score">Player: {playerScore}</p>
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