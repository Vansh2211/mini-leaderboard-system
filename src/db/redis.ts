import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();


const redis = createClient({ url: process.env.REDIS_URL || "redis://127.0.0.1:6379"});
redis.on("error", console.error);
redis.connect();


export default redis;