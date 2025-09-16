require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Allow multiple statements for running the whole schema file at once
  multipleStatements: true, 
  // Add a connection timeout
  connectionLimit: 10,
  connectTimeout: 20000, 
});

const migrate = async () => {
  console.log('Attempting to connect to the database...');
  let connection;

  // Retry connection to give the DB time to start
  for (let i = 0; i < 15; i++) {
    try {
      connection = await pool.getConnection();
      console.log('Database connection successful!');
      break;
    } catch (err) {
      console.log(`Connection attempt ${i + 1} failed. Retrying in 5 seconds...`);
      await new Promise(res => setTimeout(res, 5000));
    }
  }

  if (!connection) {
    console.error('Could not establish database connection after multiple retries. Exiting.');
    process.exit(1);
  }

  try {
    // --- 1. Run the schema script ---
    console.log('Running schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, '..', 'sql', 'schema.sql'), 'utf8');
    await connection.query(schemaSql);
    console.log('Schema created successfully.');

    // --- 2. Run the seed script ---
    console.log('Running seed_products.sql...');
    const seedSql = fs.readFileSync(path.join(__dirname, '..', 'sql', 'seed_products.sql'), 'utf8');
    await connection.query(seedSql);
    console.log('Product data seeded successfully.');

  } catch (err) {
    console.error('Error during migration or seeding:', err);
    process.exit(1);
  } finally {
    if (connection) connection.release();
    pool.end();
    console.log('Migration process finished.');
  }
};

migrate();