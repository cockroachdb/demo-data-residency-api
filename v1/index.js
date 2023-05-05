const { headers } = require('../utils');
const geoip = require('fast-geoip');

module.exports.handler = async (event, context) => {
  const ip = event.requestContext.identity.sourceIp;
  const geo = await geoip.lookup(ip);

  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify({
      message: 'Index v1 - A Ok!',
      region: process.env.AWS_REGION,
      cockroach_region: `aws-${process.env.AWS_REGION}`,
      geo,
    }),
  };
};
