const { client } = require('../pg');
const { headers } = require('../utils');
const warmer = require('lambda-warmer');

module.exports.handler = async (event, context) => {
  if (await warmer(event)) {
    console.log('artlocal warmed');
    return 'warmed';
  }

  const { user_id, username, region, values } = JSON.parse(event.body);
  const last_updated = new Date();

  try {
    await client.connect();

    const response = await client.query(
      'UPSERT INTO art_local (user_id, username, last_updated, region, values) VALUES($1, $2, $3, $4, $5) RETURNING values',
      [user_id, username, last_updated, `aws-${region}`, values]
    );

    await client.clean();

    if (!response.rows) {
      return {
        statusCode: 404,
        headers: headers,
        body: JSON.stringify({ message: 'Art Local v1 Error' }),
      };
    }

    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({
        message: 'Art Local v1 - A Ok!',
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ message: 'Art Local v1 Error', error }),
    };
  }
};
