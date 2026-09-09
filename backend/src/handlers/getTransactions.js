const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { withHandler, respond, requireAuth, enforceRateLimit } = require("../lib/http");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TRANSACTIONS_TABLE;

exports.handler = withHandler(async (event) => {
  const requesterId = requireAuth(event);
  await enforceRateLimit(`getTransactions#${requesterId}`, 30, 60);

  const { Items } = await client.send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "byUser",
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: { ":uid": requesterId },
      ScanIndexForward: false,
    })
  );

  return respond(200, { transactions: Items || [] });
});
