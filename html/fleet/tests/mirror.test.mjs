import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readdir, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");
const fleetRoot = root;
const fixtureRoot = join(root, "fleet-data");

async function fixtureRecords() {
  const names = (await readdir(fixtureRoot)).filter((name) => name.endsWith(".json"));
  return Promise.all(
    names.map(async (name) => JSON.parse((await readFile(join(fixtureRoot, name), "utf8")).replace(/^\uFEFF/, ""))),
  );
}

test("운영 번들과 로컬 자산이 보존되어 있다", async () => {
  const workingBundle = await readFile(join(fleetRoot, "assets", "index-dGkWfo-f.js"), "utf8");
  const originalBundle = await readFile(join(fleetRoot, "assets", "index-dGkWfo-f.original.js"), "utf8");
  const indexHtml = await readFile(join(fleetRoot, "index.html"), "utf8");
  const cssNames = (await readdir(join(fleetRoot, "assets"))).filter((name) => name.endsWith(".css"));
  const cssSources = await Promise.all(cssNames.map((name) => readFile(join(fleetRoot, "assets", name), "utf8")));
  const fontNames = await readdir(join(fleetRoot, "assets", "fonts"));

  assert.match(workingBundle, /baseURL:"\/api"/);
  assert.doesNotMatch(workingBundle, /baseURL:"https:\/\/machineiq\.bobcat\.com\/api"/);
  assert.match(originalBundle, /baseURL:"https:\/\/machineiq\.bobcat\.com\/api"/);
  assert.match(indexHtml, /local-fonts\.css/);
  assert.match(indexHtml, /offline-map-fallback\.js/);
  assert.ok(fontNames.length >= 100, `폰트 파일 수: ${fontNames.length}`);
  assert.ok(cssSources.every((source) => !source.includes("fonts.googleapis.com")));
  assert.ok((await stat(join(fleetRoot, "assets", "images", "B20253032S7.jpg"))).size > 1000);
  assert.ok((await stat(join(fleetRoot, "assets", "images", "live-map-fallback.png"))).size > 10000);
  assert.ok((await stat(join(fleetRoot, "assets", "images", "live-geofence-fallback.png"))).size > 10000);
});

test("fixture가 충분하고 운영 인증 비밀값을 포함하지 않는다", async () => {
  const records = await fixtureRecords();
  assert.ok(records.length >= 120, `fixture 수: ${records.length}`);
  const paths = new Set(records.map((record) => record.path.split("?")[0]));
  for (const required of [
    "/common/auth/fleet/authenticate",
    "/fleet/dashboard/summary",
    "/fleet/dashboard/summary-group-widget",
    "/fleet/widgets",
    "/fleet/userWidgets",
    "/fleet/management/equipment/category",
    "/fleet/analysis/li/stat/group/1948",
    "/fleet/report/summary",
    "/fleet/service/schedules",
    "/fleet/admin/users",
    "/fleet/admin/companies",
    "/fleet/admin/groups",
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

test("로컬 서버가 정적 화면과 JSON API만 재생한다", async (context) => {
  const port = 3217;
  const tempRoot = await mkdtemp(join(tmpdir(), "linq-fleet-test-"));
  const testChangesPath = join(tempRoot, "local-changes.json");
  const child = spawn(process.execPath, ["server.mjs"], {
    cwd: root,
    env: { ...process.env, PORT: String(port), LOCAL_CHANGES_PATH: testChangesPath },
    stdio: ["ignore", "pipe", "pipe"],
  });
  context.after(() => child.kill());
  context.after(() => rm(tempRoot, { recursive: true, force: true }));

  await new Promise((resolveReady, reject) => {
    const timer = setTimeout(() => reject(new Error("로컬 서버 시작 시간 초과")), 5000);
    child.stdout.once("data", () => {
      clearTimeout(timer);
      resolveReady();
    });
    child.once("exit", (code) => reject(new Error(`로컬 서버 종료: ${code}`)));
  });

  const page = await fetch(`http://127.0.0.1:${port}/fleet/ko/page/dashboard/equip`);
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
    `http://127.0.0.1:${port}/api/fleet/analysis/summary/group/1948?startDate=20260801&endDate=20260814`,
  );
  assert.equal(currentDateSummary.status, 200);
  const currentDateSummaryPayload = await currentDateSummary.json();
  assert.equal(currentDateSummaryPayload.code, "00");
  assert.equal(currentDateSummaryPayload.result.groupId, 1948);

  const currentDateEquipment = await fetch(
    `http://127.0.0.1:${port}/api/fleet/analysis/summary-equipment-group?groupId=1948&startDate=20260801&endDate=20260814&pageNo=1&pageSize=20`,
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
    `http://127.0.0.1:${port}/api/fleet/analysis/summary-equipment-group?groupId=1948&startDate=20260801&endDate=20260814&pageNo=3&pageSize=20`,
  );
  assert.equal(completedPage.status, 200);
  assert.deepEqual((await completedPage.json()).result, []);

  for (const fallbackPath of [
    "/fleet/analysis/hi/stat/group/1948?pageNo=1&pageSize=10",
    "/fleet/service/ocses?endDate=20260814&equipmentId=&groupId=1948&pageNo=1&pageSize=10&periodTypeCode=monthly&sortCol=groupName%20DESC&startDate=20260801",
    "/fleet/service/errors/battery?endDate=20260814&equipmentId=&groupId=1948&pageNo=1&pageSize=10&periodTypeCode=monthly&startDate=20260801",
    "/fleet/admin/account/requests",
  ]) {
    const fallbackResponse = await fetch(`http://127.0.0.1:${port}/api${fallbackPath}`);
    assert.equal(fallbackResponse.status, 200);
    assert.ok((await fallbackResponse.json()).result.length > 0, `Page 1 보완 데이터 누락: ${fallbackPath}`);
  }

  const edit = await fetch(`http://127.0.0.1:${port}/api/fleet/admin/user/testcbcust`, {
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
  assert.doesNotMatch(serverSource, /machineiq\.bobcat\.com\/api|captureMode|captureApi/);
});
