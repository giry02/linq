import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const site = process.env.QA_SITE === "dealer" ? "dealer" : "fleet";
const port = Number(process.env.QA_PORT || (site === "dealer" ? 3001 : 3000));
const cdpPort = Number(process.env.CDP_PORT || 9223);
const baseUrl = `http://127.0.0.1:${port}/${site}/ko/`;
const requestedRoute = process.env.QA_ROUTE || "";
const screenshotPath = process.env.QA_SCREENSHOT || "";

const commonManagement = [
  ["management users", "page/mgmt/user", 0, false],
  ["management companies", "page/mgmt/company", 0, false],
  ["management equipment", "page/mgmt/equip", 0, false],
  ["account requests", "page/mgmt/request/account", 0, false],
  ["equipment requests", "page/mgmt/request/equip", 0, false],
];

const routes = site === "dealer"
  ? [
      ["dealer dashboard", "page/mgmt/dashboard/company/151", 0, false],
      ["dealer monitoring", "page/mgmt/monitoring/34315", 0, false],
      ["company dashboard", "page/dashboard/company", 2, false],
      ["widget dashboard", "page/dashboard/widget-company", 1, false],
      ["vehicle list", "page/equip/list/company/151", 0, false],
      ["analysis summary", "page/anlz/summary/company/151", 0, false],
      ["analysis calendar", "page/anlz/calendar/company/151", 0, false],
      ["analysis operating", "page/anlz/operate/company/151", 4, false],
      ["analysis shock", "page/anlz/shock/company/151", 2, false],
      ["analysis fuel", "page/anlz/fuel/company/151", 6, false],
      ["lithium battery", "page/anlz/battery/li/company/151", 0, false],
      ["hydrogen battery", "page/anlz/battery/hydrogen/company/151", 0, false],
      ["service all", "page/srvc/list/company/151", 0, false],
      ["service maintenance", "page/srvc/maintenance/company/151", 0, false],
      ["service supplies", "page/srvc/supplies/company/151", 0, false],
      ["service equipment errors", "page/srvc/equipError/company/151", 0, false],
      ["service battery errors", "page/srvc/batteryError/company/151", 0, false],
      ["report status", "page/rpt/company/status", 2, false],
      ["report comparison", "page/rpt/company/comparison", 2, false],
      ["report heatmap", "page/rpt/company/hitmap", 2, false],
      ["map", "page/maps/roadmap/company/151", 0, false],
      ...commonManagement,
      ["management geofence", "page/mgmt/geofence", 0, false],
    ]
  : [
      ["dashboard", "page/dashboard/equip", 2, false],
      ["widget dashboard", "page/dashboard/widget", 2, false],
      ["vehicle list", "page/equip/list/group/1933/1948", 0, false],
      ["vehicle detail", "page/equip/detail/equip/1933/1948/FBA32_224250271", 2, false],
      ["analysis summary", "page/anlz/summary/group/1933/1948", 0, false],
      ["analysis calendar", "page/anlz/calendar/group/1933/1948", 0, false],
      ["analysis operating", "page/anlz/operate/group/1933/1948", 4, false],
      ["analysis shock", "page/anlz/shock/group/1933/1948", 2, false],
      ["analysis fuel", "page/anlz/fuel/group/1933/1948", 6, false],
      ["lithium battery", "page/anlz/battery/li/group/1933/1948", 0, false],
      ["hydrogen battery", "page/anlz/battery/hydrogen/group/1933/1948", 0, false],
      ["service all", "page/srvc/list/group/1933/1948", 0, false],
      ["service maintenance", "page/srvc/maintenance/group/1933/1948", 0, false],
      ["service supplies", "page/srvc/supplies/group/1933/1948", 0, false],
      ["service equipment errors", "page/srvc/equipError/group/1933/1948", 0, false],
      ["service battery errors", "page/srvc/batteryError/group/1933/1948", 0, false],
      ["report status", "page/rpt/area/status?groupId=1948&periodTypeCode=monthly&startDate=20260801", 2, false],
      ["report comparison", "page/rpt/area/comparison?groupIds=1948&groupIds=34304&periodTypeCode=monthly&startDate=20260801&endDate=20260813", 2, false],
      ["report heatmap", "page/rpt/area/hitmap?groupIds=1948&groupIds=34304&periodTypeCode=monthly&startDate=20260801&endDate=20260813", 2, false],
      ["map", "page/maps/roadmap/group/1933/1948", 0, false],
      ...commonManagement,
      ["management groups", "page/mgmt/group", 0, false],
      ["management geofence", "page/mgmt/geofence/1948", 0, false],
    ];

async function createTab() {
  const response = await fetch(`http://127.0.0.1:${cdpPort}/json/new?about%3Ablank`, { method: "PUT" });
  if (!response.ok) throw new Error(`Could not create QA tab: ${response.status}`);
  return response.json();
}

function connect(webSocketDebuggerUrl) {
  const socket = new WebSocket(webSocketDebuggerUrl);
  let nextId = 0;
  const waiting = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id) return;
    const waiter = waiting.get(message.id);
    waiting.delete(message.id);
    if (message.error) waiter.reject(new Error(message.error.message));
    else waiter.resolve(message.result);
  });
  const ready = new Promise((resolveReady, reject) => {
    socket.addEventListener("open", resolveReady, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  return {
    async send(method, params = {}) {
      await ready;
      const id = ++nextId;
      const response = new Promise((resolveResponse, reject) => waiting.set(id, { resolve: resolveResponse, reject }));
      socket.send(JSON.stringify({ id, method, params }));
      return response;
    },
    close() { socket.close(); },
  };
}

async function evaluate(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}

async function navigate(cdp, url, delay = 1100) {
  await cdp.send("Page.navigate", { url });
  await new Promise((resolveDelay) => setTimeout(resolveDelay, delay));
}

const tab = await createTab();
const cdp = connect(tab.webSocketDebuggerUrl);
await cdp.send("Page.enable");
await cdp.send("Runtime.enable");
await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1800, height: 1000, deviceScaleFactor: 1, mobile: false });

await navigate(cdp, `${baseUrl}login`, 500);
await evaluate(cdp, `(async()=>{
  const inputs=[...document.querySelectorAll('input')];
  const id=inputs.find(input=>input.type==='text')||inputs[0];
  const password=inputs.find(input=>input.type==='password')||inputs[1];
  const set=(element,value)=>{const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(element,value);element.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:value}));element.dispatchEvent(new Event('change',{bubbles:true}));};
  set(id,'offline');set(password,'offline-preview');
  await new Promise(resolve=>setTimeout(resolve,80));
  (document.querySelector('button[type=submit]')||[...document.querySelectorAll('button')].find(button=>button.textContent.trim()==='로그인')).click();
  await new Promise(resolve=>setTimeout(resolve,800));
})()`);

const results = [];
const stateExpression = `(()=>{
    const visible=element=>{const style=getComputedStyle(element),rect=element.getBoundingClientRect();return style.display!=='none'&&style.visibility!=='hidden'&&rect.width>0&&rect.height>0};
    const text=(document.body?.innerText||'').replace(/\\s+/g,' ').trim();
    const noData=/데이터(가 존재하지 않습니다|가 없습니다| 없음)/.test(text);
    return {
      url:location.href,
      textLength:text.length,
      titleText:(document.querySelector('h2,h3')?.textContent||'').trim(),
      canvases:document.querySelectorAll('canvas').length,
      visibleLoaders:[...document.querySelectorAll('.spinner,[aria-busy="true"]')].filter(visible).length,
      images:document.images.length,
      brokenImages:[...document.images].filter(image=>image.complete&&image.naturalWidth===0).length,
      brokenImageSources:[...document.images].filter(image=>image.complete&&image.naturalWidth===0).map(image=>image.getAttribute('src')),
      brokenImageHtml:[...document.images].filter(image=>image.complete&&image.naturalWidth===0).map(image=>image.outerHTML),
      brokenImageContext:[...document.images].filter(image=>image.complete&&image.naturalWidth===0).map(image=>(image.parentElement?.parentElement?.innerText||'').replace(/\\s+/g,' ').trim().slice(0,180)),
      noData,
      loadingText:/Loading\.\.\.\./.test(text),
      anomalyWords:(text.match(/(^|\\s)(undefined|NaN|null)(?=\\s|$)/g)||[]).map(value=>value.trim()),
      mapFallback:!!document.querySelector('#map[data-offline-fallback="true"]'),
    };
  })()`;
for (const [name, route, canvasMin, allowNoData] of routes.filter(([, route]) => !requestedRoute || route === requestedRoute)) {
  await navigate(cdp, baseUrl + route);
  let state = await evaluate(cdp, stateExpression);
  if (state.textLength < 250) {
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 1600));
    state = await evaluate(cdp, stateExpression);
  }
  if (screenshotPath) {
    const capture = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    await writeFile(resolve(screenshotPath), Buffer.from(capture.data, "base64"));
  }
  const errors = [];
  if (!state.url.includes(`/${site}/ko/page/`)) errors.push("redirected");
  if (state.textLength < 250) errors.push("too-little-content");
  if (state.visibleLoaders) errors.push(`visible-loader:${state.visibleLoaders}`);
  if (state.loadingText) errors.push("visible-loading-text");
  if (state.brokenImages) errors.push(`broken-images:${state.brokenImages}`);
  if (state.canvases < canvasMin) errors.push(`canvas:${state.canvases}/${canvasMin}`);
  if (state.anomalyWords.length) errors.push(`anomaly:${[...new Set(state.anomalyWords)].join(",")}`);
  // A chart page can legitimately render a secondary empty-state message while
  // its primary operational data and canvases are present. Treat it as a failure
  // only when the expected chart content is also missing.
  const expectedChartsPresent = canvasMin > 0 && state.canvases >= canvasMin;
  if (state.noData && !allowNoData && !expectedChartsPresent) errors.push("unexpected-no-data");
  results.push({ name, route, ...state, allowNoData, ok: errors.length === 0, errors });
}

const report = {
  verifiedAt: new Date().toISOString(),
  site,
  total: results.length,
  passed: results.filter((result) => result.ok).length,
  failed: results.filter((result) => !result.ok).length,
  results,
};
const reportPath = resolve(`html/${site}/qa-report.json`);
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ reportPath, total: report.total, passed: report.passed, failed: report.failed, failures: results.filter((result) => !result.ok) }, null, 2));
cdp.close();
if (report.failed) process.exitCode = 1;
