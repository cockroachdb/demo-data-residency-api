const { Pool } = require('pg');

let pool;

const getDB = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!pool) {
    pool = new Pool({
      connectionString,
      max: 1,
    });
  }

  return pool;
};

module.exports = {
  getDB,
};
