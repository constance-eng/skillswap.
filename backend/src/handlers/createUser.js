const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { validate, sanitize, EMAIL_PATTERN } = require("../lib/validate");
const { checkRateLimit } = require("../lib/rateLimit");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.USERS_TABLE;
const STARTING_CREDITS = Number(process.env.STARTING_CREDITS || 10);

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
  },
  body: JSON.stringify(body),
});

const schema = {
  userId: { type: "string", required: true, minLength: 1, maxLength: 100 },
  name: { type: "string", required: true, minLength: 1, maxLength: 200 },
  email: { type: "string", required: true, maxLength: 200, pattern: EMAIL_PATTERN },
  bio: { type: "string", maxLength: 500 },
};

exports.handler = async (event) => {
  try {
    const sourceIp = event.requestContext?.identity?.sourceIp || "unknown";
    const { allowed } = await checkRateLimit(`createUser#${sourceIp}`, 5, 60);
    if (!allowed) {
      return response(429, { error: "too many signups from this address, try again in a minute" });
    }

    const body = sanitize(JSON.parse(event.body || "{}"));
    const { valid, errors } = validate(body, schema);
    if (!valid) {
      return response(400, { error: "validation failed", details: errors });
    }

    const { userId, name, email, bio } = body;

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
      new PutCommand({
        TableName: TABLE,
        Item: user,
        ConditionExpression: "attribute_not_exists(userId)",
      })
    );

    return response(201, { message: "User created", user });
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      return response(409, { error: "User already exists" });
    }
    console.error(err);
    return response(500, { error: "Internal server error" });
  }
};
