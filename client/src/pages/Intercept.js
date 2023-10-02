import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "../api/axios";
import Clue from "../components/Clue";
import OppTeamClues from "../cards/OppTeamClues";
import Header from "../components/Header";
import useUser from "../hooks/useUser";
import Scoreboard from "../cards/Scoreboard";
import joinGameRoom from "../utils/joinGameRoom";
import joinChatRoom from "../utils/joinChatRoom";
import ChatRoom from "../components/ChatRoom";

export default function Intercept() {
  const { user } = useUser();
  const [checkResponses, setCheckResponses] = useState(false);
  const [checkSubmitted, setCheckSubmitted] = useState(false);
  const [players, setPlayers] = useState({ team1: [], team2: [] });
  const [round, setRound] = useState(0);
  const [clue, setClue] = useState({ team1: {}, team2: {} });
  const [interceptor, setInterceptor] = useState([]);
  const [oppTeamClues, setOppTeamClues] = useState([]);

  useEffect(() => {
    joinGameRoom(user.gid);
    joinChatRoom(user.gid, user.team);
    getGameInfo();
    getRoundInfo();
    getClues();
  }, []);

  const getGameInfo = async () => {
    const response = await axios.get(`/game/getgame/${user.gid}`);
    setPlayers({
      team1: response.data[0].team1_players,
      team2: response.data[0].team2_players,
    });
  };

  const getRoundInfo = async () => {
    const response = await axios.get(`/game/getround/${user.gid}`);
    setInterceptor([
      response.data[0].interceptor,
      response.data[1].interceptor,
    ]);
    setRound(response.data[0].round);
    setClue({
      team1: response.data[0].clue,
      team2: response.data[1].clue,
    });

    // Checks submitted responses if refresh
    if (response.data[0].team2_response && response.data[1].team1_response) {
      setCheckResponses(true);
    }
    if (response.data[user.team === 1 ? 1 : 0][`team${user.team}_response`]) {
      setCheckSubmitted(true);
    }
  };

  const getClues = async () => {
    const response = await axios.get(
      `/view/getclues?gid=${user.gid}&team=${user.team}&type=intercept`
    );
    setOppTeamClues(response.data.oppTeamClues);
  };

  return (
    <div>
      {checkResponses ? (
        <Navigate to={`/postround/${user.gid}`} replace={true} />
      ) : (
        <>
          <Header user={user} />
          <Scoreboard />
          <OppTeamClues clues={oppTeamClues} />
          <Clue
            type={"intercept"}
            clues={user.team === 1 ? clue.team2 : clue.team1}
            responder={
              user.team === 1
                ? players.team1[interceptor[0] - 1]
                : players.team2[interceptor[1] - 1]
            }
            round={round}
            checkSubmitted={checkSubmitted}
          />
          <ChatRoom />
        </>
      )}
    </div>
  );
}
