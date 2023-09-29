import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUser from "../hooks/useUser";
import axios from "../api/axios";
import socket from "../api/socket";

export default function Clue({
  type,
  clues,
  responder,
  round,
  checkSubmitted,
}) {
  const { user } = useUser();
  const navigate = useNavigate();
  const [clue1, setClue1] = useState("");
  const [clue2, setClue2] = useState("");
  const [clue3, setClue3] = useState("");
  const [response, setResponse] = useState({});
  const [responseSubmitted, setResponseSubmitted] = useState(false);

  useEffect(() => {
    setResponse({
      [clue1]: Object.values(clues)[0],
      [clue2]: Object.values(clues)[1],
      [clue3]: Object.values(clues)[2],
    });
  }, [clue1, clue2, clue3]);

  useEffect(() => {
    socket.on("received-intercept", () => {
      navigate(`/postround/${user.gid}`);
    });
  }, [socket]);

  useEffect(() => {
    socket.on("received-decode", () => {
      navigate(`/intercept/${user.gid}`);
    });
  }, [socket]);

  useEffect(() => {
    socket.on("received-end-game", () => {
      navigate(`/postgame/${user.gid}`);
    });
  }, [socket]);

  const handleResponse = async (e) => {
    e.preventDefault();

    // Check unique integers
    if (new Set([clue1, clue2, clue3]).size !== 3) {
      alert("Please ensure all responses are unique!");
      return;
    }

    try {
      const url =
        type === "decode" ? "/game/postdecode" : "/game/postintercept";
      const event =
        type === "decode" ? "decode-submitted" : "intercept-submitted";
      const submitResponse = await axios.post(
        url,
        JSON.stringify({
          ...(type === "decode"
            ? { decode: response }
            : { intercept: response }),
          team: user.team,
          round,
          gid: user.gid,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
      setResponseSubmitted(true);
      alert(submitResponse.data.message);
      socket.emit(event, {
        gid: user.gid,
        team: user.team,
        score: submitResponse.data.score,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <form onSubmit={handleResponse}>
        <div className="row">
          <div className="col">
            <span>
              {user?.player === responder ? "You are" : responder + " is"}
            </span>{" "}
            {type === "decode" ? "decoding..." : "intercepting..."}
          </div>
        </div>
        <div className="row mt-2">
          <div className="col">
            {Object.values(clues)[0]}{" "}
            <input
              type="number"
              id="clue1"
              min="1"
              max="4"
              step="1"
              autoComplete="off"
              required
              onChange={(e) => setClue1(e.target.value)}
              disabled={
                (user.player === responder ? false : true) ||
                responseSubmitted ||
                checkSubmitted
              }
              style={{ width: "3em" }}
            />
          </div>
        </div>
        <div className="row mt-2">
          <div className="col">
            {Object.values(clues)[1]}{" "}
            <input
              type="number"
              id="clue2"
              min="1"
              max="4"
              step="1"
              autoComplete="off"
              required
              onChange={(e) => setClue2(e.target.value)}
              disabled={
                (user.player === responder ? false : true) ||
                responseSubmitted ||
                checkSubmitted
              }
              style={{ width: "3em" }}
            />
          </div>
        </div>
        <div className="row mt-2">
          <div className="col">
            {Object.values(clues)[2]}{" "}
            <input
              type="number"
              id="clue3"
              min="1"
              max="4"
              step="1"
              autoComplete="off"
              required
              onChange={(e) => setClue3(e.target.value)}
              disabled={
                (user.player === responder ? false : true) ||
                responseSubmitted ||
                checkSubmitted
              }
              style={{ width: "3em" }}
            />
          </div>
        </div>
        <div className="row mt-2">
          <div className="col">
            <button
              type="submit"
              disabled={
                (user.player === responder ? false : true) ||
                responseSubmitted ||
                checkSubmitted
              }
            >
              Submit
            </button>
          </div>
        </div>
      </form>
      <br />
    </div>
  );
}
