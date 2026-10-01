import { PAGE_ROUTES } from "./page-routes";

let memoryVisitorId = "";

function isValidVisitorId(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const normalized = value.trim();
  return normalized !== "" && normalized !== "null" && normalized !== "undefined";
}

function createVisitorId() {
  return `salmn-${Math.random().toString(36).slice(2)}`;
}

export function getOrCreateVisitorId() {
  if (typeof window === "undefined") return "";

  if (isValidVisitorId(memoryVisitorId)) return memoryVisitorId;

  const visitorId = createVisitorId();
  memoryVisitorId = visitorId;
  return visitorId;
}

export function getPageKey(pathname: string) {
  const route = Object.entries(PAGE_ROUTES).find(
    ([, path]) => path === pathname,
  );

  if (route) return route[0];
  return pathname.replace(/^\/+|\/+$/g, "") || "home";
}
