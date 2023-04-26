const { getDB } = require('../pg');

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false; // !important to reuse pool
  const client = await getDB().connect();

  const { user_id, username, values } = JSON.parse(event.body);

  const last_updated = new Date();

  try {
    const response = await client.query(
      'UPSERT INTO art_global (user_id, username, last_updated, values) VALUES($1, $2, $3, $4) RETURNING values',
      [user_id, username, last_updated, values]
    );

    if (!response.rows) {
      throw new Error();
    }

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: 'Art Global v1 - A Ok!',
        },
        null,
        2
      ),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error, null, 2),
    };
  } finally {
    client.release();
  }
};
