const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  TransactWriteCommand,
} = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");
const { validate, sanitize } = require("../lib/validate");
const { checkRateLimit } = require("../lib/rateLimit");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const USERS_TABLE = process.env.USERS_TABLE;
const TRANSACTIONS_TABLE = process.env.TRANSACTIONS_TABLE;
const TEACHER_CUT = Number(process.env.TEACHER_CUT || 8);
const PLATFORM_USER_ID = "PLATFORM";

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
  },
  body: JSON.stringify(body),
});

const schema = {
  teacherId: { type: "string", required: true, minLength: 1, maxLength: 100 },
  amount: { type: "number", required: true, min: 1, max: 1000 },
  skillId: { type: "string", maxLength: 100 },
};

exports.handler = async (event) => {
  try {
    const learnerId = event.requestContext?.authorizer?.claims?.sub;
    if (!learnerId) return response(401, { error: "Unauthorized" });

    const { allowed } = await checkRateLimit(`transfer#${learnerId}`, 5, 60);
    if (!allowed) {
      return response(429, { error: "too many transfers, try again in a minute" });
    }

    const body = sanitize(JSON.parse(event.body || "{}"));
    const { valid, errors } = validate(body, schema);
    if (!valid) {
      return response(400, { error: "validation failed", details: errors });
    }

    const { teacherId, amount, skillId } = body;

    if (learnerId === teacherId) {
      return response(400, { error: "Cannot transfer credits to yourself" });
    }

    const teacherShare = Math.min(amount, TEACHER_CUT);
    const platformShare = amount - teacherShare;

    const transactionId = randomUUID();
    const timestamp = new Date().toISOString();

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
              UpdateExpression:
                "SET creditBalance = if_not_exists(creditBalance, :zero) + :share",
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
                createdAt: timestamp,
              },
            },
          },
        ],
      })
    );

    return response(200, {
      message: "Credits transferred",
      transactionId,
      learnerId,
      teacherId,
      amountPaid: amount,
      teacherReceived: teacherShare,
      platformFee: platformShare,
    });
  } catch (err) {
    if (err.name === "TransactionCanceledException") {
      return response(400, { error: "Insufficient credit balance" });
    }
    console.error(err);
    return response(500, { error: "Internal server error" });
  }
};