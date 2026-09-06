const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");
const { validate, sanitize } = require("../lib/validate");
const { checkRateLimit } = require("../lib/rateLimit");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.SKILLS_TABLE;

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
  },
  body: JSON.stringify(body),
});

const schema = {
  title: { type: "string", required: true, minLength: 1, maxLength: 200 },
  description: { type: "string", required: true, minLength: 1, maxLength: 2000 },
  category: { type: "string", maxLength: 50 },
  creditCost: { type: "number", min: 1, max: 100 },
};

exports.handler = async (event) => {
  try {
    const teacherId = event.requestContext?.authorizer?.claims?.sub;
    if (!teacherId) return response(401, { error: "Unauthorized" });

    const { allowed } = await checkRateLimit(`postSkill#${teacherId}`, 10, 60);
    if (!allowed) {
      return response(429, { error: "too many skills posted, try again in a minute" });
    }

    const body = sanitize(JSON.parse(event.body || "{}"));
    const { valid, errors } = validate(body, schema);
    if (!valid) {
      return response(400, { error: "validation failed", details: errors });
    }

    const { title, description, category, creditCost } = body;

    const skill = {
      skillId: randomUUID(),
      teacherId,
      title,
      description,
      category: category || "general",
      creditCost: creditCost || 1,
      createdAt: new Date().toISOString(),
    };

    await client.send(new PutCommand({ TableName: TABLE, Item: skill }));

    return response(201, { message: "Skill posted", skill });
  } catch (err) {
    console.error(err);
    return response(500, { error: "Internal server error" });
  }
};
