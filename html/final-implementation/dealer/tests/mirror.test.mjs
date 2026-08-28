import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readdir, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");
const fixtureRoot = join(root, "dealer-data");

async function fixtureRecords() {
  const names = (await readdir(fixtureRoot)).filter((name) => name.endsWith(".json"));
  return Promise.all(names.map(async (name) => JSON.parse((await readFile(join(fixtureRoot, name), "utf8")).replace(/^\uFEFF/, ""))));
}

test("운영 번들과 딜러 전용 로컬 자산이 보존되어 있다", async () => {
  const workingBundle = await readFile(join(root, "assets", "index-dGkWfo-f.js"), "utf8");
  const originalBundle = await readFile(join(root, "assets", "index-dGkWfo-f.original.js"), "utf8");
  const indexHtml = await readFile(join(root, "index.html"), "utf8");
  const cssNames = (await readdir(join(root, "assets"))).filter((name) => name.endsWith(".css"));
  const cssSources = await Promise.all(cssNames.map((name) => readFile(join(root, "assets", name), "utf8")));
  const fontNames = await readdir(join(root, "assets", "fonts"));

  assert.match(workingBundle, /baseURL:"\/api"/);
  assert.match(workingBundle, /"\/dealer\//);
  assert.doesNotMatch(workingBundle, /"\/fleet\//);
  assert.doesNotMatch(workingBundle, /baseURL:"https:\/\/machineiq\.bobcat\.com\/api"/);
  assert.match(originalBundle, /baseURL:"https:\/\/machineiq\.bobcat\.com\/api"/);
  assert.match(indexHtml, /local-fonts\.css/);
  assert.match(indexHtml, /offline-map-fallback\.js/);
  assert.ok(fontNames.length >= 100, `로컬 폰트 파일 수: ${fontNames.length}`);
  assert.ok(cssSources.every((source) => !source.includes("fonts.googleapis.com")));
  for (const image of [
    "B20253032S7.jpg",
    "B2025SE7.jpg",
    "B20X-7.jpg",
    "D50607080S7.png",
    "live-map-fallback.png",
    "live-geofence-fallback.png",
  ]) {
    assert.ok((await stat(join(root, "assets", "images", image))).size > 1000, `이미지 누락: ${image}`);
  }
});

test("딜러 화면 JSON이 충분하고 운영 인증 비밀값을 포함하지 않는다", async () => {
  const records = await fixtureRecords();
  assert.ok(records.length >= 200, `fixture 수: ${records.length}`);
  const paths = new Set(records.map((record) => record.path.split("?")[0]));
  for (const required of [
    "/common/auth/fleet/authenticate",
    "/common/user/user",
    "/menu/FLEET",
    "/fleet/management/company/summary-operation",
    "/fleet/dashboard/summary-company-widget",
    "/fleet/analysis/summary/company/151",
    "/fleet/analysis/operating/ranking/company/151",
    "/fleet/service/services",
    "/fleet/report/summary/company",
    "/fleet/admin/users",
    "/fleet/admin/companies",
    "/fleet/admin/equipments",
    "/fleet/admin/account/requests",
    "/fleet/admin/equipment/requests",
  ]) {
    assert.ok(paths.has(required), `누락 fixture: ${required}`);
  }

  for (const record of records) {
    const body = Buffer.from(record.body, record.bodyEncoding).toString("utf8");
    assert.doesNotMatch(body, /"password"\s*:/i);
    const tokens = body.match(/[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}/g) ?? [];
    for (const token of tokens) assert.ok(token.endsWith(".offline"), `운영 JWT 서명 발견: ${record.path}`);
  }
});

test("딜러 로컬 서버가 운영 연결 없이 화면과 JSON을 재생한다", async (context) => {
  const port = 3218;
  const tempRoot = await mkdtemp(join(tmpdir(), "linq-dealer-test-"));
  const testChangesPath = join(tempRoot, "local-changes.json");
  const child = spawn(process.execPath, ["server.mjs"], {
    cwd: root,
    env: { ...process.env, PORT: String(port), LOCAL_CHANGES_PATH: testChangesPath },
    stdio: ["ignore", "pipe", "pipe"],
  });
  context.after(() => child.kill());
  context.after(() => rm(tempRoot, { recursive: true, force: true }));

  await new Promise((resolveReady, reject) => {
    const timer = setTimeout(() => reject(new Error("로컬 딜러 서버 시작 시간 초과")), 5000);
    child.stdout.once("data", () => {
      clearTimeout(timer);
      resolveReady();
    });
    child.once("exit", (code) => reject(new Error(`로컬 딜러 서버 종료: ${code}`)));
  });

  const page = await fetch(`http://127.0.0.1:${port}/dealer/ko/page/mgmt/dashboard/company/151`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /index-dGkWfo-f\.js/);

  const login = await fetch(`http://127.0.0.1:${port}/api/common/auth/fleet/authenticate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "offline", password: "offline-preview" }),
  });
  assert.equal(login.status, 200);
  const loginPayload = await login.json();
  assert.equal(loginPayload.code, "00");
  assert.ok(loginPayload.result.access_token.endsWith(".offline"));

  const currentDateSummary = await fetch(
    `http://127.0.0.1:${port}/api/fleet/analysis/summary/company/151?startDate=20260801&endDate=20260814`,
  );
  assert.equal(currentDateSummary.status, 200);
  const currentDateSummaryPayload = await currentDateSummary.json();
  assert.equal(currentDateSummaryPayload.code, "00");
  assert.equal(currentDateSummaryPayload.result.companyId, 151);

  const currentDateEquipment = await fetch(
    `http://127.0.0.1:${port}/api/fleet/analysis/summary-equipment-company?companyId=151&startDate=20260801&endDate=20260814&pageNo=1&pageSize=20`,
  );
  assert.equal(currentDateEquipment.status, 200);
  const currentDateEquipmentPayload = await currentDateEquipment.json();
  assert.ok(currentDateEquipmentPayload.result.length > 0);

  const datedRoutes = (await fixtureRecords()).filter(
    (record) => record.method === "GET" && /[?&](startDate|endDate)=/.test(record.path),
  );
  for (const record of datedRoutes) {
    const datedUrl = new URL(record.path, "http://offline.local");
    if (datedUrl.searchParams.has("startDate")) datedUrl.searchParams.set("startDate", "20990101");
    if (datedUrl.searchParams.has("endDate")) datedUrl.searchParams.set("endDate", "20991231");
    const replay = await fetch(`http://127.0.0.1:${port}/api${datedUrl.pathname}${datedUrl.search}`);
    assert.equal(replay.status, 200, `날짜 변경 재생 실패: ${record.path}`);
  }

  const completedPage = await fetch(
    `http://127.0.0.1:${port}/api/fleet/analysis/summary-equipment-company?companyId=151&startDate=20260801&endDate=20260814&pageNo=3&pageSize=20`,
  );
  assert.equal(completedPage.status, 200);
  assert.deepEqual((await completedPage.json()).result, []);

  for (const fallbackPath of [
    "/fleet/analysis/hi/stat/company/151?pageNo=1&pageSize=20",
    "/fleet/service/ocses?companyId=151&groupId=&equipmentId=&startDate=20260801&endDate=20260814&periodTypeCode=monthly&pageNo=1&pageSize=20&sortCol=regDatetime%20DESC",
    "/fleet/admin/account/requests",
    "/fleet/admin/equipment/requests",
  ]) {
    const fallbackResponse = await fetch(`http://127.0.0.1:${port}/api${fallbackPath}`);
    assert.equal(fallbackResponse.status, 200);
    assert.ok((await fallbackResponse.json()).result.length > 0, `Page 1 보완 데이터 누락: ${fallbackPath}`);
  }

  const summary = await fetch(
    `http://127.0.0.1:${port}/api/dealer/management/company/summary-operation?startDate=20260801&endDate=20260831&companyId=&dealerCompanyId=151&rentalCompanyId=`,
  );
  assert.equal(summary.status, 200);
  assert.equal((await summary.json()).code, "00");

  const edit = await fetch(`http://127.0.0.1:${port}/api/fleet/admin/user/youngmin.sim%40doosan.com`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ userName: "로컬 수정 확인", telno: "01000000000" }),
  });
  assert.equal(edit.status, 200);
  const editPayload = await edit.json();
  assert.equal(editPayload.code, "00");
  assert.equal(editPayload.localOnly, true);
  const savedChanges = JSON.parse(await readFile(testChangesPath, "utf8"));
  assert.equal(savedChanges.mutations.length, 1);
  assert.equal(savedChanges.mutations[0].body.userName, "로컬 수정 확인");

  const serverSource = await readFile(join(root, "server.mjs"), "utf8");
  assert.doesNotMatch(serverSource, /machineiq\.bobcat\.com\/api|captureApi|captureMode/);
});
