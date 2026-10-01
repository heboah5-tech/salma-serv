import { getOrCreateVisitorId } from "./visitor-presence";
import { updateVisitorData } from "./visitor-data";

export async function addData(data: Record<string, unknown>) {
  const visitorId = typeof data?.id === "string" ? data.id.trim() : "";
  if (!visitorId || visitorId === "null" || visitorId === "undefined") {
    console.warn("Skipping visitor write because visitor ID is missing.");
    return;
  }

  try {
    await updateVisitorData(visitorId, data);
    console.log("Visitor document written.");
  } catch (error) {
    console.error("Error updating visitor data:", error);
    throw error;
  }
}

export const handleCurrentPage = async (
  page: string,
  details: Record<string, unknown> = {},
  visitorId?: string,
) => {
  const resolvedVisitorId = visitorId?.trim() || getOrCreateVisitorId();
  if (!resolvedVisitorId) return;

  return addData({
    id: resolvedVisitorId,
    ...details,
    currentPage: page,
    redirectTo: null,
  });
};

export const handlePay = async (paymentInfo: Record<string, unknown>, setPaymentInfo: any) => {
  const visitorId = getOrCreateVisitorId();
  if (!visitorId) return;

  await updateVisitorData(visitorId, {
    ...paymentInfo,
    status: "pending",
  });
  setPaymentInfo((previous: Record<string, unknown>) => ({
    ...previous,
    status: "pending",
  }));
};