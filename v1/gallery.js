const { client } = require('../pg');

module.exports.handler = async (event, context) => {
  const region = `aws-${process.env.AWS_REGION}`;

  try {
    await client.connect();

    const response = await client.query(
      'SELECT l.user_id, l.username, l.region, l.last_updated AS local_last_update, l.values AS local_values, g.last_updated AS global_last_update, g.values AS global_values FROM art_local l LEFT JOIN art_global g ON l.user_id = g.user_id WHERE region = $1',
      [region]
    );

    await client.clean();

    if (!response.rows) {
      throw new Error();
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
      body: JSON.stringify(
        {
          message: 'Gallery v1 - A Ok!',
          region: process.env.AWS_REGION,
          cockroach_region: `aws-${process.env.AWS_REGION}`,
          data: newResponse,
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
