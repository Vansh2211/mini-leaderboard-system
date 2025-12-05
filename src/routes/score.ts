import { Router } from "express";
import pool from "../db/mysql.js";
import redis from "../db/redis.js";


const router = Router();
const LB_KEY = process.env.LEADERBOARD_KEY || "leaderboard";


interface ScorePayload {
userId: string;
value: number;
}


router.post("/", async (req, res) => {
const { userId, value } = req.body as ScorePayload;
if (!userId || typeof value !== "number") return res.status(400).json({ error: "Invalid payload" });


try {
// 1. DB Update
await pool.query(
`INSERT INTO scores (userId, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?`,
[userId, value, value]
);


// 2. Redis Update
await redis.zAdd(LB_KEY, [{ score: value, value: userId }]);


const ttl = Number(process.env.LEADERBOARD_TTL || 60);
if (ttl > 0) await redis.expire(LB_KEY, ttl);


// 3. Rank
const rank = await redis.zRevRank(LB_KEY, userId);
const finalRank = rank !== null ? rank + 1 : null;


// 4. Emit socket
const io = req.app.get("io");
io.emit("score_updated", { userId, score: value, rank: finalRank });


res.json({ ok: true, userId, score: value, rank: finalRank });
} catch (err) {
console.error(err);
res.status(500).json({ error: "Internal error" });
}
});


export default router;