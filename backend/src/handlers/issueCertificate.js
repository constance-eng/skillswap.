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
const CERTIFICATES_TABLE = process.env.CERTIFICATES_TABLE;

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
  },
  body: JSON.stringify(body),
});

const schema = {
  note: { type: "string", maxLength: 500 },
};

exports.handler = async (event) => {
  try {
    const requesterId = event.requestContext?.authorizer?.claims?.sub;
    if (!requesterId) return response(401, { error: "Unauthorized" });

    const transactionId = event.pathParameters?.transactionId;
    if (!transactionId) return response(400, { error: "transactionId is required" });

    const { allowed } = await checkRateLimit(`issueCertificate#${requesterId}`, 20, 60);
    if (!allowed) {
      return response(429, { error: "too many requests, slow down a bit" });
    }

    const txResult = await client.send(
      new GetCommand({ TableName: TRANSACTIONS_TABLE, Key: { transactionId } })
    );
    if (!txResult.Item) return response(404, { error: "Booking not found" });

    // only the teacher on this exact booking may certify it
    if (txResult.Item.counterpartyId !== requesterId) {
      return response(403, { error: "Only the teacher can issue a certificate for this session" });
    }

    const body = sanitize(JSON.parse(event.body || "{}"));
    const { valid, errors } = validate(body, schema);
    if (!valid) {
      return response(400, { error: "validation failed", details: errors });
    }

    const certificate = {
      transactionId,
      learnerId: txResult.Item.userId,
      teacherId: requesterId,
      skillId: txResult.Item.skillId,
      note: body.note || null,
      issuedAt: new Date().toISOString(),
    };

    await client.send(
      new PutCommand({ TableName: CERTIFICATES_TABLE, Item: certificate })
    );

    return response(200, { message: "Certificate issued", certificate });
  } catch (err) {
    console.error(err);
    return response(500, { error: "Internal server error" });
  }
};