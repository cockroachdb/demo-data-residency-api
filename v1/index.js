module.exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Index v1 - A Ok!',
        region: process.env.AWS_REGION,
        cockroach_region: `aws-${process.env.AWS_REGION}`,
      },
      null,
      2
    ),
  };
};
