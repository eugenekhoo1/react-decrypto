import socket from "../api/socket";

const JoinRoom = async (gid) => {
  await socket.emit("join-room", { gid });
};

export default JoinRoom;
