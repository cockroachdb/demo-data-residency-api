const { getDB } = require('../pg');

module.exports.handler = async (event) => {
  const client = await getDB().connect();

  const { user_id } = JSON.parse(event.body);

  try {
    const local_response = await client.query('SELECT * FROM art_local WHERE user_id = $1', [user_id]);
    const global_response = await client.query('SELECT * FROM art_global WHERE user_id = $1', [user_id]);

    if (!local_response.rows || !global_response.rows) {
      throw new Error('Bad Response');
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
      body: JSON.stringify(
        {
          message: 'User v1 - A Ok!',
          data: { local, ...global },
        },
        null,
        2
      ),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          message: 'User - Error!',
          region: process.env.AWS_REGION,
          cockroach_region: `aws-${process.env.AWS_REGION}`,
          error: error.message,
        },
        null,
        2
      ),
    };
  } finally {
    client.release();
  }
};
