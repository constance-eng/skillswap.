const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { checkRateLimit } = require("../lib/rateLimit");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TRANSACTIONS_TABLE;

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

    const { allowed } = await checkRateLimit(`getTeachingBookings#${requesterId}`, 30, 60);
    if (!allowed) {
      return response(429, { error: "too many requests, slow down a bit" });
    }

    const result = await client.send(
      new QueryCommand({
        TableName: TABLE,
        IndexName: "byCounterparty",
        KeyConditionExpression: "counterpartyId = :cid",
        ExpressionAttributeValues: { ":cid": requesterId },
        ScanIndexForward: false,
      })
    );

    return response(200, { bookings: result.Items || [] });
  } catch (err) {
    console.error(err);
    return response(500, { error: "Internal server error" });
  }
};