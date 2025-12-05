import { Router } from "express";
import pool from "../db/mysql.js";
import redis from "../db/redis.js";


const router = Router();
const LB_KEY = process.env.LEADERBOARD_KEY || "leaderboard";
const SIZE = Number(process.env.LEADERBOARD_SIZE || 100);


router.get("/", async (req, res) => {
try {
// Try from Redis
const cached = await redis.zRangeWithScores(LB_KEY, 0, SIZE - 1, { REV: true });
if (cached.length > 0) {
return res.json({ source: "redis", leaderboard: cached.map((e, i) => ({ rank: i + 1, userId: e.value, score: e.score })) });
}


// Load from DB
const [rows]: any = await pool.query(`SELECT userId, value FROM scores ORDER BY value DESC LIMIT ?`, [SIZE]);


// Push to Redis
if (rows.length > 0) {
const pipeline = redis.multi();
rows.forEach((r: any) => pipeline.zAdd(LB_KEY, [{ score: r.value, value: r.userId }]));
pipeline.expire(LB_KEY, Number(process.env.LEADERBOARD_TTL || 60));
await pipeline.exec();
}


res.json({ source: "db", leaderboard: rows.map((r: any, i: number) => ({ rank: i + 1, userId: r.userId, score: r.value })) });
} catch (err) {
console.error(err);
res.status(500).json({ error: "Internal error" });
}
});


export default router;