import { chatSocket } from "../api/socket";

const joinChatRoom = async (gid, team) => {
  await chatSocket.emit("join-room", { game_id: gid, team });
};

export default joinChatRoom;
