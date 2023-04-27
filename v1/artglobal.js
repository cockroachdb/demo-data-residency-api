const { client } = require('../pg');

module.exports.handler = async (event, context) => {
  const { user_id, username, values } = JSON.parse(event.body);
  const last_updated = new Date();

  try {
    await client.connect();
    const response = await client.query(
      'UPSERT INTO art_global (user_id, username, last_updated, values) VALUES($1, $2, $3, $4) RETURNING values',
      [user_id, username, last_updated, values]
    );

    console.log('artglobal - response: ', response);

    await client.clean();

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
  }
};
