const { client } = require('../pg');

module.exports.handler = async (event, context) => {
  const { user_id } = JSON.parse(event.body);
  const region = `aws-${process.env.AWS_REGION}`;

  console.log('start request: ', new Date());

  try {
    await client.connect();

    const response = await client.query(
      'SELECT l.user_id, l.username, l.region, l.last_updated AS local_last_update, l.values AS local_values, g.last_updated AS global_last_update, g.values AS global_values FROM art_local l LEFT JOIN art_global g ON l.user_id = g.user_id WHERE l.user_id = $1 AND region = $2',
      [user_id, region]
    );

    await client.clean();

    if (!response.rows) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': '*',
        },
        body: JSON.stringify({ message: 'Art User v1 Error' }),
      };
    }

    const newResponse = response.rows.map((data) => {
      const { user_id, username, local_last_update, local_values, global_values } = data;

      return {
        user_id,
        username,
        local_last_update: new Date(local_last_update).toLocaleString('default', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
        local_values,
        global_values,
      };
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
      },
      body: JSON.stringify({
        message: 'Art User v1 - A Ok!',
        region: process.env.AWS_REGION,
        cockroach_region: `aws-${process.env.AWS_REGION}`,
        data: newResponse,
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
      body: JSON.stringify({ message: 'Art User v1 Error', error }),
    };
  }
};
