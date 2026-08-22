import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const target = resolve(import.meta.dirname, "../html/fleet/assets/MgmtCompanyView-CAi5Vgwv.js");
const cacheBustedTarget = resolve(import.meta.dirname, "../html/fleet/assets/MgmtCompanyView-CAi5Vgwv-local-v2.js");
const entryTarget = resolve(import.meta.dirname, "../html/fleet/assets/index-dGkWfo-f.js");
const source = await readFile(target, "utf8");
const needle = "e.value.company.companyName=n.company.companyName,e.value.company.leaderUserId=n.company.leaderUserId});";
const replacement = "e.value.company.companyName=n.company.companyName,e.value.company.leaderUserId=n.company.leaderUserId,e.value.company.startTime=n.workingTime.startTime,e.value.company.endTime=n.workingTime.endTime,e.value.company.breakTime=n.workingTime.breakTime,e.value.company.timezoneId=n.workingTime.timezoneId,e.value.company.holidayWork=n.workingTime.holidayWork,e.value.company.holidays=[...n.holidays]});";

if (source.includes(replacement)) {
  console.log("Fleet company modal patch is already applied.");
} else if (!source.includes(needle)) {
  throw new Error("Fleet company modal patch point was not found.");
} else {
  await writeFile(target, source.replace(needle, replacement), "utf8");
  console.log("Patched Fleet company working-time initialization.");
}

let patchedSource = (await readFile(target, "utf8")).replace(needle, replacement);
const directSaveStart = patchedSource.indexOf("async function S(){");
const directSaveEnd = patchedSource.indexOf("function v(){", directSaveStart);
if (directSaveStart < 0 || directSaveEnd < 0) {
  throw new Error("Fleet company save function was not found.");
}
const directSave = `async function S(){
  const o=e.value.company.companyName,a=e.value.company.leaderUserId;
  if(!o||!a){k.error(t("linq.10323",{value:t(!o?"linq.00187":"linq.00191")}),{position:"top",duration:2e3});return}
  const i=await m(o,a,e.value.company.startTime||n.workingTime.startTime,e.value.company.endTime||n.workingTime.endTime,e.value.company.breakTime??n.workingTime.breakTime,e.value.company.timezoneId||n.workingTime.timezoneId,e.value.company.holidays||n.holidays,e.value.company.holidayWork??n.workingTime.holidayWork);
  i.result?(k.success(t("linq.10316"),{position:"top",duration:3e3}),s("close",!0)):k.error(t("linq.10318",{value:i.msg}),{position:"top",duration:3e3})
}`;
patchedSource = patchedSource.slice(0, directSaveStart) + directSave + patchedSource.slice(directSaveEnd);
await writeFile(cacheBustedTarget, patchedSource, "utf8");
const entrySource = await readFile(entryTarget, "utf8");
const possibleImports = ["MgmtCompanyView-CAi5Vgwv.js", "MgmtCompanyView-CAi5Vgwv-local.js"];
const localImport = "MgmtCompanyView-CAi5Vgwv-local-v2.js";
if (!possibleImports.some((name) => entrySource.includes(name)) && !entrySource.includes(localImport)) {
  throw new Error("Fleet company modal dynamic import was not found.");
}
let updatedEntrySource = entrySource;
for (const name of possibleImports) updatedEntrySource = updatedEntrySource.replaceAll(name, localImport);
await writeFile(entryTarget, updatedEntrySource, "utf8");
console.log("Activated cache-busted Fleet company modal bundle.");
