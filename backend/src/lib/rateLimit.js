const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.RATE_LIMITS_TABLE;

// fixed-window limiter: "key" gets `limit` requests per `windowSeconds`, then blocks
async function checkRateLimit(key, limit, windowSeconds) {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - (now % windowSeconds);
  const rateLimitKey = `${key}#${windowStart}`;
  const expiresAt = windowStart + windowSeconds * 2;

  try {
    const result = await client.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { rateLimitKey },
        UpdateExpression: "SET requestCount = if_not_exists(requestCount, :zero) + :one, expiresAt = :ttl",
        ConditionExpression: "attribute_not_exists(requestCount) OR requestCount < :limit",
        ExpressionAttributeValues: { ":zero": 0, ":one": 1, ":limit": limit, ":ttl": expiresAt },
        ReturnValues: "UPDATED_NEW",
      })
    );
    return { allowed: true, remaining: limit - result.Attributes.requestCount };
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      return { allowed: false, remaining: 0 };
    }
    throw err;
  }
}

module.exports = { checkRateLimit };
