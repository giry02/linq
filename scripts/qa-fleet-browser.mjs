const cdpPort = 9223;
const baseUrl = process.env.QA_BASE_URL || "http://localhost:3000/fleet/ko/";
const qaUser = process.env.QA_USER || "offline-admin";
const qaPassword = process.env.QA_PASSWORD || "offline-preview";

async function createTab(url = "about:blank") {
  const response = await fetch(`http://127.0.0.1:${cdpPort}/json/new?${encodeURIComponent(url)}`, { method: "PUT" });
  if (!response.ok) throw new Error(`Could not create browser tab: ${response.status}`);
  return response.json();
}

function connect(webSocketDebuggerUrl) {
  const socket = new WebSocket(webSocketDebuggerUrl);
  let nextId = 0;
  const waiting = new Map();
  const events = new Map();

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const waiter = waiting.get(message.id);
      if (!waiter) return;
      waiting.delete(message.id);
      if (message.error) waiter.reject(new Error(message.error.message));
      else waiter.resolve(message.result);
      return;
    }
    const handlers = events.get(message.method) ?? [];
    handlers.forEach((handler) => handler(message.params));
  });

  const ready = new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  async function send(method, params = {}) {
    await ready;
    const id = ++nextId;
    const response = new Promise((resolve, reject) => waiting.set(id, { resolve, reject }));
    socket.send(JSON.stringify({ id, method, params }));
    return response;
  }
  function once(method, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Timeout waiting for ${method}`)), timeoutMs);
      const handler = (params) => {
        clearTimeout(timer);
        const handlers = events.get(method) ?? [];
        events.set(method, handlers.filter((candidate) => candidate !== handler));
        resolve(params);
      };
      events.set(method, [...(events.get(method) ?? []), handler]);
    });
  }
  return { send, once, close: () => socket.close() };
}

async function evaluate(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function navigate(cdp, url) {
  void cdp.send("Page.navigate", { url }).catch(() => {});
  await new Promise((resolve) => setTimeout(resolve, 2600));
}

const tab = await createTab();
const cdp = connect(tab.webSocketDebuggerUrl);
await cdp.send("Page.enable");
await cdp.send("Runtime.enable");

await navigate(cdp, `${baseUrl}login`);
await evaluate(
  cdp,
  `(async()=>{
    const inputs=[...document.querySelectorAll('input')];
    const id=inputs.find(input=>/id|email/i.test(input.type+' '+input.name+' '+input.placeholder))??inputs[0];
    const password=inputs.find(input=>input.type==='password')??inputs[1];
    const set=(element,value)=>{const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(element,value);element.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:value}));element.dispatchEvent(new Event('change',{bubbles:true}));};
    set(id,${JSON.stringify(qaUser)});set(password,${JSON.stringify(qaPassword)});
    await new Promise(resolve=>setTimeout(resolve,100));
    (document.querySelector('button[type=submit]')??[...document.querySelectorAll('button')].find(button=>button.textContent.trim()==='로그인')).click();
    await new Promise(resolve=>setTimeout(resolve,3500));
    return location.href;
  })()`,
);

const routes = [
  ["dashboard", "page/dashboard/equip", ["보유현황", "기본그룹"]],
  ["group dashboard", "page/dashboard/company", ["보유현황"]],
  ["widget dashboard", "page/dashboard/widget", ["대시보드"]],
  ["vehicle list", "page/equip/list/group/1933/1948", ["FBA32", "기본그룹"]],
  ["vehicle detail", "page/equip/detail/equip/1933/1948/FBA32_224250271", ["FBA32_224250271"]],
  ["analysis summary", "page/anlz/summary/group/1933/1948", ["FBA32", "운영효율"]],
  ["analysis calendar", "page/anlz/calendar/group/1933/1948", ["작업시간", "대기시간"]],
  ["analysis operating", "page/anlz/operate/group/1933/1948", ["TOP5", "FBA32"]],
  ["analysis shock", "page/anlz/shock/group/1933/1948", ["민감", "주의", "경고"]],
  ["analysis fuel", "page/anlz/fuel/group/1933/1948", ["연료", "소모"]],
  ["lead battery", "page/anlz/battery/la/group/1933/1948", []],
  ["lithium", "page/anlz/battery/li/group/1933/1948", ["리튬", "FBA32"]],
  ["hydrogen", "page/anlz/battery/hydrogen/group/1933/1948", ["데이터가 존재하지 않습니다"]],
  ["service", "page/srvc/list/group/1933/1948", ["서비스", "기본그룹"]],
  ["service maintenance", "page/srvc/maintenance/group/1933/1948", ["정비이력"]],
  ["service supplies", "page/srvc/supplies/group/1933/1948", ["소모품"]],
  ["service equipment errors", "page/srvc/equipError/group/1933/1948", ["차량에러"]],
  ["service battery errors", "page/srvc/batteryError/group/1933/1948", ["배터리에러"]],
  ["report status", "page/rpt/area/status?groupId=1948&periodTypeCode=monthly&startDate=20260801", ["근무현황", "16"]],
  ["report comparison", "page/rpt/area/comparison?groupIds=1948&groupIds=34304&periodTypeCode=monthly&startDate=20260801&endDate=20260813", ["그룹별 비교", "기본그룹", "테스트그룹"]],
  ["report heatmap", "page/rpt/area/hitmap?groupIds=1948&groupIds=34304&periodTypeCode=monthly&startDate=20260801&endDate=20260813", ["히트맵", "기본그룹", "테스트그룹"]],
  ["management users", "page/mgmt/user", ["사용자 ID", "권한"]],
  ["management companies", "page/mgmt/company", ["업체", "세종"]],
  ["management groups", "page/mgmt/group", ["그룹", "기본그룹"]],
  ["management equipment", "page/mgmt/equip", ["차량", "FBA32"]],
  ["account requests", "page/mgmt/request/account", ["계정", "요청"]],
  ["equipment requests", "page/mgmt/request/equip", ["차량", "요청"]],
  ["geofence", "page/mgmt/geofence/1948", ["Geofence"]],
  ["map", "page/maps/roadmap/group/1933/1948", ["기본그룹"]],
  ["satellite map", "page/maps/satellite/group/1933/1948", ["기본그룹"]],
];

const routeFilter = process.env.QA_ROUTES ? new RegExp(process.env.QA_ROUTES, "i") : null;
const selectedRoutes = routeFilter ? routes.filter(([name]) => routeFilter.test(name)) : routes;
const results = [];
for (const [name, route, expected] of selectedRoutes) {
  console.error(`QA START ${name}`);
  await navigate(cdp, baseUrl + route);
  const state = await evaluate(
    cdp,
    `(()=>({url:location.href,title:document.title,text:(document.body?.innerText??'').replace(/\\s+/g,' ').trim(),canvases:document.querySelectorAll('canvas').length,images:[...document.images].filter(image=>image.complete&&image.naturalWidth>0).length,brokenImages:[...document.images].filter(image=>image.complete&&image.naturalWidth===0).length,mapFallback:!!document.querySelector('#map[data-offline-fallback=true]')}))()`,
  );
  const missingText = expected.filter((text) => !state.text.toLowerCase().includes(text.toLowerCase()));
  results.push({
    name,
    route,
    ok: state.text.length > 120 && missingText.length === 0,
    textLength: state.text.length,
    missingText,
    canvases: state.canvases,
    images: state.images,
    brokenImages: state.brokenImages,
    mapFallback: state.mapFallback,
    preview: state.text.slice(0, 260),
  });
  console.error(`QA END ${name}`);
}

console.log(JSON.stringify(results, null, 2));
cdp.close();
if (results.some((result) => !result.ok)) process.exitCode = 1;
