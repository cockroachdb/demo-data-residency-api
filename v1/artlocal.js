const { client } = require('../pg');
const warmer = require('lambda-warmer');

module.exports.handler = async (event, context) => {
  if (await warmer(event)) {
    console.log('------ [artlocal.handler] warmed ------');
    return 'warmed';
  }

  const { user_id, username, region, values } = JSON.parse(event.body);
  const last_updated = new Date();

  try {
    const db_start = performance.now();
    await client.connect();

    const response = await client.query(
      'UPSERT INTO art_local (user_id, username, last_updated, region, values) VALUES($1, $2, $3, $4, $5) RETURNING values',
      [user_id, username, last_updated, `aws-${region}`, values]
    );

    await client.clean();

    const db_end = performance.now();

    if (!response.rows) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': '*',
        },
        body: JSON.stringify({ message: 'Art Local v1 Error' }),
        isBase64Encoded: FALSE,
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
      },
      body: JSON.stringify({
        message: 'Art Local v1 - A Ok!',
        metrics: {
          db_start,
          db_end,
          db_total: db_end - db_start,
        },
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
      },
      body: JSON.stringify({ message: 'Art Local v1 Error', error }),
    };
  }
};
