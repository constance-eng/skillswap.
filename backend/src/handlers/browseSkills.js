const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { withHandler, respond, sourceIp, enforceRateLimit, HttpError } = require("../lib/http");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.SKILLS_TABLE;
const MAX_CATEGORY_LENGTH = 50;

exports.handler = withHandler(async (event) => {
  await enforceRateLimit(`browseSkills#${sourceIp(event)}`, 60, 60);

  const category = event.queryStringParameters?.category;
  if (category && category.length > MAX_CATEGORY_LENGTH) {
    throw new HttpError(400, `category is too long (max ${MAX_CATEGORY_LENGTH} characters)`);
  }

  const { Items } = await client.send(new ScanCommand({ TableName: TABLE }));
  const skills = category ? (Items || []).filter((s) => s.category === category) : Items || [];

  return respond(200, { count: skills.length, skills });
});
