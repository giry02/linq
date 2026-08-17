import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const site = process.env.LINQ_CAPTURE_SITE === "fleet" ? "fleet" : "dealer";
const username = process.env.LINQ_CAPTURE_USER || process.env.LINQ_DEALER_CAPTURE_USER;
const password = process.env.LINQ_CAPTURE_PASSWORD || process.env.LINQ_DEALER_CAPTURE_PASSWORD;
const apiPath = process.argv[2];

if (!username || !password || !apiPath?.startsWith("/")) {
  throw new Error(
    "Set LINQ_CAPTURE_USER and LINQ_CAPTURE_PASSWORD, then pass an API path.",
  );
}

const apiRoot = "https://machineiq.bobcat.com/api";
const loginBody = JSON.stringify({ email: username, password });

async function postLogin(path, authorization) {
  const response = await fetch(`${apiRoot}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(authorization ? { authorization } : {}),
    },
    body: loginBody,
  });
  const payload = await response.json();
  if (!response.ok || payload.code !== "00" || !payload.result?.access_token) {
    throw new Error(`Authentication failed at ${path}: ${payload.code ?? response.status}`);
  }
  return payload.result.access_token;
}

const temporaryToken = await postLogin("/common/auth/fleet/authenticate/temp");
const accessToken = await postLogin(
  "/common/auth/fleet/authenticate",
  `Bearer ${temporaryToken}`,
);

const response = await fetch(`${apiRoot}${apiPath}`, {
  headers: { authorization: `Bearer ${accessToken}` },
});
const responseBody = Buffer.from(await response.arrayBuffer());
if (!response.ok) throw new Error(`Capture failed: HTTP ${response.status} ${apiPath}`);

const requestBody = "";
const fileName = createHash("sha256")
  .update(`GET\n${apiPath}\n${requestBody}`)
  .digest("hex");
const fixtureRoot = resolve(import.meta.dirname, `../html/${site}/${site}-data`);
await mkdir(fixtureRoot, { recursive: true });
await writeFile(
  resolve(fixtureRoot, `${fileName}.json`),
  `${JSON.stringify(
    {
      method: "GET",
      path: apiPath,
      status: response.status,
      contentType: response.headers.get("content-type") || "application/json",
      bodyEncoding: "base64",
      body: responseBody.toString("base64"),
    },
    null,
    2,
  )}\n`,
  "utf8",
);

console.log(`Captured ${site} GET ${apiPath} -> ${fileName}.json (${responseBody.length} bytes)`);
