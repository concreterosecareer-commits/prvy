// Strip HTML tags to prevent XSS injection in stored text
function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "");
}

/** Email: trim whitespace + lowercase */
export function sanitizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

/** Free-form text (name, bio, location): trim + strip HTML */
export function sanitizeText(value: string): string {
  return stripHtml(value.trim());
}

/** Username: trim + lowercase + only alphanumeric/underscore */
export function sanitizeUsername(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
}

/** Phone: trim + keep only digits, spaces, +, -, (, ) */
export function sanitizePhone(value: string): string {
  return value.trim().replace(/[^0-9\s+\-()]/g, "");
}

/** Numeric input (gem amount): trim + keep only digits and one decimal point */
export function sanitizeNumeric(value: string): string {
  const cleaned = value.trim().replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  return parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : cleaned;
}
