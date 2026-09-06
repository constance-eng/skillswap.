const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { checkRateLimit } = require("../lib/rateLimit");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.USERS_TABLE;

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
    const targetUserId = event.pathParameters?.userId;
    if (!targetUserId) return response(400, { error: "userId is required" });

    const sourceIp = event.requestContext?.identity?.sourceIp || "unknown";
    const { allowed } = await checkRateLimit(`getUserPublic#${sourceIp}`, 60, 60);
    if (!allowed) {
      return response(429, { error: "too many requests, slow down a bit" });
    }

    const result = await client.send(
      new GetCommand({ TableName: TABLE, Key: { userId: targetUserId } })
    );

    if (!result.Item) {
      return response(404, { error: "User not found" });
    }

    // deliberately only expose fields that are safe for anyone to see
    const publicProfile = {
      userId: result.Item.userId,
      name: result.Item.name,
      averageRating: result.Item.averageRating ?? null,
    };

    return response(200, { user: publicProfile });
  } catch (err) {
    console.error(err);
    return response(500, { error: "Internal server error" });
  }
};