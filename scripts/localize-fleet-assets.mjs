import { createHash } from "node:crypto";
import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

const workspaceRoot = resolve(import.meta.dirname, "..");
const site = process.env.LOCALIZE_SITE || "fleet";
if (!new Set(["fleet", "dealer"]).has(site)) throw new Error(`Unsupported site: ${site}`);
const siteBase = `/${site}`;
const fleetRoot = join(workspaceRoot, "html", site);
const assetRoot = join(fleetRoot, "assets");
const fontRoot = join(assetRoot, "fonts");
const imageRoot = join(assetRoot, "images");
const fixtureRoot = join(fleetRoot, site === "dealer" ? "dealer-data" : "fleet-data");

const googleFontCssUrls = [
  "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Open+Sans:wght@300;400;500;700;900&display=swap",
  "https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap",
];
const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36";
const fontImportPattern = /@import\s*["']https:\/\/fonts\.googleapis\.com\/css2\?[^"']+["'];?/g;

async function fetchBytes(url) {
  const response = await fetch(url, { headers: { "user-agent": userAgent } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

async function runPool(items, concurrency, action) {
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      await action(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
}

await mkdir(fontRoot, { recursive: true });
await mkdir(imageRoot, { recursive: true });

const fontCssSources = await Promise.all(
  googleFontCssUrls.map(async (url) => {
    const response = await fetch(url, { headers: { "user-agent": userAgent } });
    if (!response.ok) throw new Error(`${response.status} ${url}`);
    return response.text();
  }),
);
const fontUrls = [...new Set(fontCssSources.flatMap((css) => [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map((match) => match[1])))];
const localFontByUrl = new Map(
  fontUrls.map((url) => {
    const suffix = extname(new URL(url).pathname) || ".woff2";
    const name = `${createHash("sha256").update(url).digest("hex").slice(0, 20)}${suffix}`;
    return [url, `${siteBase}/assets/fonts/${name}`];
  }),
);

await runPool(fontUrls, 24, async (url) => {
  const localUrl = localFontByUrl.get(url);
  await writeFile(join(fontRoot, localUrl.split("/").at(-1)), await fetchBytes(url));
});

const localFontCss = fontCssSources
  .join("\n")
  .replace(/https:\/\/fonts\.gstatic\.com\/[^)]+/g, (url) => localFontByUrl.get(url) ?? url);
await writeFile(join(assetRoot, "local-fonts.css"), localFontCss, "utf8");

for (const name of await readdir(assetRoot)) {
  if (!name.endsWith(".css") || name === "local-fonts.css") continue;
  const path = join(assetRoot, name);
  const source = await readFile(path, "utf8");
  const localized = source.replace(fontImportPattern, "");
  if (localized !== source) await writeFile(path, localized, "utf8");
}

const indexPath = join(fleetRoot, "index.html");
let indexHtml = await readFile(indexPath, "utf8");
if (!indexHtml.includes(`${siteBase}/assets/local-fonts.css`)) {
  indexHtml = indexHtml.replace(
    "</head>",
    `    <link rel="stylesheet" href="${siteBase}/assets/local-fonts.css">\n  </head>`,
  );
  await writeFile(indexPath, indexHtml, "utf8");
}

const modelImageUrls = new Set();
for (const name of await readdir(fixtureRoot)) {
  if (!name.endsWith(".json")) continue;
  const path = join(fixtureRoot, name);
  const record = JSON.parse((await readFile(path, "utf8")).replace(/^\uFEFF/, ""));
  const body = Buffer.from(record.body, record.bodyEncoding).toString("utf8");
  for (const match of body.matchAll(/https:\/\/d131s0by7v6n1f\.cloudfront\.net\/api\/image\/model\/[^"'\\s<>()]+/g)) {
    modelImageUrls.add(match[0]);
  }
}

const modelImageMap = new Map(
  [...modelImageUrls].map((url) => [
    url,
    `${siteBase}/assets/images/${decodeURIComponent(new URL(url).pathname.split("/").at(-1))}`,
  ]),
);
await runPool([...modelImageMap], 8, async ([remoteUrl, localUrl]) => {
  await writeFile(join(imageRoot, localUrl.split("/").at(-1)), await fetchBytes(remoteUrl));
});

let patchedFixtureCount = 0;
for (const name of await readdir(fixtureRoot)) {
  if (!name.endsWith(".json")) continue;
  const path = join(fixtureRoot, name);
  const record = JSON.parse((await readFile(path, "utf8")).replace(/^\uFEFF/, ""));
  const body = Buffer.from(record.body, record.bodyEncoding).toString("utf8");
  let localized = body;
  for (const [remoteUrl, localUrl] of modelImageMap) localized = localized.replaceAll(remoteUrl, localUrl);
  if (localized === body) continue;
  record.body = Buffer.from(localized, "utf8").toString("base64");
  await writeFile(path, JSON.stringify(record, null, 2), "utf8");
  patchedFixtureCount += 1;
}

console.log(
  JSON.stringify(
    {
      fonts: fontUrls.length,
      fontCss: `${siteBase}/assets/local-fonts.css`,
      equipmentImages: [...modelImageMap.values()],
      patchedFixtureCount,
    },
    null,
    2,
  ),
);
