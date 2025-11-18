import { Server } from "socket.io";

let io;

export async function GET(req) {
  if (!io) {
    io = new Server(3001, {
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket) => {
      console.log("User connected", socket.id);

      // join specific chat room
      socket.on("join-room", (chatId) => {
        socket.join(chatId);
      });

      // message sending
      socket.on("send-message", (data) => {
        const { chatId, message } = data;

        // broadcast only to the chat room
        io.to(chatId).emit("receive-message", message);
      });
    });
  }

  return new Response("Socket server running");
}
