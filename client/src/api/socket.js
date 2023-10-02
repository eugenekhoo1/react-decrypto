import io from "socket.io-client";

const SOCKET_URL = "https://decrypto-backend.onrender.com";

export const gameSocket = io.connect(`${SOCKET_URL}/game`, { forceNew: true });
export const chatSocket = io.connect(`${SOCKET_URL}/chat`, { forceNew: true });
