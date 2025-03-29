import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SingleplayerGame.css";

export default function SingleplayerGame() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [timer, setTimer] = useState(25);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState("medium");

  const difficultyTimers = {
    easy: 35,
    medium: 25,
    hard: 15,
  };

  useEffect(() => {
    let isMounted = true;
    const urlParams = new URLSearchParams(window.location.search);
    const extractedDifficulty = urlParams.get("difficulty")?.toLowerCase() || "medium";

    if (!difficultyTimers[extractedDifficulty]) {
      console.warn("Invalid difficulty received:", extractedDifficulty, "Defaulting to 'medium'");
    }

    setDifficulty(difficultyTimers[extractedDifficulty] ? extractedDifficulty : "medium"); 
    setTimer(difficultyTimers[extractedDifficulty] || 25);

    const fetchQuestions = async () => {
      try {
        const response = await fetch("http://localhost:8080/v1/questions");
        const data = await response.json();
        if (data.length > 0 && isMounted) {
          setQuestions(data);
          setCurrentQuestionIndex(0);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else {
      console.log("Timer reached 0. Auto-answering with null.");
      handleAnswer(null);
    }
  }, [timer]);

  if (!questions) return <h2>Loading Questions...</h2>;
  if (gameOver) return <h2>Game Over! Redirecting...</h2>;

  const currentQuestion = questions[currentQuestionIndex];

  const getAiAnswer = () => {
    const difficultyChance = {
      easy: 0.3,
      medium: 0.55,
      hard: 0.8,
    };
    return Math.random() < difficultyChance[difficulty];
  };

  const handleAnswer = (selectedAnswer) => {
    if (!currentQuestion) return;

    console.log("Full question object:", currentQuestion);

    const correctAnswerIndex = currentQuestion.correctAnswerIndex;
    const correctAnswer = correctAnswerIndex !== undefined ? currentQuestion.choices[correctAnswerIndex] : undefined;
    console.log("Extracted correct answer:", correctAnswer);

    const aiCorrect = getAiAnswer();
    
    if (selectedAnswer === correctAnswer) {
      setPlayerScore((prev) => prev + 1);
    }
    if (aiCorrect) {
      setAiScore((prev) => prev + 1);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimer(difficultyTimers[difficulty]);
    } else {
      setGameOver(true);
      const matchResult = {
        playerScore,
        aiScore,
        difficulty,
        date: new Date().toLocaleString(),
      };
      const matchHistory = JSON.parse(localStorage.getItem("matchHistory")) || [];
      matchHistory.push(matchResult);
      localStorage.setItem("matchHistory", JSON.stringify(matchHistory));
      setTimeout(() => navigate("/match-Result"), 1000);
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
              strokeDashoffset={(timer / difficultyTimers[difficulty]) * Math.PI * 2 * 45}
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
        <p className="ai-score">AI: {aiScore}</p>
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