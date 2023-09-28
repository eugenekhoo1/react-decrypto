import { useState, useEffect } from "react";
import axios from "../api/axios";
import useUser from "../hooks/useUser";

export default function Scoreboard() {
  const { user } = useUser();
  const [team1Scores, setTeam1Scores] = useState({
    miscommunications: 0,
    interceptions: 0,
  });
  const [team2Scores, setTeam2Scores] = useState({
    miscommunications: 0,
    interceptions: 0,
  });

  useEffect(() => {
    getGameInfo();
  }, []);

  const getGameInfo = async () => {
    const response = await axios.get(`/game/getgame/${user.gid}`);
    setTeam1Scores({
      miscommunications: response.data[0].team1_miscommunications,
      interceptions: response.data[0].team1_interceptions,
    });
    setTeam2Scores({
      miscommunications: response.data[0].team2_miscommunications,
      interceptions: response.data[0].team2_interceptions,
    });
  };

  return (
    <div className="container">
      <div className="row mt-3">
        <div
          className="col text-center"
          style={{ fontWeight: 600, textDecoration: "underline" }}
        >
          Team 1
        </div>
      </div>
      <div className="row">
        <div className="col text-center">
          Miscommunications: {team1Scores.miscommunications}
        </div>
      </div>
      <div className="row">
        <div className="col text-center">
          Interceptions: {team1Scores.interceptions}
        </div>
      </div>

      <div className="row mt-3">
        <div
          className="col text-center"
          style={{ fontWeight: 600, textDecoration: "underline" }}
        >
          Team 2
        </div>
      </div>
      <div className="row">
        <div className="col text-center">
          Miscommunications: {team2Scores.miscommunications}
        </div>
      </div>
      <div className="row">
        <div className="col text-center">
          Interceptions: {team2Scores.interceptions}
        </div>
      </div>
    </div>
  );
}
