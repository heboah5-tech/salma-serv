"use client";

import { useEffect } from "react";
import { getRedirectUrl } from "@/lib/page-routes";
import { watchVisitorData } from "@/lib/visitor-data";

interface UseRedirectMonitorOptions {
  visitorId: string;
  currentPage: string;
}

export function useRedirectMonitor({
  visitorId,
  currentPage,
}: UseRedirectMonitorOptions) {
  useEffect(() => {
    if (!visitorId) return;

    const unsubscribe = watchVisitorData(
      visitorId,
      (data) => {
        if (!data) return;
        const redirectUrl = getRedirectUrl(data.redirectTo, currentPage);
        if (redirectUrl) {
          window.location.href = redirectUrl;
        }
      },
      (error) => console.error("[redirect-monitor] data error:", error),
    );

    return () => unsubscribe();
  }, [visitorId, currentPage]);
}
