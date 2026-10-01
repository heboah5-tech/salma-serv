import {
  isValidVisitorId,
  withSensitiveFieldsRedacted,
} from "./data-security.mjs";
import { supabase } from "./supabase.mjs";

const POLL_INTERVAL_MS = 1500;

function getVisitorId(req, res) {
  const visitorId = req.params.visitorId?.trim();
  if (!isValidVisitorId(visitorId)) {
    res.status(400).json({ error: "Invalid visitor ID" });
    return null;
  }
  return visitorId;
}

async function readVisitor(visitorId) {
  const { data, error } = await supabase
    .from("pays")
    .select("data, updated_at")
    .eq("id", visitorId)
    .maybeSingle();

  if (error) throw error;
  return {
    data: data?.data ? withSensitiveFieldsRedacted(data.data) : null,
    updatedAt: data?.updated_at || null,
  };
}

async function updateVisitor(visitorId, patch) {
  const existing = await readVisitor(visitorId);
  const now = new Date().toISOString();
  const merged = {
    ...(existing.data || {}),
    ...withSensitiveFieldsRedacted(patch),
    id: visitorId,
    updatedAt: now,
    isRead: false,
    createdAt: existing.data?.createdAt || patch.createdAt || now,
  };

  const { error } = await supabase.from("pays").upsert(
    {
      id: visitorId,
      data: withSensitiveFieldsRedacted(merged),
      updated_at: now,
    },
    { onConflict: "id" },
  );

  if (error) throw error;
  return { data: withSensitiveFieldsRedacted(merged), updatedAt: now };
}

function sendEvent(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

export function registerDataRoutes(app) {
  app.get("/api/visitors/:visitorId", async (req, res) => {
    const visitorId = getVisitorId(req, res);
    if (!visitorId) return;

    try {
      res.json(await readVisitor(visitorId));
    } catch (error) {
      console.error("[visitor read]", error);
      res.status(500).json({ error: "Unable to read visitor data" });
    }
  });

  app.post("/api/visitors/:visitorId", async (req, res) => {
    const visitorId = getVisitorId(req, res);
    if (!visitorId) return;
    const patch = req.body?.data;

    if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
      res.status(400).json({ error: "Visitor data must be an object" });
      return;
    }

    try {
      res.json(await updateVisitor(visitorId, patch));
    } catch (error) {
      console.error("[visitor update]", error);
      res.status(500).json({ error: "Unable to update visitor data" });
    }
  });

  app.post("/api/visitors/:visitorId/status", async (req, res) => {
    const visitorId = getVisitorId(req, res);
    if (!visitorId) return;
    const state = req.body?.state === "offline" ? "offline" : "online";

    try {
      res.json(
        await updateVisitor(visitorId, {
          status: state,
          lastSeen: new Date().toISOString(),
        }),
      );
    } catch (error) {
      console.error("[visitor status]", error);
      res.status(500).json({ error: "Unable to update visitor status" });
    }
  });

  app.get("/api/visitors/:visitorId/stream", async (req, res) => {
    const visitorId = getVisitorId(req, res);
    if (!visitorId) return;

    res
      .status(200)
      .set({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      })
      .flushHeaders();

    let lastUpdatedAt;
    let closed = false;

    const sendLatest = async () => {
      if (closed) return;
      try {
        const latest = await readVisitor(visitorId);
        if (latest.updatedAt !== lastUpdatedAt) {
          lastUpdatedAt = latest.updatedAt;
          sendEvent(res, latest);
        }
      } catch (error) {
        console.error("[visitor stream]", error);
      }
    };

    await sendLatest();
    const interval = setInterval(sendLatest, POLL_INTERVAL_MS);
    const keepAlive = setInterval(() => {
      if (!closed) res.write(": keep-alive\n\n");
    }, 15000);

    req.on("close", () => {
      closed = true;
      clearInterval(interval);
      clearInterval(keepAlive);
    });
  });
}