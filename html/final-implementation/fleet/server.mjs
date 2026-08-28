import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(import.meta.dirname);
const fixtureRoot = join(root, "fleet-data");
const page1FallbackPath = join(root, "page1-fallbacks.json");
const localChangesPath = process.env.LOCAL_CHANGES_PATH
  ? resolve(process.env.LOCAL_CHANGES_PATH)
  : join(root, "local-changes.json");
let replayIndex;
let localChanges;
let page1Fallbacks;

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function fixtureKey(method, url, body) {
  return createHash("sha256").update(`${method}\n${url}\n${body}`).digest("hex");
}

function normalizeApiPath(apiPath) {
  const parsed = new URL(apiPath, "http://offline.local");
  parsed.searchParams.delete("infiniteIdentifier");
  const entries = [...parsed.searchParams.entries()].sort(([aKey, aValue], [bKey, bValue]) =>
    aKey.localeCompare(bKey) || aValue.localeCompare(bValue),
  );
  const query = new URLSearchParams(entries).toString();
  return parsed.pathname + (query ? `?${query}` : "");
}

function normalizeDateAgnosticApiPath(apiPath) {
  const parsed = new URL(apiPath, "http://offline.local");
  parsed.searchParams.delete("infiniteIdentifier");
  parsed.searchParams.delete("startDate");
  parsed.searchParams.delete("endDate");
  const entries = [...parsed.searchParams.entries()].sort(([aKey, aValue], [bKey, bValue]) =>
    aKey.localeCompare(bKey) || aValue.localeCompare(bValue),
  );
  const query = new URLSearchParams(entries).toString();
  return parsed.pathname + (query ? `?${query}` : "");
}

function normalizePaginationApiPath(apiPath) {
  const parsed = new URL(apiPath, "http://offline.local");
  parsed.searchParams.delete("infiniteIdentifier");
  parsed.searchParams.delete("startDate");
  parsed.searchParams.delete("endDate");
  parsed.searchParams.delete("pageNo");
  const entries = [...parsed.searchParams.entries()].sort(([aKey, aValue], [bKey, bValue]) =>
    aKey.localeCompare(bKey) || aValue.localeCompare(bValue),
  );
  const query = new URLSearchParams(entries).toString();
  return parsed.pathname + (query ? `?${query}` : "");
}

function normalizeEquipmentQueryAgnosticApiPath(apiPath) {
  const parsed = new URL(apiPath, "http://offline.local");
  parsed.searchParams.delete("infiniteIdentifier");
  parsed.searchParams.delete("startDate");
  parsed.searchParams.delete("endDate");
  parsed.searchParams.delete("equipmentId");
  const entries = [...parsed.searchParams.entries()].sort(([aKey, aValue], [bKey, bValue]) =>
    aKey.localeCompare(bKey) || aValue.localeCompare(bValue),
  );
  const query = new URLSearchParams(entries).toString();
  return parsed.pathname + (query ? `?${query}` : "");
}

function normalizeScopeAgnosticApiPath(apiPath) {
  const parsed = new URL(apiPath, "http://offline.local");
  parsed.searchParams.delete("infiniteIdentifier");
  parsed.searchParams.delete("startDate");
  parsed.searchParams.delete("endDate");
  parsed.searchParams.delete("equipmentId");
  parsed.searchParams.delete("groupId");
  if (parsed.pathname.startsWith("/fleet/analysis/")) {
    parsed.pathname = parsed.pathname.replace(/\/(?:group|equipment)\/[^/]+/g, "/scope");
  } else if (/\/fleet\/management\/equipment\/[^/]+$/.test(parsed.pathname)) {
    const tail = parsed.pathname.split("/").filter(Boolean).at(-1);
    if (!["category", "graph", "schedules", "summary-operation"].includes(tail)) {
      parsed.pathname = parsed.pathname.replace(/\/equipment\/[^/]+$/, "/equipment/@equipment");
    }
  }
  const entries = [...parsed.searchParams.entries()].sort(([aKey, aValue], [bKey, bValue]) =>
    aKey.localeCompare(bKey) || aValue.localeCompare(bValue),
  );
  const query = new URLSearchParams(entries).toString();
  return parsed.pathname + (query ? `?${query}` : "");
}

function requestedEquipmentId(apiPath) {
  const parsed = new URL(apiPath, "http://offline.local");
  const queryId = parsed.searchParams.get("equipmentId");
  if (queryId) return decodeURIComponent(queryId);
  const direct = parsed.pathname.match(/\/equipment\/([^/]+)$/);
  if (!direct) return "";
  const candidate = decodeURIComponent(direct[1]);
  if (["category", "graph", "schedules", "summary-operation"].includes(candidate)) return "";
  return candidate;
}

function normalizeEquipmentIdentity(value) {
  return String(value || "").toLowerCase().replace(/[-_\s]/g, "");
}

function adaptPayloadForEquipment(value, equipmentId) {
  if (!equipmentId) return value;
  if (Array.isArray(value)) {
    const identityRows = value.filter((item) => item && typeof item === "object" && !Array.isArray(item)
      && (item.equipmentId || item.equipmentNumber));
    if (identityRows.length) {
      const match = identityRows.find((item) =>
        normalizeEquipmentIdentity(item.equipmentId || item.equipmentNumber) === normalizeEquipmentIdentity(equipmentId),
      ) || identityRows[0];
      return [adaptPayloadForEquipment(match, equipmentId)];
    }
    return value.map((item) => adaptPayloadForEquipment(item, equipmentId));
  }
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => {
    if (["equipmentId", "equipmentNumber", "vehicleId", "vehicleNumber"].includes(key) && item) {
      return [key, equipmentId];
    }
    return [key, adaptPayloadForEquipment(item, equipmentId)];
  }));
}

async function requestBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function getReplayIndex() {
  if (replayIndex) return replayIndex;
  const index = new Map();
  const { readdir } = await import("node:fs/promises");
  for (const name of await readdir(fixtureRoot)) {
    if (!name.endsWith(".json")) continue;
    const source = (await readFile(join(fixtureRoot, name), "utf8")).replace(/^\uFEFF/, "");
    const record = JSON.parse(source);
    const indexKey = `${record.method}\n${normalizeApiPath(record.path)}`;
    if (!index.has(indexKey)) index.set(indexKey, record);
    if (record.method === "GET") {
      const dateAgnosticKey = `${record.method}\n@date:${normalizeDateAgnosticApiPath(record.path)}`;
      if (!index.has(dateAgnosticKey)) index.set(dateAgnosticKey, record);
      if (new URL(record.path, "http://offline.local").searchParams.has("pageNo")) {
        const paginationKey = `${record.method}\n@page:${normalizePaginationApiPath(record.path)}`;
        if (!index.has(paginationKey)) index.set(paginationKey, record);
      }
      const equipmentQueryKey = `${record.method}\n@equipment:${normalizeEquipmentQueryAgnosticApiPath(record.path)}`;
      if (!index.has(equipmentQueryKey)) index.set(equipmentQueryKey, record);
      const scopeKey = `${record.method}\n@scope:${normalizeScopeAgnosticApiPath(record.path)}`;
      const currentScopeRecord = index.get(scopeKey);
      if (!currentScopeRecord || record.path.includes("/group/1948") || record.path.includes("groupId=1948")) {
        index.set(scopeKey, record);
      }
    }
  }
  replayIndex = index;
  return replayIndex;
}

function offlinePayload(record) {
  return Buffer.from(record.body, record.bodyEncoding);
}

async function getLocalChanges() {
  if (localChanges) return localChanges;
  try {
    localChanges = JSON.parse(await readFile(localChangesPath, "utf8"));
  } catch {
    localChanges = { version: 1, mutations: [] };
  }
  return localChanges;
}

async function getPage1Fallbacks() {
  if (!page1Fallbacks) page1Fallbacks = JSON.parse(await readFile(page1FallbackPath, "utf8"));
  return page1Fallbacks;
}

async function applyPage1Fallback(value, apiPath) {
  if (!Array.isArray(value?.result) || value.result.length > 0) return value;
  const requestUrl = new URL(apiPath, "http://offline.local");
  const pageNo = Number(requestUrl.searchParams.get("pageNo") || 1);
  if (pageNo > 1) return value;
  const fallback = (await getPage1Fallbacks())[requestUrl.pathname];
  if (!Array.isArray(fallback) || fallback.length === 0) return value;
  return { ...value, result: fallback, pageNo: 1, pageSize: value.pageSize || fallback.length, total: fallback.length };
}

async function recordLocalMutation(method, apiPath, body) {
  const changes = await getLocalChanges();
  let input = null;
  try {
    input = body.length ? JSON.parse(body.toString("utf8")) : null;
  } catch {
    input = body.toString("utf8");
  }
  const normalizedPath = normalizeApiPath(apiPath);
  const entry = { method, path: normalizedPath, body: input, updatedAt: new Date().toISOString() };
  const currentIndex = changes.mutations.findIndex((item) => item.method === method && item.path === normalizedPath);
  if (currentIndex >= 0) changes.mutations[currentIndex] = entry;
  else changes.mutations.push(entry);
  await writeFile(localChangesPath, `${JSON.stringify(changes, null, 2)}\n`, "utf8");
  return input;
}

function identityValues(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return new Set();
  return new Set(
    Object.entries(value)
      .filter(([key, item]) => /(^id$|Id$|Number$)/.test(key) && item !== null && item !== undefined)
      .map(([, item]) => String(item)),
  );
}

function normalizeMutationValue(value) {
  if (Array.isArray(value)) return value.map(normalizeMutationValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeMutationValue(item)]));
  }
  return value === "null" || value === "undefined" ? null : value;
}

function applyMutationToValue(value, mutation) {
  const mutationBody = mutation.body && typeof mutation.body === "object" && !Array.isArray(mutation.body)
    ? mutation.body
    : null;
  const targetId = decodeURIComponent(new URL(mutation.path, "http://offline.local").pathname.split("/").filter(Boolean).at(-1) || "");
  const pathParts = new URL(mutation.path, "http://offline.local").pathname.split("/").filter(Boolean);
  const entityKeys = {
    equipment: ["equipmentId", "equipmentNumber"],
    user: ["userId"],
    company: ["companyId"],
    group: ["groupId"],
    geofence: ["geofenceId"],
  };
  const entity = [...pathParts].reverse().find((part) => entityKeys[part]);
  const bodyPrimaryIds = new Set(
    entity && mutationBody
      ? entityKeys[entity].map((key) => mutationBody[key]).filter((item) => item !== null && item !== undefined).map(String)
      : [],
  );
  const matches = (item) => {
    const itemIds = identityValues(item);
    if (targetId !== entity && itemIds.has(targetId)) return true;
    return [...bodyPrimaryIds].some((id) => itemIds.has(id));
  };

  if (Array.isArray(value)) {
    if (mutation.method === "DELETE") return value.filter((item) => !matches(item)).map((item) => applyMutationToValue(item, mutation));
    return value.map((item) => applyMutationToValue(item, mutation));
  }
  if (!value || typeof value !== "object") return value;
  const output = { ...value };
  if (mutationBody && matches(output) && ["PUT", "PATCH"].includes(mutation.method)) Object.assign(output, normalizeMutationValue(mutationBody));
  for (const [key, item] of Object.entries(output)) output[key] = applyMutationToValue(item, mutation);
  return output;
}

function stabilizeOfflineValue(value) {
  if (Array.isArray(value)) return value.map(stabilizeOfflineValue);
  if (!value || typeof value !== "object") return value;
  const output = Object.fromEntries(Object.entries(value).map(([key, item]) => [key, stabilizeOfflineValue(item)]));
  if (output.modelYear === "null" || output.modelYear === "undefined") output.modelYear = null;
  if (output.userId && output.roleId) {
    for (const key of [
      "messageShockYn", "messageExpendableYn", "messageErrorYn", "emailShockYn",
      "emailExpendableYn", "emailErrorYn", "emailReportYn", "pushAlarmYn",
      "shockWarningYn", "vehicleWarningYn", "batteryWarningYn", "marketingYn",
    ]) {
      if (output[key] === null || output[key] === undefined) output[key] = "N";
    }
  }
  return output;
}

function refreshOfflineJwt(token, lifetimeSeconds) {
  try {
    const [header, payload] = String(token || "").split(".");
    if (!header || !payload) return token;
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const now = Math.floor(Date.now() / 1000);
    decoded.iat = now;
    decoded.exp = now + lifetimeSeconds;
    const encodedPayload = Buffer.from(JSON.stringify(decoded), "utf8").toString("base64url");
    return `${header}.${encodedPayload}.offline`;
  } catch {
    return token;
  }
}

async function expandEquipmentCategory(value, apiPath) {
  const requestUrl = new URL(apiPath, "http://offline.local");
  if (requestUrl.pathname !== "/fleet/management/equipment/category") return value;
  if (requestUrl.searchParams.get("category") !== "group") return value;
  if (!Array.isArray(value?.result)) return value;

  const pageNo = Number(requestUrl.searchParams.get("pageNo") || 1);
  if (pageNo > 1) {
    return { ...value, result: [], pageNo, total: Number(value.total || 0) };
  }

  const groupId = String(requestUrl.searchParams.get("value") || "");
  const index = await getReplayIndex();
  const allRecord = index.get(`GET\n${normalizeApiPath("/fleet/admin/all-equipments")}`);
  if (!allRecord) return value;

  let allEquipment;
  try {
    allEquipment = JSON.parse(offlinePayload(allRecord).toString("utf8"));
  } catch {
    return value;
  }
  const groupEquipment = (Array.isArray(allEquipment) ? allEquipment : allEquipment?.result || [])
    .filter((item) => String(item.groupId || "") === groupId);
  if (!groupEquipment.length) return value;

  const rows = [...value.result];
  const identities = new Set(rows.flatMap((item) => [item.equipmentId, item.equipmentNumber].map(normalizeEquipmentIdentity)));
  for (const item of groupEquipment) {
    const id = item.equipmentId || item.equipmentNumber;
    const number = item.equipmentNumber || id;
    if (!id || identities.has(normalizeEquipmentIdentity(id)) || identities.has(normalizeEquipmentIdentity(number))) continue;
    const isB35 = String(id).toUpperCase().startsWith("FBA34");
    const template = rows.find((row) => String(row.equipmentId || "").toUpperCase().startsWith(isB35 ? "FBA34" : "FBA32")) || rows[0] || {};
    rows.push({
      ...template,
      ...item,
      equipmentId: id,
      equipmentNumber: number,
      equipmentName: isB35 ? "B35S-7" : "B30S-7",
      codeName: isB35 ? "B35S-7" : "B30S-7",
      equipmentCode: isB35 ? "FBA34" : "FBA32",
      cumulativeDistance: item.cumulativeDistance ?? 0,
      cumulativeTimeVal: item.cumulativeTimeVal ?? 0,
      terminalId: Number(String(number).match(/\d+$/)?.[0] || 0) || null,
    });
    identities.add(normalizeEquipmentIdentity(id));
    identities.add(normalizeEquipmentIdentity(number));
  }

  return { ...value, result: rows, pageNo: 1, pageSize: rows.length, total: rows.length };
}

async function payloadWithLocalChanges(record, apiPath) {
  const payload = offlinePayload(record);
  if (!String(record.contentType || "").includes("json")) return payload;
  try {
    let json = stabilizeOfflineValue(JSON.parse(payload.toString("utf8")));
    json = await applyPage1Fallback(json, apiPath);
    json = await expandEquipmentCategory(json, apiPath);
    json = adaptPayloadForEquipment(json, requestedEquipmentId(apiPath));
    const changes = await getLocalChanges();
    const requestPath = new URL(apiPath, "http://offline.local").pathname;
    if (/\/common\/auth\/(?:fleet|dealer)\/authenticate$/.test(requestPath) && json?.result) {
      json.result.access_token = refreshOfflineJwt(json.result.access_token, 2 * 60 * 60);
      json.result.refresh_token = refreshOfflineJwt(json.result.refresh_token, 24 * 60 * 60);
    }
    for (const mutation of changes.mutations) {
      const mutationPath = new URL(mutation.path, "http://offline.local").pathname;
      json = applyMutationToValue(json, mutation);
      if (["PUT", "PATCH"].includes(mutation.method) && requestPath === mutationPath && json?.result && mutation.body && typeof mutation.body === "object") {
        Object.assign(json.result, normalizeMutationValue(mutation.body));
      }
      if (
        ["PUT", "PATCH"].includes(mutation.method)
        && mutationPath.endsWith("/admin/company")
        && requestPath.endsWith("/admin/companies")
        && Array.isArray(json?.result)
        && json.result[0]
      ) {
        Object.assign(json.result[0], normalizeMutationValue(mutation.body));
      }
    }
    return Buffer.from(JSON.stringify(json), "utf8");
  } catch {
    return payload;
  }
}

async function sendRecord(response, record, apiPath) {
  response.writeHead(record.status, { "content-type": record.contentType });
  response.end(await payloadWithLocalChanges(record, apiPath));
}

async function sendCompletedPage(response, record, apiPath, pageNo) {
  const payload = JSON.parse((await payloadWithLocalChanges(record, apiPath)).toString("utf8"));
  payload.result = [];
  payload.pageNo = pageNo;
  response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

async function replayApi(request, response, parsedUrl) {
  const body = await requestBody(request);
  const apiPath = parsedUrl.pathname.slice(4) + parsedUrl.search;
  const key = fixtureKey(request.method, apiPath, body.toString("utf8"));
  try {
    const record = JSON.parse(await readFile(join(fixtureRoot, `${key}.json`), "utf8"));
    await sendRecord(response, record, apiPath);
  } catch {
    const index = await getReplayIndex();
    const requestUrl = new URL(apiPath, "http://offline.local");
    const pageNo = Number(requestUrl.searchParams.get("pageNo"));
    if (request.method === "GET" && requestedEquipmentId(apiPath) && pageNo > 1) {
      response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ code: "00", msg: "success", status: 200, result: [], pageNo, pageSize: Number(requestUrl.searchParams.get("pageSize") || 20), total: 1 }));
      return;
    }
    const replayKey = `${request.method}\n${normalizeApiPath(apiPath)}`;
    const dateAgnosticKey = `${request.method}\n@date:${normalizeDateAgnosticApiPath(apiPath)}`;
    const equipmentQueryKey = `${request.method}\n@equipment:${normalizeEquipmentQueryAgnosticApiPath(apiPath)}`;
    const scopeKey = `${request.method}\n@scope:${normalizeScopeAgnosticApiPath(apiPath)}`;
    const record = index.get(replayKey) ?? index.get(dateAgnosticKey) ?? index.get(equipmentQueryKey) ?? index.get(scopeKey);
    if (record) {
      await sendRecord(response, record, apiPath);
      return;
    }
    if (request.method === "GET" && pageNo > 1) {
      const paginationKey = `${request.method}\n@page:${normalizePaginationApiPath(apiPath)}`;
      const pageTemplate = index.get(paginationKey);
      if (pageTemplate) {
        await sendCompletedPage(response, pageTemplate, apiPath, pageNo);
        return;
      }
    }
    if (!["GET", "HEAD"].includes(request.method)) {
      const input = await recordLocalMutation(request.method, apiPath, body);
      response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ code: "00", msg: "success", status: 200, result: input ?? true, localOnly: true }));
      return;
    }
    console.warn(`Missing offline fixture: ${replayKey.replace("\n", " ")}`);
    response.writeHead(404, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ code: "LOCAL_FIXTURE_NOT_FOUND", method: request.method, path: apiPath }));
  }
}

async function serveStatic(response, pathname) {
  if (pathname === "/") {
    const data = await readFile(join(root, "..", "index.html"));
    response.writeHead(200, { "content-type": mime[".html"], "cache-control": "no-store" });
    response.end(data);
    return;
  }
  let relative = decodeURIComponent(pathname).replace(/^\/+/, "");
  if (!relative || relative === "fleet") relative = "index.html";
  if (relative.startsWith("fleet/")) relative = relative.slice("fleet/".length);
  if (relative.endsWith("/")) relative += "index.html";
  let filePath = resolve(root, normalize(relative));
  if (!filePath.startsWith(root)) throw new Error("Invalid path");

  try {
    const data = await readFile(filePath);
    response.writeHead(200, { "content-type": mime[extname(filePath).toLowerCase()] ?? "application/octet-stream", "cache-control": "no-store" });
    response.end(data);
  } catch {
    if (pathname.startsWith("/fleet/")) {
      filePath = join(root, "index.html");
      const data = await readFile(filePath);
      response.writeHead(200, { "content-type": mime[".html"], "cache-control": "no-store" });
      response.end(data);
      return;
    }
    response.writeHead(404).end("Not found");
  }
}

const server = createServer(async (request, response) => {
  try {
    const parsedUrl = new URL(request.url, "http://localhost:3000");
    if (parsedUrl.pathname.startsWith("/api/")) {
      await replayApi(request, response, parsedUrl);
      return;
    }
    await serveStatic(response, parsedUrl.pathname);
  } catch (error) {
    console.error(error?.stack ?? error);
    response.writeHead(500, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ error: error.message }));
  }
});

const port = Number(process.env.PORT || 3000);
server.listen(port, "127.0.0.1", () => {
  console.log(`Fleet mirror: http://localhost:${port}/fleet/ (offline)`);
});
