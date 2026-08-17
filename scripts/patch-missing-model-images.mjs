import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../html/dealer/dealer-data/", import.meta.url);
const files = await readdir(root);
let fixtureCount = 0;
let itemCount = 0;

function patchValue(value) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) patchValue(item);
    return;
  }
  if ((value.codeName === "D50S-9" || value.equipmentName === "D50S-9") && !value.imageUrl) {
    value.imageUrl = "/dealer/assets/images/D50607080S7.png";
    value.fileName = "D50607080S7.png";
    itemCount += 1;
  }
  for (const child of Object.values(value)) patchValue(child);
}

for (const name of files) {
  if (!name.endsWith(".json")) continue;
  const path = join(root.pathname.slice(1), name);
  const record = JSON.parse(await readFile(path, "utf8"));
  if (record.contentType?.split(";")[0] !== "application/json") continue;
  const source = Buffer.from(record.body, record.bodyEncoding || "utf8").toString("utf8");
  let payload;
  try {
    payload = JSON.parse(source);
  } catch {
    continue;
  }
  const before = itemCount;
  patchValue(payload);
  if (itemCount === before) continue;
  record.bodyEncoding = "base64";
  record.body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
  await writeFile(path, `${JSON.stringify(record, null, 2)}\n`, "utf8");
  fixtureCount += 1;
}

console.log(`Patched ${itemCount} D50S-9 records in ${fixtureCount} fixtures.`);
