const { client } = require('../pg');
const warmer = require('lambda-warmer');

module.exports.handler = async (event, context) => {
  if (await warmer(event)) {
    console.log('------ [user.handler] warmed ------');
    return 'warmed';
  }

  const { user_id } = JSON.parse(event.body);

  try {
    await client.connect();

    const local_response = await client.query('SELECT * FROM art_local WHERE user_id = $1', [user_id]);
    const global_response = await client.query('SELECT * FROM art_global WHERE user_id = $1', [user_id]);

    await client.clean();

    if (!local_response.rows || !global_response.rows) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': '*',
        },
        body: JSON.stringify({ message: 'User v1 Error' }),
        isBase64Encoded: FALSE,
      };
    }

    const local = local_response.rows.reduce(
      (items, item) => {
        const { super_region, values } = item;

        items[super_region] = items[super_region] || {};

        items[super_region] = {
          ...values,
        };

        return items;
      },
      { us: null, eu: null }
    );

    const global = global_response.rows.reduce((items, item) => {
      const { values } = item;
      items.global = items.global || [];

      items.global = {
        ...values,
      };

      return items;
    }, {});

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
      },
      body: JSON.stringify({
        message: 'User v1 - A Ok!',
        data: { local, ...global },
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
      body: JSON.stringify({ message: 'User v1 Error', error }),
    };
  }
};
