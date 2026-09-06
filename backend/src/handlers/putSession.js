const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");
const { validate, sanitize } = require("../lib/validate");
const { checkRateLimit } = require("../lib/rateLimit");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TRANSACTIONS_TABLE = process.env.TRANSACTIONS_TABLE;
const SESSIONS_TABLE = process.env.SESSIONS_TABLE;

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
  },
  body: JSON.stringify(body),
});

const URL_PATTERN = /^https?:\/\/.+/;

const schema = {
  format: { type: "string", required: true, minLength: 1, maxLength: 20 },
  sessionLink: { type: "string", maxLength: 500, pattern: URL_PATTERN },
  location: { type: "string", maxLength: 200 },
  suggestedDateTime: { type: "string", maxLength: 40 },
  note: { type: "string", maxLength: 500 },
};

exports.handler = async (event) => {
  try {
    const requesterId = event.requestContext?.authorizer?.claims?.sub;
    if (!requesterId) return response(401, { error: "Unauthorized" });

    const transactionId = event.pathParameters?.transactionId;
    if (!transactionId) return response(400, { error: "transactionId is required" });

    const { allowed } = await checkRateLimit(`putSession#${requesterId}`, 20, 60);
    if (!allowed) {
      return response(429, { error: "too many requests, slow down a bit" });
    }

    const txResult = await client.send(
      new GetCommand({ TableName: TRANSACTIONS_TABLE, Key: { transactionId } })
    );
    if (!txResult.Item) return response(404, { error: "Booking not found" });

    // only the teacher on this exact booking may set its session details
    if (txResult.Item.counterpartyId !== requesterId) {
      return response(403, { error: "Only the teacher can set session details" });
    }

    const body = sanitize(JSON.parse(event.body || "{}"));
    const { valid, errors } = validate(body, schema);
    if (!valid) {
      return response(400, { error: "validation failed", details: errors });
    }
    if (!["online", "in-person"].includes(body.format)) {
      return response(400, { error: "format must be 'online' or 'in-person'" });
    }

    const now = new Date().toISOString();
    const session = {
      transactionId,
      teacherId: requesterId,
      learnerId: txResult.Item.userId,
      skillId: txResult.Item.skillId,
      format: body.format,
      sessionLink: body.sessionLink || null,
      location: body.location || null,
      suggestedDateTime: body.suggestedDateTime || null,
      note: body.note || null,
      updatedAt: now,
    };

    await client.send(
      new PutCommand({
        TableName: SESSIONS_TABLE,
        Item: { ...session, createdAt: now },
      })
    );

    return response(200, { message: "Session details saved", session });
  } catch (err) {
    console.error(err);
    return response(500, { error: "Internal server error" });
  }
};