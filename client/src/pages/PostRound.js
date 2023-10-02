import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { gameSocket } from "../api/socket";
import Scoreboard from "../cards/Scoreboard";
import Header from "../components/Header";
import useUser from "../hooks/useUser";
import joinGameRoom from "../utils/joinGameRoom";

export default function PostRound() {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    joinGameRoom(user.gid);
  }, []);

  useEffect(() => {
    gameSocket.on("received-next-round", (data) => {
      navigate(`/encrypt/${data.gid}`);
    });
  }, [gameSocket]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `game/nextround`,
        JSON.stringify({ gid: user.gid }),
        { headers: { "Content-Type": "application/json" } }
      );
      gameSocket.emit("next-round", { gid: user.gid });
      navigate(`/encrypt/${user.gid}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Header user={user} />
      <Scoreboard />
      <div className="container">
        <div className="row justify-content-center mt-3">
          <div className="col-3 text-center">
            <button onClick={handleSubmit}>Next Round</button>
          </div>
        </div>
      </div>
    </>
  );
}
