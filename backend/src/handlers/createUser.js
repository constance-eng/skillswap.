const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { EMAIL_PATTERN } = require("../lib/validate");
const { withHandler, respond, parseBody, sourceIp, enforceRateLimit } = require("../lib/http");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.USERS_TABLE;
const STARTING_CREDITS = Number(process.env.STARTING_CREDITS || 10);

const schema = {
  userId: { type: "string", required: true, minLength: 1, maxLength: 100 },
  name: { type: "string", required: true, minLength: 1, maxLength: 200 },
  email: { type: "string", required: true, maxLength: 200, pattern: EMAIL_PATTERN },
  bio: { type: "string", maxLength: 500 },
};

exports.handler = withHandler(async (event) => {
  await enforceRateLimit(`createUser#${sourceIp(event)}`, 5, 60, "too many signups from this address, try again in a minute");

  const { userId, name, email, bio } = parseBody(event, schema);
  const user = {
    userId,
    name,
    email,
    bio: bio || "",
    creditBalance: STARTING_CREDITS,
    skillsTaught: [],
    averageRating: null,
    createdAt: new Date().toISOString(),
  };

  await client.send(
    new PutCommand({ TableName: TABLE, Item: user, ConditionExpression: "attribute_not_exists(userId)" })
  );

  return respond(201, { message: "User created", user });
}, (err) => (err.name === "ConditionalCheckFailedException" ? { statusCode: 409, message: "User already exists" } : null));
