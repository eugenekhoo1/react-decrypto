import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import useUser from "../hooks/useUser";
import "../styles/landing.css";
import logo from "../img/logo.png";

export default function Landing() {
  const { setUser } = useUser();

  const navigate = useNavigate();

  const [gameId, setGameId] = useState(null);
  const [player, setPlayer] = useState(null);

  const handleNewGame = async () => {
    try {
      const response = await axios.get(`/game/newgame`);
      navigate(`/addplayer/${response.data[0].game_id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await axios.get(`/game/getgame/${gameId}`);
    if (response.data.length === 0) {
      alert("Game ID does not exist");
      return;
    }

    if (response.data[0].status === "Not Started") {
      navigate(`/addplayer/${gameId}`);
    } else if (response.data[0].status === "Completed") {
      alert("Game has already been completed");
      return;
    } else if (
      response.data[0].status === "In Progress" &&
      response.data[0].team1_players.includes(player)
    ) {
      setUser({ player, team: 1, gid: gameId });
      sessionStorage.setItem(
        "user",
        JSON.stringify({ player, team: 1, gid: gameId })
      );
      navigate(`/encrypt/${gameId}`);
    } else if (
      response.data[0].status === "In Progress" &&
      response.data[0].team2_players.includes(player)
    ) {
      setUser({ player, team: 2, gid: gameId });
      sessionStorage.setItem(
        "user",
        JSON.stringify({ player, team: 2, gid: gameId })
      );
      navigate(`/encrypt/${gameId}`);
    } else {
      alert(
        player
          ? `"${player}" does not exist in game ${gameId}`
          : "Please enter a player name"
      );
      return;
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center mt-5">
        <img className="logo" src={logo} alt="logo" />
      </div>

      <div className="row justify-content-center mt-3">
        Enter game ID to join an existing game
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row justify-content-center mt-2">
          <div className="col-6 text-center">
            <span>Game ID: </span>
            <input
              type="text"
              id="gameId"
              autoComplete="off"
              required
              onChange={(e) => {
                setGameId(e.target.value);
              }}
            />
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-6 text-center">
            <span>Player Name: </span>
            <input
              type="text"
              id="playerName"
              autoComplete="off"
              onChange={(e) => {
                setPlayer(e.target.value);
              }}
            />
          </div>
          <div className="row justify-content-center mt-2">
            <div className="col-3 text-center">
              <button type="submit">Submit</button>
            </div>
          </div>
        </div>
      </form>

      <div className="row justify-content-center mt-3">or start a new game</div>

      <div className="row justify-content-center mt-2">
        <div className="col-6">
          <div className="new-game" onClick={handleNewGame}>
            New Game
          </div>
        </div>
      </div>
    </div>
  );
}
