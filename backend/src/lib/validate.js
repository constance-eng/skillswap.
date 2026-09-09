function validate(body, schema) {
  const errors = [];
  const input = body || {};
  const allowedFields = Object.keys(schema);

  for (const field of Object.keys(input)) {
    if (!allowedFields.includes(field)) {
      errors.push(`unexpected field: ${field}`);
    }
  }

  for (const [field, rules] of Object.entries(schema)) {
    const value = input[field];

    if (value === undefined || value === null || value === "") {
      if (rules.required) errors.push(`${field} is required`);
      continue;
    }

    if (rules.type === "string" && typeof value !== "string") {
      errors.push(`${field} must be a string`);
      continue;
    }
    if (rules.type === "number" && typeof value !== "number") {
      errors.push(`${field} must be a number`);
      continue;
    }

    if (rules.type === "string") {
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} is too long (max ${rules.maxLength} characters)`);
      }
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} is too short (min ${rules.minLength} characters)`);
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(`${field} has an invalid format`);
      }
    }

    if (rules.type === "number") {
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${field} must be at most ${rules.max}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// trim whitespace and strip control characters
function sanitize(body) {
  const clean = {};
  for (const [key, value] of Object.entries(body || {})) {
    clean[key] = typeof value === "string" ? value.trim().replace(/[\x00-\x1F\x7F]/g, "") : value;
  }
  return clean;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = { validate, sanitize, EMAIL_PATTERN };