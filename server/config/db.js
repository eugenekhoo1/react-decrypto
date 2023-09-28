const Pool = require("pg").Pool;
require("dotenv").config();

const pool = new Pool({
  user: process.env.POSTGRES_USER || "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DATABASE || "decrypto",
});

module.exports = {
  async query(text, params, callback) {
    return pool.query(text, params, callback);
  },
};
