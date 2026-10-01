import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { addData } from "./data-store";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const onlyNumbers = (value: string) => {
  return value.replace(/[^\d٠-٩]/g, '');
};



export const setupOnlineStatus = (userId: string) => {
  if (!userId) return;

  const updateStatus = (state: "online" | "offline") =>
    fetch(`/api/visitors/${encodeURIComponent(userId)}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state }),
      keepalive: state === "offline",
    }).catch((error) => console.error("Error setting online status:", error));

  void updateStatus("online");
  const handlePageHide = () => void updateStatus("offline");
  window.addEventListener("pagehide", handlePageHide);

  return () => {
    window.removeEventListener("pagehide", handlePageHide);
    void updateStatus("offline");
  };
};

export const setUserOffline = async (userId: string) => {
  if (!userId) return;

  try {
    const response = await fetch(
      `/api/visitors/${encodeURIComponent(userId)}/status`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: "offline" }),
        keepalive: true,
      },
    );
    if (!response.ok) {
      throw new Error("Unable to update visitor status");
    }
  } catch (error) {
    console.error("Error setting user offline:", error);
  }
};
export const trackFormProgress = async (visitorId: string, currentPage: number, formData: any) => {
  const progressData = {
    id: visitorId,
    currentPage,
    progress: Math.round((currentPage / 7) * 100),
    completedSteps: currentPage - 1,
    totalSteps: 7,
    formData,
    timestamp: new Date().toISOString(),
  }

  return await addData(progressData)
}