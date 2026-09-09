const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { withHandler, respond, parseBody, requireAuth, requirePathParam, enforceRateLimit } = require("../lib/http");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TRANSACTIONS_TABLE = process.env.TRANSACTIONS_TABLE;
const CERTIFICATES_TABLE = process.env.CERTIFICATES_TABLE;

const schema = {
  note: { type: "string", maxLength: 500 },
};

exports.handler = withHandler(async (event) => {
  const requesterId = requireAuth(event);
  const transactionId = requirePathParam(event, "transactionId");
  await enforceRateLimit(`issueCertificate#${requesterId}`, 20, 60);

  const { Item: booking } = await client.send(
    new GetCommand({ TableName: TRANSACTIONS_TABLE, Key: { transactionId } })
  );
  if (!booking) return respond(404, { error: "Booking not found" });

  if (booking.counterpartyId !== requesterId) {
    return respond(403, { error: "Only the teacher can issue a certificate for this session" });
  }

  const { note } = parseBody(event, schema);
  const certificate = {
    transactionId,
    learnerId: booking.userId,
    teacherId: requesterId,
    skillId: booking.skillId,
    note: note || null,
    issuedAt: new Date().toISOString(),
  };

  await client.send(new PutCommand({ TableName: CERTIFICATES_TABLE, Item: certificate }));

  return respond(200, { message: "Certificate issued", certificate });
});
