const { fromProvider } = require('cloud-regions-country-flags');

const { headers } = require('../utils');

module.exports.handler = async () => {
  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify({
      message: 'A Ok!',
      statusCode: 200,
      region: process.env.AWS_REGION,
      cockroach_region: `aws-${process.env.AWS_REGION}`,
      region_info: fromProvider(process.env.AWS_REGION, 'AWS'),
    }),
  };
};
