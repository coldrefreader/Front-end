import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Leaderboard.css";

export default function Leaderboard() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false); // ⬅️ Track exit animation

  useEffect(() => {
    let isMounted = true;
    console.log("🏁 Checking session...");

    // ✅ Fetch session data just like in `Home.jsx`
    const checkSession = async () => {
      try {
        const response = await fetch("http://localhost:8080/v1/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Session validated:", data);
          sessionStorage.setItem("username", data.username); // Ensure username is stored
        } else {
          console.log("❌ No session found, redirecting.");
          sessionStorage.removeItem("username");
          setHasSession(false);
        }
      } catch (error) {
        console.error("⚠️ Error checking session:", error);
        setHasSession(false);
      }
    };

    checkSession();

    return () => {
      isMounted = false;
      console.log("🛑 useEffect cleanup: Component unmounted");
    };
  }, []);

  useEffect(() => {
    if (!hasSession) {
      console.log("⏳ Redirecting to index in 1.5 seconds...");
      setTimeout(() => navigate("/"), 1500);
    }
  }, [hasSession, navigate]);

  useEffect(() => {
    if (!hasSession) return; // 🚨 Don't fetch leaderboard if session is invalid

    let isMounted = true;
    const fetchLeaderboard = async () => {
      try {
        console.log("📡 Fetching leaderboard data...");
        const response = await fetch("http://localhost:8081/v1/leaderboard/top", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) throw new Error("❌ Failed to fetch leaderboard");

        const data = await response.json();
        console.log("✅ Leaderboard data received:", data);

        if (isMounted) {
          const sortedLeaderboard = data.map(player => ({
            ...player,
            winRate: player.totalGames > 0 ? (player.totalWins / player.totalGames) * 100 : 0
          })).sort((a, b) => b.winRate - a.winRate);

          console.log("🎯 Setting leaderboard state:", sortedLeaderboard);
          setLeaderboard(sortedLeaderboard);
          sessionStorage.setItem("leaderboardData", JSON.stringify(sortedLeaderboard));
        }
      } catch (error) {
        console.error("⚠️ Error fetching leaderboard:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLeaderboard();

    return () => {
      isMounted = false;
    };
  }, [hasSession]); // 🚨 Only fetch if session is valid

  // ✅ Handle back navigation with exit animation
  const handleBack = () => {
    setIsLeaving(true);
    setTimeout(() => navigate("/home"), 800);
  };

  if (!hasSession) return <h2>No session detected, redirecting to Index...</h2>;
  if (loading) return <h2>Loading Leaderboard...</h2>;
  if (!leaderboard) return <h2>Loading Leaderboard...</h2>;

  return (
    <>
      <div className={`leaderboard-container ${isLeaving ? "leaving" : ""}`}>
        <h2>Leaderboard</h2>
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Total Games</th>
              <th>Total Wins</th>
              <th>Win Rate (%)</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((player, index) => (
              <tr key={player.username}>
                <td>{index + 1}</td>
                <td>{player.username}</td>
                <td>{player.totalGames}</td>
                <td>{player.totalWins}</td>
                <td>{player.winRate ? player.winRate.toFixed(2) : "0.00"}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔙 Separate Back Button (Not inside leaderboard animation) */}
      <div className="back-button-container">
        <button className="back-button" onClick={handleBack}>Back</button>
      </div>
    </>
  );
}
