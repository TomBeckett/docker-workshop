const { Pool } = require("pg");

const pool = new Pool({
  host: "db",
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

module.exports = pool;
