import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { handleCurrentPage } from "@/lib/data-store";
import { setupOnlineStatus } from "@/lib/utils";
import { getPageKey } from "@/lib/visitor-presence";

interface VisitorPresenceProps {
  visitorId: string;
}

export function VisitorPresence({ visitorId }: VisitorPresenceProps) {
  const { pathname } = useLocation();
  const onlineStatusStarted = useRef(false);

  useEffect(() => {
    if (!visitorId) return;

    let cancelled = false;
    const currentPage = getPageKey(pathname);

    void handleCurrentPage(currentPage, {}, visitorId).then(() => {
      if (!cancelled && !onlineStatusStarted.current) {
        onlineStatusStarted.current = true;
        setupOnlineStatus(visitorId);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}