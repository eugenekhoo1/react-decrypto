import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../styles/landing.css";

export default function Landing() {
  const navigate = useNavigate();

  const [gameId, setGameId] = useState(null);

  const handleNewGame = async () => {
    try {
      const response = await axios.get(`/game/newgame`);
      navigate(`/addplayer/${response.data[0].game_id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    navigate(`/addplayer/${gameId}`);
  };

  return (
    <div className="container">
      <div className="row justify-content-center mt-5">
        <div className="col-6">
          <div className="new-game" onClick={handleNewGame}>
            Start New Game
          </div>
        </div>
      </div>
      <div className="row justify-content-center mt-3">
        <div className="col-6">
          <form onSubmit={handleSubmit}>
            <div className="game-id">
              <span>
                Game ID:{" "}
                <input
                  type="text"
                  id="gameId"
                  autoComplete="off"
                  required
                  onChange={(e) => {
                    setGameId(e.target.value);
                  }}
                />
                <button type="submit">Submit</button>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
