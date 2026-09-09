const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { withHandler, respond, parseBody, requireAuth, requirePathParam, enforceRateLimit, HttpError } = require("../lib/http");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TRANSACTIONS_TABLE = process.env.TRANSACTIONS_TABLE;
const SESSIONS_TABLE = process.env.SESSIONS_TABLE;

const URL_PATTERN = /^https?:\/\/.+/;

const schema = {
  format: { type: "string", required: true, minLength: 1, maxLength: 20 },
  sessionLink: { type: "string", maxLength: 500, pattern: URL_PATTERN },
  location: { type: "string", maxLength: 200 },
  suggestedDateTime: { type: "string", maxLength: 40 },
  note: { type: "string", maxLength: 500 },
};

exports.handler = withHandler(async (event) => {
  const requesterId = requireAuth(event);
  const transactionId = requirePathParam(event, "transactionId");
  await enforceRateLimit(`putSession#${requesterId}`, 20, 60);

  const { Item: booking } = await client.send(
    new GetCommand({ TableName: TRANSACTIONS_TABLE, Key: { transactionId } })
  );
  if (!booking) return respond(404, { error: "Booking not found" });

  // only the teacher on this exact booking may set its session details
  if (booking.counterpartyId !== requesterId) {
    return respond(403, { error: "Only the teacher can set session details" });
  }

  const body = parseBody(event, schema);
  if (!["online", "in-person"].includes(body.format)) {
    throw new HttpError(400, "format must be 'online' or 'in-person'");
  }

  const now = new Date().toISOString();
  const session = {
    transactionId,
    teacherId: requesterId,
    learnerId: booking.userId,
    skillId: booking.skillId,
    format: body.format,
    sessionLink: body.sessionLink || null,
    location: body.location || null,
    suggestedDateTime: body.suggestedDateTime || null,
    note: body.note || null,
    updatedAt: now,
  };

  await client.send(new PutCommand({ TableName: SESSIONS_TABLE, Item: { ...session, createdAt: now } }));

  return respond(200, { message: "Session details saved", session });
});
