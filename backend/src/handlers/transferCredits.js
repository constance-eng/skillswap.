const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, TransactWriteCommand } = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");
const { withHandler, respond, parseBody, requireAuth, enforceRateLimit, HttpError } = require("../lib/http");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const USERS_TABLE = process.env.USERS_TABLE;
const TRANSACTIONS_TABLE = process.env.TRANSACTIONS_TABLE;
const TEACHER_CUT = Number(process.env.TEACHER_CUT || 8);
const PLATFORM_USER_ID = "PLATFORM";

const schema = {
  teacherId: { type: "string", required: true, minLength: 1, maxLength: 100 },
  amount: { type: "number", required: true, min: 1, max: 1000 },
  skillId: { type: "string", maxLength: 100 },
};

exports.handler = withHandler(async (event) => {
  const learnerId = requireAuth(event);
  await enforceRateLimit(`transfer#${learnerId}`, 5, 60, "too many transfers, try again in a minute");

  const { teacherId, amount, skillId } = parseBody(event, schema);
  if (learnerId === teacherId) throw new HttpError(400, "Cannot transfer credits to yourself");

  const teacherShare = Math.min(amount, TEACHER_CUT);
  const platformShare = amount - teacherShare;
  const transactionId = randomUUID();
  const createdAt = new Date().toISOString();

  await client.send(
    new TransactWriteCommand({
      TransactItems: [
        {
          Update: {
            TableName: USERS_TABLE,
            Key: { userId: learnerId },
            UpdateExpression: "SET creditBalance = creditBalance - :amt",
            ConditionExpression: "creditBalance >= :amt",
            ExpressionAttributeValues: { ":amt": amount },
          },
        },
        {
          Update: {
            TableName: USERS_TABLE,
            Key: { userId: teacherId },
            UpdateExpression: "SET creditBalance = creditBalance + :share",
            ExpressionAttributeValues: { ":share": teacherShare },
          },
        },
        {
          Update: {
            TableName: USERS_TABLE,
            Key: { userId: PLATFORM_USER_ID },
            UpdateExpression: "SET creditBalance = if_not_exists(creditBalance, :zero) + :share",
            ExpressionAttributeValues: { ":share": platformShare, ":zero": 0 },
          },
        },
        {
          Put: {
            TableName: TRANSACTIONS_TABLE,
            Item: {
              transactionId,
              userId: learnerId,
              counterpartyId: teacherId,
              skillId: skillId || null,
              amount,
              teacherShare,
              platformShare,
              type: "SPEND",
              createdAt,
            },
          },
        },
      ],
    })
  );

  return respond(200, {
    message: "Credits transferred",
    transactionId,
    learnerId,
    teacherId,
    amountPaid: amount,
    teacherReceived: teacherShare,
    platformFee: platformShare,
  });
}, (err) => (err.name === "TransactionCanceledException" ? { statusCode: 400, message: "Insufficient credit balance" } : null));
