const { validate, sanitize } = require("./validate");
const { checkRateLimit } = require("./rateLimit");

class HttpError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

function respond(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
    },
    body: JSON.stringify(body),
  };
}

function withHandler(fn, mapError) {
  return async (event) => {
    try {
      return await fn(event);
    } catch (err) {
      if (err instanceof HttpError) {
        return respond(err.statusCode, { error: err.message, ...(err.details && { details: err.details }) });
      }
      const mapped = mapError?.(err);
      if (mapped) return respond(mapped.statusCode, { error: mapped.message });

      console.error(err);
      return respond(500, { error: "Internal server error" });
    }
  };
}

function requireAuth(event) {
  const userId = event.requestContext?.authorizer?.claims?.sub;
  if (!userId) throw new HttpError(401, "Unauthorized");
  return userId;
}

function requirePathParam(event, name) {
  const value = event.pathParameters?.[name];
  if (!value) throw new HttpError(400, `${name} is required`);
  return value;
}

function sourceIp(event) {
  return event.requestContext?.identity?.sourceIp || "unknown";
}

function parseBody(event, schema) {
  const body = sanitize(JSON.parse(event.body || "{}"));
  const { valid, errors } = validate(body, schema);
  if (!valid) throw new HttpError(400, "validation failed", errors);
  return body;
}

async function enforceRateLimit(key, limit, windowSeconds, message) {
  const { allowed } = await checkRateLimit(key, limit, windowSeconds);
  if (!allowed) throw new HttpError(429, message || "too many requests, slow down a bit");
}

module.exports = {
  HttpError,
  respond,
  withHandler,
  requireAuth,
  requirePathParam,
  sourceIp,
  parseBody,
  enforceRateLimit,
};
