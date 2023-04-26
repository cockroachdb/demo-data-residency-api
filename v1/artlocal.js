const { getDB } = require('../pg');

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false; // !important to reuse pool
  const client = await getDB().connect();

  const { user_id, username, region, values } = JSON.parse(event.body);

  const last_updated = new Date();

  try {
    const response = await client.query(
      'UPSERT INTO art_local (user_id, username, last_updated, region, values) VALUES($1, $2, $3, $4, $5) RETURNING values',
      [user_id, username, last_updated, `aws-${region}`, values]
    );

    if (!response.rows) {
      throw new Error();
    }

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: 'Art Local v1 - A Ok!',
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
