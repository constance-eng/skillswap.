const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { withHandler, respond, requirePathParam, sourceIp, enforceRateLimit } = require("../lib/http");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.USERS_TABLE;

exports.handler = withHandler(async (event) => {
  const targetUserId = requirePathParam(event, "userId");
  await enforceRateLimit(`getUserPublic#${sourceIp(event)}`, 60, 60);

  const { Item } = await client.send(new GetCommand({ TableName: TABLE, Key: { userId: targetUserId } }));
  if (!Item) return respond(404, { error: "User not found" });

  const publicProfile = { userId: Item.userId, name: Item.name, averageRating: Item.averageRating ?? null };
  return respond(200, { user: publicProfile });
});
