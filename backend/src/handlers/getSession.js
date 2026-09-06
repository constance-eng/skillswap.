const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { checkRateLimit } = require("../lib/rateLimit");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const SESSIONS_TABLE = process.env.SESSIONS_TABLE;

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
  },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  try {
    const requesterId = event.requestContext?.authorizer?.claims?.sub;
    if (!requesterId) return response(401, { error: "Unauthorized" });

    const transactionId = event.pathParameters?.transactionId;
    if (!transactionId) return response(400, { error: "transactionId is required" });

    const { allowed } = await checkRateLimit(`getSession#${requesterId}`, 60, 60);
    if (!allowed) {
      return response(429, { error: "too many requests, slow down a bit" });
    }

    const result = await client.send(
      new GetCommand({ TableName: SESSIONS_TABLE, Key: { transactionId } })
    );

    if (!result.Item) {
      return response(404, { error: "No session details yet" });
    }

    const isParticipant =
      result.Item.teacherId === requesterId || result.Item.learnerId === requesterId;
    if (!isParticipant) {
      return response(403, { error: "You are not part of this session" });
    }

    return response(200, { session: result.Item });
  } catch (err) {
    console.error(err);
    return response(500, { error: "Internal server error" });
  }
};