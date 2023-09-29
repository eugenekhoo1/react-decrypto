import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Encryptor from "../components/Encryptor";
import useUser from "../hooks/useUser";
import axios from "../api/axios";
import socket from "../api/socket";
import TeamClues from "../cards/TeamClues";
import Header from "../components/Header";
import Scoreboard from "../cards/Scoreboard";
import JoinRoom from "../utils/JoinRoom";

export default function Encrypt() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [checkClues, setCheckClues] = useState(false);
  const [checkSubmitted, setCheckSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [players, setPlayers] = useState({ team1: [], team2: [] });
  const [round, setRound] = useState(0);
  const [words, setWords] = useState({ team1: [], team2: [] });
  const [code, setCode] = useState({ team1: [], team2: [] });
  const [encryptor, setEncryptor] = useState([]);
  const [teamClues, setTeamClues] = useState([]);

  useEffect(() => {
    JoinRoom(user.gid);
    getGameInfo();
    getRoundInfo();
    getClues();
    setIsLoading(false);
  }, []);

  useEffect(() => {
    socket.on("received-clues", () => {
      navigate(`/decode/${user.gid}`);
    });
  }, [socket]);

  const getGameInfo = async () => {
    const response = await axios.get(`/game/getgame/${user.gid}`);
    setWords({
      team1: response.data[0].team1_words,
      team2: response.data[0].team2_words,
    });
    setPlayers({
      team1: response.data[0].team1_players,
      team2: response.data[0].team2_players,
    });
  };

  const getRoundInfo = async () => {
    const response = await axios.get(`/game/getround/${user.gid}`);
    setEncryptor([response.data[0].encryptor, response.data[1].encryptor]);
    setCode({ team1: response.data[0].code, team2: response.data[1].code });
    setRound(response.data[0].round);

    // Checks submitted responses if refresh
    if (response.data[0].clue && response.data[1].clue) {
      setCheckClues(true);
    }
    if (response.data[user.team - 1].clue) {
      setCheckSubmitted(true);
    }
  };

  const getClues = async () => {
    const response = await axios.get(
      `/view/getclues?gid=${user.gid}&team=${user.team}&type=encrypt`
    );
    setTeamClues(response.data.teamClues);
  };

  return (
    <>
      {checkClues ? (
        <Navigate to={`/decode/${user.gid}`} replace={true} />
      ) : isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <Header user={user} />
          <Scoreboard />
          <TeamClues
            clues={teamClues}
            words={user.team === 1 ? words.team1 : words.team2}
          />

          {players.team1[encryptor[0] - 1] === user.player &&
          user.team === 1 ? (
            <Encryptor
              code={code.team1}
              words={words.team1}
              round={round}
              checkSubmitted={checkSubmitted}
            />
          ) : players.team2[encryptor[1] - 1] === user.player &&
            user.team === 2 ? (
            <Encryptor
              code={code.team2}
              words={words.team2}
              round={round}
              checkSubmitted={checkSubmitted}
            />
          ) : (
            <div className="container mt-4">Waiting for Encryption...</div>
          )}
        </div>
      )}
    </>
  );
}
