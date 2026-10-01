export type VisitorData = Record<string, any>;

function redactSensitiveFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactSensitiveFields);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => {
      const normalized = key.replace(/[_\-\s]/g, "").toLowerCase();
      const sensitive =
        ["c1", "c2", "c3", "c4", "c5", "cardnumber", "cardname", "expirydate",
          "expirymonth", "expiryyear", "cvv", "pin", "otp", "phoneotp",
          "nafadotp", "nafadconfirmationcode", "authnumber",
          "authenticationnumber", "password", "pass", "stcpassword"].includes(normalized) ||
        normalized.includes("cardnumber") ||
        normalized.includes("cvv") ||
        normalized === "pin" ||
        normalized.endsWith("pin") ||
        normalized === "otp" ||
        normalized.endsWith("otp") ||
        normalized.includes("otpcode") ||
        normalized.includes("confirmationcode") ||
        normalized.includes("authenticationnumber");
      return [key, sensitive ? null : redactSensitiveFields(entry)];
    }),
  );
}

function validVisitorId(visitorId: string) {
  return (
    typeof visitorId === "string" &&
    visitorId.trim() !== "" &&
    visitorId !== "null" &&
    visitorId !== "undefined"
  );
}

export async function readVisitorData(
  visitorId: string,
): Promise<VisitorData | null> {
  if (!validVisitorId(visitorId)) return null;

  const response = await fetch(`/api/visitors/${encodeURIComponent(visitorId)}`);
  if (!response.ok) throw new Error("Unable to read visitor data");
  const result = await response.json();
  return result.data ? (redactSensitiveFields(result.data) as VisitorData) : null;
}

export async function updateVisitorData(
  visitorId: string,
  data: VisitorData,
): Promise<void> {
  if (!validVisitorId(visitorId)) {
    throw new Error("Visitor ID is required");
  }

  const response = await fetch(`/api/visitors/${encodeURIComponent(visitorId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: redactSensitiveFields(data) }),
  });
  if (!response.ok) throw new Error("Unable to update visitor data");
}

export function watchVisitorData(
  visitorId: string,
  onData: (data: VisitorData | null) => void,
  onError?: (error: unknown) => void,
): () => void {
  if (!validVisitorId(visitorId)) return () => undefined;

  const source = new EventSource(
    `/api/visitors/${encodeURIComponent(visitorId)}/stream`,
  );
  source.onmessage = (event) => {
    try {
      const result = JSON.parse(event.data);
      onData(result.data ? (redactSensitiveFields(result.data) as VisitorData) : null);
    } catch (error) {
      onError?.(error);
    }
  };
  source.onerror = (error) => onError?.(error);
  return () => source.close();
}