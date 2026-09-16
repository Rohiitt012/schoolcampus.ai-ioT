import { io, Socket } from "socket.io-client";
import { useSocket as useSocketContext } from "@/context/SocketContext";

let socketInstance: Socket | null = null;
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export const getSocket = (): Socket => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
  }
  return socketInstance;
};

export const useSocket = useSocketContext;
