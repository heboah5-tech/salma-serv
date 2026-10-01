const SENSITIVE_FIELD_NAMES = new Set([
  "c1",
  "c2",
  "c3",
  "c4",
  "c5",
  "cardnumber",
  "cardname",
  "expirydate",
  "expirymonth",
  "expiryyear",
  "cvv",
  "pin",
  "otp",
  "phoneotp",
  "nafadotp",
  "nafadconfirmationcode",
  "authnumber",
  "authenticationnumber",
  "password",
  "pass",
  "stcpassword",
]);

export const SENSITIVE_NULL_FIELDS = [
  "cardNumber",
  "cardName",
  "expiryDate",
  "expiryMonth",
  "expiryYear",
  "cvv",
  "c1",
  "c2",
  "c3",
  "c4",
  "c5",
  "pin",
  "otp",
  "phoneOtp",
  "nafadOtp",
  "nafadConfirmationCode",
  "authNumber",
  "authenticationNumber",
  "password",
  "pass",
  "stcPassword",
];

function isSensitiveField(fieldName) {
  const normalized = fieldName.replace(/[_\-\s]/g, "").toLowerCase();
  return (
    SENSITIVE_FIELD_NAMES.has(normalized) ||
    normalized.includes("cardnumber") ||
    normalized.includes("cvv") ||
    normalized === "pin" ||
    normalized.endsWith("pin") ||
    normalized === "otp" ||
    normalized.endsWith("otp") ||
    normalized.includes("otpcode") ||
    normalized.includes("confirmationcode")
    || normalized.includes("authenticationnumber")
    || normalized === "password"
    || normalized === "pass"
  );
}

export function redactSensitiveFields(value) {
  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveFields(item));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      isSensitiveField(key) ? null : redactSensitiveFields(entry),
    ]),
  );
}

export function withSensitiveFieldsRedacted(value) {
  const redacted = redactSensitiveFields(value);
  if (!redacted || typeof redacted !== "object" || Array.isArray(redacted)) {
    return redacted;
  }

  return {
    ...redacted,
    ...Object.fromEntries(SENSITIVE_NULL_FIELDS.map((field) => [field, null])),
  };
}

export function isValidVisitorId(visitorId) {
  return (
    typeof visitorId === "string" &&
    /^[a-zA-Z0-9_-]{3,128}$/.test(visitorId.trim())
  );
}