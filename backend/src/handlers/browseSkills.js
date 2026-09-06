const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
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

const MAX_CATEGORY_LENGTH = 50;

exports.handler = async (event) => {
  try {
    const sourceIp = event.requestContext?.identity?.sourceIp || "unknown";
    const { allowed } = await checkRateLimit(`browseSkills#${sourceIp}`, 60, 60);
    if (!allowed) {
      return response(429, { error: "too many requests, slow down a bit" });
    }

    const category = event.queryStringParameters?.category;
    if (category && category.length > MAX_CATEGORY_LENGTH) {
      return response(400, { error: `category is too long (max ${MAX_CATEGORY_LENGTH} characters)` });
    }

    const result = await client.send(new ScanCommand({ TableName: TABLE }));
    let skills = result.Items || [];

    if (category) {
      skills = skills.filter((s) => s.category === category);
    }

    return response(200, { count: skills.length, skills });
  } catch (err) {
    console.error(err);
    return response(500, { error: "Internal server error" });
  }
};
