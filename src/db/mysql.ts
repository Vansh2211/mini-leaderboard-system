import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();


export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "127.0.0.1",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASS || "",
  database: process.env.MYSQL_DB || "leaderboard",
  connectionLimit: 10,
});


export default pool;