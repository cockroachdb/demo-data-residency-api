const { headers } = require('../utils');

module.exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify({
      message: 'Index v1 - A Ok!',
      region: process.env.AWS_REGION,
      cockroach_region: `aws-${process.env.AWS_REGION}`,
    }),
  };
};
