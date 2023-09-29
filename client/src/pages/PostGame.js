import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import socket from "../api/socket";
import useUser from "../hooks/useUser";
import Scoreboard from "../cards/Scoreboard";
import JoinRoom from "../utils/JoinRoom";

export default function PostGame() {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    JoinRoom(user.gid);
  }, []);

  useEffect(() => {
    socket.on("received-complete-game", (data) => {
      navigate(`/`);
    });
  }, [socket]);

  const handleEndGame = async (e) => {
    e.preventDefault();

    const response = await axios.post(
      "/game/endgame",
      JSON.stringify({
        gid: user.gid,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    socket.emit("complete-game", { gid: user.gid });
    navigate(`/`);
  };

  return (
    <>
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col text-center">
            {/* {winner === 0 ? "Draw!" : `Congratulations Team ${winner}!`} */}
            Game Completed!
          </div>
        </div>
      </div>
      <Scoreboard />
      <div className="container">
        <div className="row justify-content-center mt-3">
          <div className="col-3 text-center">
            <button onClick={handleEndGame}>End Game</button>
          </div>
        </div>
      </div>
    </>
  );
}
