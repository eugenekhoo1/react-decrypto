import { gameSocket } from "../api/socket";

const joinGameRoom = async (gid) => {
  await gameSocket.emit("join-room", { gid });
};

export default joinGameRoom;
