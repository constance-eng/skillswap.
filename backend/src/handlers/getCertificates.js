const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { withHandler, respond, requireAuth, enforceRateLimit } = require("../lib/http");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const CERTIFICATES_TABLE = process.env.CERTIFICATES_TABLE;

exports.handler = withHandler(async (event) => {
  const requesterId = requireAuth(event);
  await enforceRateLimit(`getCertificates#${requesterId}`, 30, 60);

  const { Items } = await client.send(
    new QueryCommand({
      TableName: CERTIFICATES_TABLE,
      IndexName: "byLearner",
      KeyConditionExpression: "learnerId = :lid",
      ExpressionAttributeValues: { ":lid": requesterId },
      ScanIndexForward: false,
    })
  );

  return respond(200, { certificates: Items || [] });
});
