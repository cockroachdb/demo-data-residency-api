module.exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
    },
    body: JSON.stringify({
      message: 'Index v1 - A Ok!',
      region: process.env.AWS_REGION,
      cockroach_region: `aws-${process.env.AWS_REGION}`,
    }),
  };
};
