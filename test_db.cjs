const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres" });
pool.query('SELECT * FROM products', (err, res) => {
  if (err) console.error(err);
  else console.log(res.rows);
  pool.end();
});
