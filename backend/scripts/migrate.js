// scripts/migrate.js
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname,'../sql/schema.sql'), 'utf8');

    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    });

    await conn.query(sql);
    console.log('MIGRATION: tables created/verified');
    await conn.end();
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
})();
