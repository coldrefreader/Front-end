import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SettingsProvider } from "./context/SettingsContext";
import VideoBackground from "./components/VideoBackground";
import Index from "./pages/Index";
import Singleplayer from "./pages/Singleplayer";
import SingleplayerGame from "./pages/SingleplayerGame";  // Import the missing page
import GameSession from "./pages/GameSession";
import MatchResult from "./pages/MatchResult";
import Options from "./pages/Options";
import Multiplayer from "./pages/Multiplayer";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import MatchHistory from "./pages/MatchHistory";
import Leaderboard from "./pages/Leaderboard";
import Lobby from "./pages/Lobby";

function App() {
  return (
    <SettingsProvider>
      <Router>
        {/* VideoBackground is rendered once, outside of the Routes, 
            so it remains persistent across page changes */}
        <VideoBackground />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/singleplayer" element={<Singleplayer />} />
          <Route path="/singleplayer-game" element={<SingleplayerGame />} />  {/* Add this */}
          <Route path="/game-session" element={<GameSession />} />
          <Route path="/match-result" element={<MatchResult />} />
          <Route path="/options" element={<Options />} />
          <Route path="/multiplayer" element={<Multiplayer />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/match-history" element={<MatchHistory />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/lobby" element={<Lobby />} />
        </Routes>
      </Router>
    </SettingsProvider>
  );
}

export default App;
