import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import scoreRoutes from "./src/routes/score";
import leaderboardRoutes from "./src/routes/leaderboard";
import setupSocket from "./src/socket";


dotenv.config();


const app = express();
app.use(express.json());


const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
setupSocket(io);


app.set("io", io);


app.use("/score", scoreRoutes);
app.use("/leaderboard", leaderboardRoutes);


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));