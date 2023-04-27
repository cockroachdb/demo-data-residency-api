const { client } = require('../pg');

module.exports.handler = async (event, context) => {
  const { user_id, username, region, values } = JSON.parse(event.body);
  const last_updated = new Date();

  await client.connect();

  const response = await client.query(
    'UPSERT INTO art_local (user_id, username, last_updated, region, values) VALUES($1, $2, $3, $4, $5) RETURNING values',
    [user_id, username, last_updated, `aws-${region}`, values]
  );

  await client.clean();

  if (!response.rows) {
    return {
      statusCode: 404,
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Art Local v1 - A Ok!',
    }),
  };
};
