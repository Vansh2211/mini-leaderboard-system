import { Server } from "socket.io";


export default function setupSocket(io: Server) {
io.on("connection", (socket) => {
console.log("Socket connected", socket.id);


socket.on("disconnect", () => {
console.log("Socket disconnected", socket.id);
});
});
}