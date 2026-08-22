import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const port = Number(process.env.CDP_PORT || 9224);
const user = process.env.FLEET_USER;
const password = process.env.FLEET_PASSWORD;
const site = process.env.MAP_CAPTURE_SITE || "fleet";
if (!new Set(["fleet", "dealer"]).has(site)) throw new Error(`Unsupported site: ${site}`);
const mapRoute =
  process.env.FLEET_MAP_ROUTE ||
  (site === "dealer"
    ? "/fleet/ko/page/maps/roadmap/company/151"
    : "/fleet/ko/page/maps/roadmap/group/1933/1948");
const outputName = process.env.FLEET_MAP_OUTPUT || "live-map-fallback.png";
if (!user || !password) throw new Error("FLEET_USER and FLEET_PASSWORD are required.");

const response = await fetch(
  `http://127.0.0.1:${port}/json/new?${encodeURIComponent("about:blank")}`,
  { method: "PUT" },
);
const tab = await response.json();
const socket = new WebSocket(tab.webSocketDebuggerUrl);
let nextId = 0;
const waiting = new Map();
const events = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const waiter = waiting.get(message.id);
    waiting.delete(message.id);
    if (message.error) waiter.reject(new Error(message.error.message));
    else waiter.resolve(message.result);
    return;
  }
  (events.get(message.method) ?? []).forEach((handler) => handler(message.params));
});
await new Promise((resolveReady, reject) => {
  socket.addEventListener("open", resolveReady, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

function send(method, params = {}) {
  const id = ++nextId;
  const promise = new Promise((resolveResponse, reject) =>
    waiting.set(id, { resolve: resolveResponse, reject }),
  );
  socket.send(JSON.stringify({ id, method, params }));
  return promise;
}
function once(method, timeoutMs = 20000) {
  return new Promise((resolveEvent, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout waiting for ${method}`)), timeoutMs);
    const handler = (params) => {
      clearTimeout(timer);
      events.set(method, (events.get(method) ?? []).filter((candidate) => candidate !== handler));
      resolveEvent(params);
    };
    events.set(method, [...(events.get(method) ?? []), handler]);
  });
}
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}
async function navigate(url, delay = 3000) {
  const loaded = once("Page.loadEventFired");
  await send("Page.navigate", { url });
  await loaded;
  await new Promise((resolveDelay) => setTimeout(resolveDelay, delay));
}

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 1800,
  height: 1000,
  deviceScaleFactor: 1,
  mobile: false,
});
await navigate("https://machineiq.bobcat.com/fleet/ko/login");
await evaluate(`(async()=>{
  const inputs=[...document.querySelectorAll('input')];
  const id=inputs.find(input=>input.type==='text');
  const password=inputs.find(input=>input.type==='password');
  const set=(element,value)=>{const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(element,value);element.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:value}));element.dispatchEvent(new Event('change',{bubbles:true}));};
  set(id,${JSON.stringify(user)});set(password,${JSON.stringify(password)});
  await new Promise(resolve=>setTimeout(resolve,100));
  const loginButton=[...document.querySelectorAll('button')].find(button=>button.textContent.trim()==='로그인')||document.querySelector('button[type="submit"]');
  if(!loginButton) throw new Error('Login button not found');
  loginButton.click();
  await new Promise(resolve=>setTimeout(resolve,4500));
})()`);
await navigate(`https://machineiq.bobcat.com${mapRoute}`, 6000);
const mapState = await evaluate(
  `(()=>{const map=document.querySelector('#map');const rect=map?.getBoundingClientRect();return {error:!!document.querySelector('.gm-err-container'),rect:rect?{x:rect.x,y:rect.y,width:rect.width,height:rect.height,scale:1}:null,text:document.body.innerText.slice(0,500)}})()`,
);
if (!mapState.rect || mapState.error) {
  throw new Error(`Live map did not render: ${JSON.stringify(mapState)}`);
}
const screenshot = await send("Page.captureScreenshot", {
  format: "png",
  fromSurface: true,
  captureBeyondViewport: true,
  clip: mapState.rect,
});
const output = resolve("html", site, "assets", "images", outputName);
await writeFile(output, Buffer.from(screenshot.data, "base64"));
console.log(JSON.stringify({ output, ...mapState }, null, 2));
socket.close();
