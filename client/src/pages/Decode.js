import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "../api/axios";
import Clue from "../components/Clue";
import useUser from "../hooks/useUser";
import Header from "../components/Header";
import Scoreboard from "../cards/Scoreboard";
import joinGameRoom from "../utils/joinGameRoom";
import joinChatRoom from "../utils/joinChatRoom";
import ChatRoom from "../components/ChatRoom";

export default function Decode() {
  const { user } = useUser();
  const [checkResponses, setCheckResponses] = useState(false);
  const [checkSubmitted, setCheckSubmitted] = useState(false);
  const [players, setPlayers] = useState({ team1: [], team2: [] });
  const [round, setRound] = useState(0);
  const [words, setWords] = useState({ team1: [], team2: [] });
  const [clue, setClue] = useState({ team1: {}, team2: {} });
  const [decoder, setDecoder] = useState([]);
  const [encryptor, setEncryptor] = useState([]);

  useEffect(() => {
    joinGameRoom(user.gid);
    joinChatRoom(user.gid, user.team);
    getGameInfo();
    getRoundInfo();
  }, []);

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
    setDecoder([response.data[0].decoder, response.data[1].decoder]);
    setEncryptor([
      players.team1[response.data[0].encryptor - 1],
      players.team2[response.data[1].encryptor - 1],
    ]);
    setRound(response.data[0].round);
    setClue({
      team1: response.data[0].clue,
      team2: response.data[1].clue,
    });

    // Checks submitted responses if refresh
    if (response.data[0].team1_response && response.data[1].team2_response) {
      setCheckResponses(true);
    }
    if (response.data[user.team - 1][`team${user.team}_response`]) {
      setCheckSubmitted(true);
    }
  };

  return (
    <div>
      {checkResponses ? (
        <Navigate to={`/intercept/${user.gid}`} replace={true} />
      ) : (
        <>
          <Header user={user} />
          <Scoreboard />
          <div className="container mt-4">
            <div>
              1:{" "}
              <span style={{ fontWeight: 600 }}>
                {words[`team${user.team}`][0]}
              </span>
            </div>
            <div>
              2:{" "}
              <span style={{ fontWeight: 600 }}>
                {words[`team${user.team}`][1]}
              </span>
            </div>
            <div>
              3:{" "}
              <span style={{ fontWeight: 600 }}>
                {words[`team${user.team}`][2]}
              </span>
            </div>
            <div>
              4:{" "}
              <span style={{ fontWeight: 600 }}>
                {words[`team${user.team}`][3]}
              </span>
            </div>
          </div>
          <Clue
            type={"decode"}
            clues={user.team === 1 ? clue.team1 : clue.team2}
            responder={
              user.team === 1
                ? players.team1[decoder[0] - 1]
                : players.team2[decoder[1] - 1]
            }
            round={round}
            checkSubmitted={checkSubmitted}
          />
          <ChatRoom disabledUsers={encryptor} />
        </>
      )}
    </div>
  );
}
