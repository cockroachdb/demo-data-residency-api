const { client } = require('../pg');

module.exports.handler = async (event, context) => {
  const { user_id } = JSON.parse(event.body);

  console.log('start request: ', new Date());

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
