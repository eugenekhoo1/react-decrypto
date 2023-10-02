import { useEffect, useState } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { gameSocket } from "../api/socket";
import "../styles/player.css";
import useUser from "../hooks/useUser";
import joinGameRoom from "../utils/joinGameRoom";
import PlayerList from "../cards/PlayerList";
import joinChatRoom from "../utils/joinChatRoom";
import ChatRoom from "../components/ChatRoom";

export default function Player() {
  const { gid } = useParams();
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const [player, setPlayer] = useState([]);
  const [team, setTeam] = useState(null);
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [gameStatus, setGameStatus] = useState(null);

  useEffect(() => {
    joinGameRoom(gid);
    getGameInfo();
  }, []);

  useEffect(() => {
    gameSocket.on("received-start-game", (data) => {
      navigate(`/encrypt/${data.gid}`);
    });

    gameSocket.on("received-add-player", (data) => {
      if (data.team === 1) {
        setTeam1Players((prevTeam1Players) => [
          ...prevTeam1Players,
          data.player,
        ]);
      } else {
        setTeam2Players((prevTeam2Players) => [
          ...prevTeam2Players,
          data.player,
        ]);
      }
    });

    return () => {
      gameSocket.off("received-start-game");
      gameSocket.off("received-add-player");
    };
  }, [gameSocket]);

  const getGameInfo = async () => {
    const response = await axios.get(`/game/getgame/${gid}`);
    setTeam1Players(response.data[0].team1_players);
    setTeam2Players(response.data[0].team2_players);
    setGameStatus(response.data[0].status);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!player) {
      alert("Please enter a player name");
      return;
    } else if (!team) {
      alert("Please select a team");
      return;
    }

    try {
      const response = await axios.post(
        `/player/addplayer`,
        JSON.stringify({ gid, player, team }),
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (err) {
      alert(err.response ? err.response.data.message : "An error occurred");
      return;
    }

    setUser({ player, team, gid });
    sessionStorage.setItem("user", JSON.stringify({ player, team, gid }));
    gameSocket.emit("join-room", {
      gid: gid,
      player: player,
      team: team,
    });

    if (team === 1) {
      setTeam1Players([...team1Players, player]);
    } else {
      setTeam2Players([...team2Players, player]);
    }
    gameSocket.emit(`add-player`, { gid, player, team });
    joinChatRoom(gid, team);
  };

  const handleStart = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `/game/startgame`,
        JSON.stringify({ gid }),
        { headers: { "Content-Type": "application/json" } }
      );
      gameSocket.emit("start-game", { gid });
      navigate(`/encrypt/${gid}`);
    } catch (err) {
      alert(err.response.data.message);
    }
  };

  return (
    <>
      {gameStatus === "Not Started" ? (
        <>
          <div className="container mt-4">
            <div className="container">
              <div className="row justify-content-center">Game ID: {gid}</div>
              <form onSubmit={handleSubmit}>
                <div className="row justify-content-center">
                  <div className="col-7 col-md-3">
                    <div className="player-name">
                      <span>Player Name: </span>
                      <input
                        type="text"
                        id="name"
                        autoComplete="off"
                        required
                        onChange={(e) => {
                          setPlayer(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="row justify-content-center">
                  <div className="player-name-header">Team</div>

                  <div className="col-3 col-md-1 p-0">
                    <div
                      className={
                        team === 1
                          ? "team-toggle-item-selected"
                          : "team-toggle-item"
                      }
                      onClick={() => {
                        setTeam(1);
                      }}
                    >
                      1
                    </div>
                  </div>
                  <div className="col-3 col-md-1 p-0">
                    <div
                      className={
                        team === 2
                          ? "team-toggle-item-selected"
                          : "team-toggle-item"
                      }
                      onClick={() => {
                        setTeam(2);
                      }}
                    >
                      2
                    </div>
                  </div>
                </div>

                <div className="player-submit">
                  <button
                    type="submit"
                    disabled={
                      user && user.gid === gid.toString() ? true : false
                    }
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>

            <div className="row justify-content-center fst-italic mt-3">
              Minimum 2 players on each team to start
            </div>

            <div className="container">
              <div className="row justify-content-center">
                <div className="col-10 col-md-5">
                  <PlayerList players={team1Players} team={1} gid={gid} />
                </div>
              </div>
              <div className="row justify-content-center">
                <div className="col-10 col-md-5">
                  <PlayerList players={team2Players} team={2} gid={gid} />
                </div>
              </div>
            </div>

            <div className="row justify-content-center">
              <div className="col-3 col-md-2">
                <div className="start-button" onClick={handleStart}>
                  Start
                </div>
              </div>
            </div>
          </div>
          {user ? <ChatRoom disabledUsers={[]} /> : null}
        </>
      ) : gameStatus === "In Progress" ? (
        <Navigate to={`/encrypt/${gid}`} replace={true} />
      ) : gameStatus === "Completed" ? (
        <Navigate to={`/`} replace={true} />
      ) : null}
    </>
  );
}
