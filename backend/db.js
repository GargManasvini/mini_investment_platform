const mysql = require("mysql2");

// Detect environment: if running inside Docker, DB_HOST=mysql_db will work
const host = process.env.DB_HOST || "localhost";

// Create MySQL pool
const pool = mysql.createPool({
  host,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password", // ✅ FIXED
  database: process.env.DB_NAME || "gripInvest",
  port: process.env.DB_PORT || 3306
}).promise();

module.exports = pool;
