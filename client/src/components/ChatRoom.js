import { useEffect, useState } from "react";
import axios from "../api/axios";
import useUser from "../hooks/useUser";
import { chatSocket } from "../api/socket";
import convertTime from "../utils/convertTime";
import ScrollToBottom from "react-scroll-to-bottom";
import "../styles/chatroom.css";

export default function ChatRoom({ disabledUsers }) {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getChatMessages();
  }, []);

  useEffect(() => {
    chatSocket.on("received-send-message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      chatSocket.off("received-send-message");
    };
  }, [chatSocket]);

  const getChatMessages = async () => {
    try {
      const response = await axios.get(
        `/chat/getmessages?gid=${user.gid}&team=${user.team}`
      );
      setMessages(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "/chat/sendmessage",
        JSON.stringify({
          text: message,
          gid: user.gid,
          team: user.team,
          player: user.player,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (err) {
      console.error(err);
    }
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        text: message,
        player: user.player,
        created_at: new Date(),
        game_id: user.gid,
      },
    ]);
    setMessage("");
    chatSocket.emit("send-message", {
      game_id: user.gid,
      team: user.team,
      player: user.player,
      text: message,
      created_at: new Date(),
    });
  };

  return (
    <>
      <div className="container p-2 border border-dark mt-5">
        <div className="col text-center border-bottom mb-1">Chat Room</div>
        <ScrollToBottom className="chat-box">
          {messages.map((message) => (
            <div
              className="row ms-1 me-1"
              key={`${message.created_at}-${message.text}`}
            >
              {user.player === message.player ? (
                <div className="col">
                  [{convertTime(message.created_at)}]{" "}
                  <span className="fw-bold text-success">You</span> {": "}{" "}
                  {message.text}
                </div>
              ) : (
                <div className="col">
                  [{convertTime(message.created_at)}]{" "}
                  <span className="fw-bold">{message.player}</span> {": "}{" "}
                  {message.text}
                </div>
              )}
            </div>
          ))}
        </ScrollToBottom>
        <div className="row">
          <div className="col">
            <form onSubmit={handleSendMessage}>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  id="message"
                  value={message}
                  placeholder="Enter message..."
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  autoComplete="off"
                  disabled={disabledUsers.includes(user.player) ? true : false}
                />
                <button
                  type="submit"
                  className="btn btn-outline-secondary"
                  disabled={disabledUsers.includes(user.player) ? true : false}
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
