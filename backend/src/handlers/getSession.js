const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { withHandler, respond, requireAuth, requirePathParam, enforceRateLimit } = require("../lib/http");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const SESSIONS_TABLE = process.env.SESSIONS_TABLE;

exports.handler = withHandler(async (event) => {
  const requesterId = requireAuth(event);
  const transactionId = requirePathParam(event, "transactionId");
  await enforceRateLimit(`getSession#${requesterId}`, 60, 60);

  const { Item } = await client.send(new GetCommand({ TableName: SESSIONS_TABLE, Key: { transactionId } }));
  if (!Item) return respond(404, { error: "No session details yet" });

  const isParticipant = Item.teacherId === requesterId || Item.learnerId === requesterId;
  if (!isParticipant) return respond(403, { error: "You are not part of this session" });

  return respond(200, { session: Item });
});
