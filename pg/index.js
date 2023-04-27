const ServerlessClient = require('serverless-postgres');

const connectionString = process.env.DATABASE_URL;

const client = new ServerlessClient({ connectionString, debug: true });

module.exports = {
  client,
};
