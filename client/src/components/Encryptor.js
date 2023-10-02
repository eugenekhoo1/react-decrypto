import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { gameSocket } from "../api/socket";
import useUser from "../hooks/useUser";

export default function Encryptor({ code, words, round, checkSubmitted }) {
  const navigate = useNavigate();
  const { user } = useUser();
  const [one, setOne] = useState("");
  const [two, setTwo] = useState("");
  const [three, setThree] = useState("");
  const [clue, setClue] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setClue({ [code[0]]: one, [code[1]]: two, [code[2]]: three });
  }, [one, two, three]);

  useEffect(() => {
    gameSocket.on("received-clues", () => {
      navigate(`/decode/${user.gid}`);
    });
  }, [gameSocket]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `/game/postclue`,
        JSON.stringify({ clue, gid: user.gid, round, team: user.team }),
        { headers: { "Content-Type": "application/json" } }
      );
      setSubmitted(true);
      gameSocket.emit("clue-submitted", { gid: user.gid, team: user.team });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mt-5">
      <form onSubmit={handleSubmit}>
        <div className="row mt-2">
          <div className="col-12">
            <span>{words[code[0] - 1]}: </span>
            <input
              type="text"
              id="one"
              autoComplete="off"
              required
              onChange={(e) => setOne(e.target.value)}
              disabled={submitted || checkSubmitted}
            />
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-12">
            <span>{words[code[1] - 1]}: </span>
            <input
              type="text"
              id="two"
              autoComplete="off"
              required
              onChange={(e) => setTwo(e.target.value)}
              disabled={submitted || checkSubmitted}
            />
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-12">
            <span>{words[code[2] - 1]}: </span>
            <input
              type="text"
              id="three"
              autoComplete="off"
              required
              onChange={(e) => setThree(e.target.value)}
              disabled={submitted || checkSubmitted}
            />
          </div>
        </div>

        <div className="row mt-2">
          <div className="col-6">
            <button type="submit" disabled={submitted || checkSubmitted}>
              Submit Clue
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
