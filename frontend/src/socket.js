import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
  if (socket) return socket;
  const token = localStorage.getItem("token");
  socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
    auth: { token }
  });
  return socket;
};

export const resetSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
