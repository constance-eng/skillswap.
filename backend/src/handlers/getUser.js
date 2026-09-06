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
    const requesterId = event.requestContext?.authorizer?.claims?.sub;
    if (!requesterId) return response(401, { error: "Unauthorized" });

    const { allowed } = await checkRateLimit(`getUser#${requesterId}`, 60, 60);
    if (!allowed) {
      return response(429, { error: "too many requests, slow down a bit" });
    }

    const result = await client.send(
      new GetCommand({ TableName: TABLE, Key: { userId: requesterId } })
    );

    if (!result.Item) {
      return response(404, { error: "User not found" });
    }

    return response(200, { user: result.Item });
  } catch (err) {
    console.error(err);
    return response(500, { error: "Internal server error" });
  }
};