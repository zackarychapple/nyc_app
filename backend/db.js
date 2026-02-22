const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.LAKEBASE_HOST,
  port: parseInt(process.env.LAKEBASE_PORT || '5432', 10),
  database: process.env.LAKEBASE_DB || 'nyc_demo',
  user: process.env.LAKEBASE_USER,
  password: process.env.LAKEBASE_PASSWORD,
  ssl: process.env.LAKEBASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected pool error:', err);
});

module.exports = pool;
