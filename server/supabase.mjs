import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

function normalizeSupabaseUrl(value) {
  const trimmed = String(value || "")
    .trim()
    .replace(/^['"]|['"]$/g, "");

  const embeddedUrl = trimmed.match(/https?:\/\/[^\s"'`]+/i)?.[0];
  if (embeddedUrl) return embeddedUrl;

  const embeddedHost = trimmed.match(
    /([a-z0-9-]+\.supabase\.co(?:\/[^\s"'`]*)?)/i,
  )?.[1];
  if (embeddedHost) return `https://${embeddedHost}`;

  const projectReference = trimmed.match(/\b([a-z0-9]{20})\b/i)?.[1];
  if (projectReference) {
    return `https://${projectReference}.supabase.co`;
  }

  return "";
}

const supabaseUrl = normalizeSupabaseUrl(process.env.SUPABASE_URL);
const supabaseServiceRoleKey =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) must be configured for server-side data storage.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  realtime: {
    transport: WebSocket,
  },
});