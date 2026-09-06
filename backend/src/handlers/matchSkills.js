const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
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
  query: { type: "string", required: true, minLength: 1, maxLength: 500 },
  topN: { type: "number", min: 1, max: 20 },
};

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "of", "to", "in", "on", "for", "with",
  "is", "are", "be", "this", "that", "i", "you", "want", "learn", "how",
]);

function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((tok) => tok.length > 1 && !STOPWORDS.has(tok));
}

function buildTfIdfSpace(documents) {
  const docTokenLists = documents.map(tokenize);
  const vocabulary = new Set();
  docTokenLists.forEach((tokens) => tokens.forEach((t) => vocabulary.add(t)));
  const vocabArray = Array.from(vocabulary);

  const df = {};
  vocabArray.forEach((term) => {
    df[term] = docTokenLists.filter((tokens) => tokens.includes(term)).length;
  });

  const numDocs = documents.length;
  const idf = {};
  vocabArray.forEach((term) => {
    idf[term] = Math.log((numDocs + 1) / (df[term] + 1)) + 1;
  });

  const tfVectors = docTokenLists.map((tokens) => {
    const tf = {};
    tokens.forEach((t) => (tf[t] = (tf[t] || 0) + 1));
    Object.keys(tf).forEach((t) => (tf[t] = tf[t] / tokens.length));
    return tf;
  });

  return { vocabArray, idf, tfVectors };
}

function tfIdfVector(tf, idf, vocabArray) {
  return vocabArray.map((term) => (tf[term] || 0) * (idf[term] || 0));
}

function cosineSimilarity(vecA, vecB) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

exports.handler = async (event) => {
  try {
    const learnerId = event.requestContext?.authorizer?.claims?.sub;
    if (!learnerId) return response(401, { error: "Unauthorized" });

    const { allowed } = await checkRateLimit(`match#${learnerId}`, 20, 60);
    if (!allowed) {
      return response(429, { error: "too many match requests, try again in a minute" });
    }

    const body = sanitize(JSON.parse(event.body || "{}"));
    const { valid, errors } = validate(body, schema);
    if (!valid) {
      return response(400, { error: "validation failed", details: errors });
    }

    const { query, topN } = body;

    const result = await client.send(new ScanCommand({ TableName: TABLE }));
    const skills = result.Items || [];

    if (skills.length === 0) {
      return response(200, { matches: [] });
    }

    const corpus = skills.map((s) => `${s.title} ${s.description}`);
    corpus.push(query);

    const { vocabArray, idf, tfVectors } = buildTfIdfSpace(corpus);

    const queryVector = tfIdfVector(tfVectors[tfVectors.length - 1], idf, vocabArray);
    const skillVectors = tfVectors.slice(0, -1).map((tf) => tfIdfVector(tf, idf, vocabArray));

    const scored = skills.map((skill, i) => ({
      skill,
      score: cosineSimilarity(queryVector, skillVectors[i]),
    }));

    scored.sort((a, b) => b.score - a.score);

    const matches = scored
      .filter((m) => m.score > 0)
      .slice(0, topN || 5)
      .map((m) => ({ ...m.skill, matchScore: Number(m.score.toFixed(4)) }));

    return response(200, { query, matches });
  } catch (err) {
    console.error(err);
    return response(500, { error: "Internal server error" });
  }
};
