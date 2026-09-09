const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");
const { withHandler, respond, parseBody, requireAuth, enforceRateLimit } = require("../lib/http");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.SKILLS_TABLE;

const schema = {
  title: { type: "string", required: true, minLength: 1, maxLength: 200 },
  description: { type: "string", required: true, minLength: 1, maxLength: 2000 },
  category: { type: "string", maxLength: 50 },
  creditCost: { type: "number", min: 1, max: 100 },
};

exports.handler = withHandler(async (event) => {
  const teacherId = requireAuth(event);
  await enforceRateLimit(`postSkill#${teacherId}`, 10, 60, "too many skills posted, try again in a minute");

  const { title, description, category, creditCost } = parseBody(event, schema);
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

  return respond(201, { message: "Skill posted", skill });
});
