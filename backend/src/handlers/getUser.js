const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { withHandler, respond, requireAuth, enforceRateLimit } = require("../lib/http");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.USERS_TABLE;

exports.handler = withHandler(async (event) => {
  const requesterId = requireAuth(event);
  await enforceRateLimit(`getUser#${requesterId}`, 60, 60);

  const { Item } = await client.send(new GetCommand({ TableName: TABLE, Key: { userId: requesterId } }));
  if (!Item) return respond(404, { error: "User not found" });

  return respond(200, { user: Item });
});
