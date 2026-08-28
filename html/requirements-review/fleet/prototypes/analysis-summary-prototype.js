const params = new URLSearchParams(location.search);
const normal = (value, note, borrowed = false) => ({ state: "normal", value, note, borrowed });

function vehicle(id, model, fuel, companyId, companyName, values = {}) {
  return {
    id, model, fuel, companyId, companyName,
    operatingRate: 48.2, efficiencyRate: 74.5, shockCnt: 0, distance: 24,
    operatingTime: "24H 12M", batteryRate: 84,
    engine: normal("정상", "냉각수·오일·압력 정상", true),
    lithium: normal("SOC 84%", "온도·전압 정상", true),
    hydrogen: normal("정상", "동급 수소 차량 기준", true),
    lead: normal("48.4V", "동급 납축 차량 기준", true),
    supplies: normal("정상", "주요 소모품 정상", true),
    errors: normal("0건", "중대 Fault 없음"),
    shock: normal("0회", "레벨 3 이상 충격 없음"),
    ...values,
  };
}

const SERVICES = {
  fleet: {
    account: "세종물류 - 관리자", companyId: "1933", companyName: "(주)세종물류중부지점", groupName: "기본그룹", defaultVehicle: "FBA32-002068",
    companies: [
      {id:"all",name:"전체차량"},
      {id:"1933",name:"(주)세종물류중부지점"},
      {id:"20119",name:"김현중"},
      {id:"167",name:"두산물류 주식회사"},
      {id:"34317",name:"두산밥캣코리아 주식회사"},
      {id:"15857",name:"두산지게차 경남중부영업소"},
      {id:"33767",name:"두산지게차 경남중부판매 주식회사"},
      {id:"11214",name:"두산지게차 마창영업소"},
      {id:"6057",name:"에스엔케이중공업"},
      {id:"364",name:"온양지게차(호성건설중기)"},
      {id:"12894",name:"중원건기"},
      {id:"20289",name:"창녕지게차"},
      {id:"20106",name:"창원중기"},
      {id:"20120",name:"최재민"},
      {id:"3703",name:"태형금속공업(주)"},
      {id:"7690",name:"팔팔지게차서비스"},
      {id:"8246",name:"한일중기(주)"},
    ],
    vehicles: [
      vehicle("FBA32_224250271","B30S-7","리튬","1933","(주)세종물류중부지점",{operatingRate:45.9,efficiencyRate:92.1,shockCnt:1,distance:74,operatingTime:"33H 1M",batteryRate:84}),
      vehicle("FBA32_224250383","B30S-7","리튬","1933","(주)세종물류중부지점",{operatingRate:44.2,efficiencyRate:68.4,distance:21,operatingTime:"13H",batteryRate:81}),
      vehicle("FBA32-002038","B30S-7","리튬","1933","(주)세종물류중부지점",{operatingRate:52.8,efficiencyRate:86.9,distance:62,operatingTime:"29H",batteryRate:88}),
      vehicle("FBA32-002039","B30S-7","리튬","1933","(주)세종물류중부지점",{operatingRate:66.1,efficiencyRate:59.4,shockCnt:2,distance:1177,operatingTime:"1463H",batteryRate:74}),
      vehicle("FBA32-002040","B30S-7","리튬","1933","(주)세종물류중부지점",{operatingRate:63.2,efficiencyRate:57.8,distance:1102,operatingTime:"1598H",batteryRate:79}),
      vehicle("FBA32-002043","B30S-7","리튬","1933","(주)세종물류중부지점",{operatingRate:0,efficiencyRate:0,distance:0,operatingTime:"0H",batteryRate:67}),
      vehicle("FBA32-002044","B30S-7","리튬","1933","(주)세종물류중부지점",{operatingRate:58.7,efficiencyRate:65.5,distance:815,operatingTime:"831H",batteryRate:82}),
      vehicle("FBA32-002045","B30S-7","리튬","1933","(주)세종물류중부지점",{operatingRate:0,efficiencyRate:0,distance:0,operatingTime:"0H",batteryRate:65}),
      vehicle("FBA32-002065","B30S-7","리튬","1933","(주)세종물류중부지점",{operatingRate:61.8,efficiencyRate:63.7,distance:717,operatingTime:"841H",batteryRate:77}),
      vehicle("FBA32-002067","B30S-7","리튬","1933","(주)세종물류중부지점",{operatingRate:64.9,efficiencyRate:54.1,distance:230,operatingTime:"459H",batteryRate:75}),
      vehicle("FBA32-002068","B30S-7","리튬","1933","(주)세종물류중부지점",{operatingRate:41.9,efficiencyRate:71.7,distance:780,operatingTime:"1193H",batteryRate:86,supplies:{state:"warning",value:"점검 18H 전",note:"유압오일 필터 교환 예정",borrowed:true}}),
      vehicle("FBA32-002069","B30S-7","리튬","1933","(주)세종물류중부지점",{operatingRate:59.4,efficiencyRate:58.6,shockCnt:1,distance:554,operatingTime:"764H",batteryRate:78}),
      vehicle("FBA32-002071","B30S-7","리튬","1933","(주)세종물류중부지점",{operatingRate:55.1,efficiencyRate:61.3,distance:491,operatingTime:"438H",batteryRate:73}),
      vehicle("FBA32-002073","B30S-7","리튬","1933","(주)세종물류중부지점",{operatingRate:60.2,efficiencyRate:55.7,distance:564,operatingTime:"498H",batteryRate:76}),
      vehicle("FBA32-002074","B30S-7","리튬","1933","(주)세종물류중부지점",{operatingRate:62.6,efficiencyRate:60.8,distance:720,operatingTime:"803H",batteryRate:83}),
      vehicle("FBA34_224030249","B35S-7","리튬","1933","(주)세종물류중부지점",{operatingRate:67.3,efficiencyRate:64.9,distance:1826,operatingTime:"593H",batteryRate:89}),
      vehicle("FBA34_224250279","B35S-7","리튬","1933","(주)세종물류중부지점",{operatingRate:69.1,efficiencyRate:66.2,shockCnt:1,distance:1889,operatingTime:"618H",batteryRate:87}),
      vehicle("FBA34-000509","B35S-7","리튬","1933","(주)세종물류중부지점",{operatingRate:0,efficiencyRate:0,distance:0,operatingTime:"0H",batteryRate:70}),
      vehicle("FBA34-000518","B35S-7","리튬","1933","(주)세종물류중부지점",{operatingRate:46.1,efficiencyRate:74.8,distance:1305,operatingTime:"1164H",batteryRate:91}),
      vehicle("FBA34-000520","B35S-7","리튬","1933","(주)세종물류중부지점",{operatingRate:42.8,efficiencyRate:57.4,distance:156,operatingTime:"168H",batteryRate:80}),
      vehicle("FBA34-000522","B35S-7","리튬","1933","(주)세종물류중부지점",{operatingRate:38.4,efficiencyRate:62.1,shockCnt:2,distance:18,operatingTime:"18H 44M",batteryRate:72}),
      vehicle("FHA30-000101","B30X-7 H2","수소","1933","(주)세종물류중부지점",{operatingRate:54.6,efficiencyRate:76.8,shockCnt:0,distance:328,operatingTime:"286H 20M",batteryRate:82,hydrogen:{state:"normal",value:"정상 · 72%",note:"수소 연료전지 및 저장 시스템 정상",borrowed:true},supplies:{state:"normal",value:"정상",note:"수소 필터·밸브 점검 상태 정상",borrowed:true}}),
      vehicle("FRA0V-001109","BR25S-9","엔진","33767","두산지게차 경남중부판매 주식회사",{operatingRate:62.3,efficiencyRate:69.4,shockCnt:249,distance:89,operatingTime:"102H 11M",batteryRate:76}),
    ],
  },
  dealer: {
    account: "두산밥캣코리아 - 관리자", companyId: "34317", companyName: "두산밥캣코리아 주식회사", groupName: "기본그룹", defaultVehicle: "FDB21-002254",
    companies: [{id:"34317",name:"두산밥캣코리아 주식회사"},{id:"33767",name:"두산지게차 경남중부판매 주식회사"},{id:"151",name:"경남중부판매 고객사"}],
    vehicles: [
      vehicle("FDB21-002254","D70S-9","엔진","34317","두산밥캣코리아 주식회사",{operatingRate:68.4,efficiencyRate:64.2,shockCnt:392,distance:106,operatingTime:"114H 23M",batteryRate:79,engine:{state:"warning",value:"냉각수 96℃",note:"냉각 계통 점검 권장",borrowed:true},supplies:{state:"warning",value:"교환 임박",note:"엔진오일 12H 이내 교환",borrowed:true},errors:{state:"warning",value:"확인 1건",note:"충격 센서 누적 이벤트",borrowed:true},shock:{state:"danger",value:"392회",note:"레벨 3 이상 충격 다수",borrowed:false}}),
      vehicle("FDB21_225380065","D70S-9","엔진","34317","두산밥캣코리아 주식회사",{operatingRate:59.8,efficiencyRate:67.1,shockCnt:242,distance:78,operatingTime:"96H 8M",batteryRate:82}),
      vehicle("FBA32_225380367","B30S-7","리튬","34317","두산밥캣코리아 주식회사",{operatingRate:52.5,efficiencyRate:77.8,shockCnt:3,distance:45,operatingTime:"72H 42M",batteryRate:90}),
      vehicle("FRA0V-001109","BR25S-9","엔진","33767","두산지게차 경남중부판매 주식회사",{operatingRate:62.3,efficiencyRate:69.4,shockCnt:249,distance:89,operatingTime:"102H 11M",batteryRate:76}),
    ],
  },
};

/* 운영 요약정보 화면에서 사용하는 차량별 상세 데이터. */
const OPTION3_ACTUAL_VEHICLES = [
  vehicle("FDB19-000122","D50S-9","엔진","12894","중원건기",{actualSource:true,operatingRate:6.2,efficiencyRate:99.5,shockCnt:0,distance:0,operatingTime:"3H 59M",batteryRate:null,fuelConsumption:"3.7L/H"}),
  vehicle("FDB19_225060343","D50S-9","엔진","12894","중원건기",{actualSource:true,prototypeEnergyRate:45,prototypeHealth:"normal",prototypeConnected:true,operatingRate:15.2,efficiencyRate:98.7,shockCnt:61,distance:5,operatingTime:"21H 56M",batteryRate:null,fuelConsumption:"4.3L/H"}),
  vehicle("FDB19_225060042","D50S-9","엔진","33767","두산지게차 경남중부판매 주식회사",{actualSource:true,operatingRate:56.4,efficiencyRate:97.2,shockCnt:430,distance:16,operatingTime:"76H 40M",batteryRate:null,fuelConsumption:"6.0L/H"}),
  vehicle("FDB21-001898","D70S-9","엔진","33767","두산지게차 경남중부판매 주식회사",{actualSource:true,operatingRate:42.6,efficiencyRate:77.5,shockCnt:2,distance:27,operatingTime:"34H 4M",batteryRate:null,fuelConsumption:"5.0L/H"}),
  vehicle("FDB21_224250294","D70S-9","엔진","12894","중원건기",{actualSource:true,operatingRate:31.3,efficiencyRate:99.3,shockCnt:23,distance:6,operatingTime:"25H 1M",batteryRate:null,fuelConsumption:"5.3L/H"}),
  vehicle("FDB21_225060126","D70S-9","엔진","12894","중원건기",{actualSource:true,operatingRate:2.1,efficiencyRate:98.3,shockCnt:0,distance:0,operatingTime:"0H 51M",batteryRate:null,fuelConsumption:"5.5L/H"}),
  vehicle("FDB21_224250450","D70S-9","엔진","12894","중원건기",{actualSource:true,operatingRate:125.4,efficiencyRate:97.2,shockCnt:241,distance:27,operatingTime:"140H 26M",batteryRate:null,fuelConsumption:"4.2L/H"}),
  vehicle("FDB21_224250307","D70S-9","엔진","12894","중원건기",{actualSource:true,operatingRate:3.4,efficiencyRate:84.5,shockCnt:0,distance:0,operatingTime:"0H 32M",batteryRate:null,fuelConsumption:"6.7L/H"}),
  vehicle("FDB21_224250283","D70S-9","엔진","12894","중원건기",{actualSource:true,operatingRate:6.2,efficiencyRate:98.1,shockCnt:23,distance:0,operatingTime:"3H 57M",batteryRate:null,fuelConsumption:"4.8L/H"}),
  vehicle("FDB21_225060005","D70S-9","엔진","33767","두산지게차 경남중부판매 주식회사",{actualSource:true,operatingRate:35.9,efficiencyRate:99.4,shockCnt:3,distance:3,operatingTime:"34H 26M",batteryRate:null,fuelConsumption:"3.1L/H"}),
  vehicle("FDB21_225060182","D70S-9","엔진","12894","중원건기",{actualSource:true,operatingRate:13.9,efficiencyRate:97,shockCnt:5,distance:4,operatingTime:"7H 49M",batteryRate:null,fuelConsumption:"4.5L/H"}),
  vehicle("FDB21_225380045","D70S-9","엔진","364","온양지게차(호성건설중기)",{actualSource:true,operatingRate:20.8,efficiencyRate:99.7,shockCnt:83,distance:240,operatingTime:"10H 0M",batteryRate:null,fuelConsumption:"7.0L/H"}),
  vehicle("FDB21_224250226","D70S-9","엔진","12894","중원건기",{actualSource:true,operatingRate:19,efficiencyRate:84.4,shockCnt:27,distance:9,operatingTime:"19H 46M",batteryRate:null,fuelConsumption:"4.4L/H"}),
  vehicle("FDB21_224250363","D70S-9","엔진","12894","중원건기",{actualSource:true,operatingRate:11.3,efficiencyRate:98.9,shockCnt:5,distance:1,operatingTime:"11H 42M",batteryRate:null,fuelConsumption:"3.5L/H"}),
  vehicle("FDB21_224250428","D70S-9","엔진","12894","중원건기",{actualSource:true,operatingRate:20.8,efficiencyRate:97.3,shockCnt:5,distance:5,operatingTime:"21H 37M",batteryRate:null,fuelConsumption:"4.6L/H"}),
  vehicle("FDB21_225060407","D70S-9","엔진","12894","중원건기",{actualSource:true,operatingRate:133.2,efficiencyRate:63.4,shockCnt:106,distance:16,operatingTime:"149H 9M",batteryRate:null,fuelConsumption:"3.9L/H"}),
  vehicle("FDB21_224250305","D70S-9","엔진","3703","태형금속공업(주)",{actualSource:true,operatingRate:34,efficiencyRate:74.7,shockCnt:1,distance:20,operatingTime:"43H 34M",batteryRate:null,fuelConsumption:"4.0L/H"}),
  vehicle("FDB21-001903","D70S-9","엔진","33767","두산지게차 경남중부판매 주식회사",{actualSource:true,operatingRate:77.3,efficiencyRate:94.7,shockCnt:196,distance:37,operatingTime:"98H 54M",batteryRate:null,fuelConsumption:"4.3L/H"}),
  vehicle("FDB21_224250275","D70S-9","엔진","12894","중원건기",{actualSource:true,operatingRate:67.4,efficiencyRate:99.5,shockCnt:0,distance:12,operatingTime:"48H 32M",batteryRate:null,fuelConsumption:"4.2L/H"}),
  vehicle("FDB21_225060095","D70S-9","엔진","33767","두산지게차 경남중부판매 주식회사",{actualSource:true,operatingRate:87.1,efficiencyRate:93.7,shockCnt:3,distance:23,operatingTime:"118H 31M",batteryRate:null,fuelConsumption:"3.4L/H"}),
  vehicle("FDB21_224030182","D70S-9","엔진","364","온양지게차(호성건설중기)",{actualSource:true,operatingRate:43.5,efficiencyRate:98,shockCnt:1,distance:2,operatingTime:"13H 55M",batteryRate:null,fuelConsumption:"3.2L/H"}),
  vehicle("FBA36_225380008","B25SE-7","납축","364","온양지게차(호성건설중기)",{actualSource:true,prototypeEnergyRate:67,prototypeHealth:"warning",prototypeConnected:false,operatingRate:300,efficiencyRate:83.1,shockCnt:46,distance:128,operatingTime:"480H 0M",batteryRate:null,fuelConsumption:"0kWh"}),
  vehicle("FBA32-002415","B30S-7","리튬","12894","중원건기",{actualSource:true,prototypeEnergyRate:80,prototypeHealth:"normal",prototypeConnected:true,operatingRate:119.6,efficiencyRate:80.7,shockCnt:0,distance:148,operatingTime:"143H 33M",batteryRate:null,fuelConsumption:"0kWh"}),
  vehicle("FBA34-000619","B35S-7","리튬","12894","중원건기",{actualSource:true,operatingRate:41.5,efficiencyRate:65.3,shockCnt:6,distance:63,operatingTime:"49H 46M",batteryRate:null,fuelConsumption:"0kWh"}),
  vehicle("FDB21_224030076","D70S-9","엔진","12894","중원건기",{actualSource:true,operatingRate:1.3,efficiencyRate:98.9,shockCnt:0,distance:0,operatingTime:"0H 6M",batteryRate:null,fuelConsumption:"4.8L/H"}),
  vehicle("FDB21-003185","D70S-9","엔진","12894","중원건기",{actualSource:true,operatingRate:78.3,efficiencyRate:99.3,shockCnt:10,distance:17,operatingTime:"93H 57M",batteryRate:null,fuelConsumption:"3.8L/H"}),
  vehicle("FDB21-002991","D70S-9","엔진","12894","중원건기",{actualSource:true,operatingRate:68.1,efficiencyRate:97,shockCnt:3,distance:22,operatingTime:"81H 46M",batteryRate:null,fuelConsumption:"5.0L/H"}),
  vehicle("FDB21-002888","D70S-9","엔진","12894","중원건기",{actualSource:true,operatingRate:229.1,efficiencyRate:97.9,shockCnt:11,distance:50,operatingTime:"256H 33M",batteryRate:null,fuelConsumption:"3.7L/H"}),
  vehicle("FDB21-002887","D70S-9","엔진","12894","중원건기",{actualSource:true,operatingRate:250,efficiencyRate:98.5,shockCnt:16,distance:63,operatingTime:"279H 57M",batteryRate:null,fuelConsumption:"3.8L/H"}),
  vehicle("FDB21_224030105","D70S-9","엔진","12894","중원건기",{actualSource:true,operatingRate:21.2,efficiencyRate:89.7,shockCnt:11,distance:3,operatingTime:"18H 40M",batteryRate:null,fuelConsumption:"5.9L/H"}),
  vehicle("FDB21-003358","D70S-9","엔진","12894","중원건기",{actualSource:true,operatingRate:69.8,efficiencyRate:98.8,shockCnt:8,distance:19,operatingTime:"61H 24M",batteryRate:null,fuelConsumption:"4.1L/H"}),
  vehicle("FDB21-002985","D70S-9","엔진","12894","중원건기",{actualSource:true,operatingRate:67,efficiencyRate:97.2,shockCnt:1,distance:20,operatingTime:"80H 22M",batteryRate:null,fuelConsumption:"4.5L/H"}),
  vehicle("FDB21-002989","D70S-9","엔진","12894","중원건기",{actualSource:true,operatingRate:49.9,efficiencyRate:98.1,shockCnt:10,distance:12,operatingTime:"51H 55M",batteryRate:null,fuelConsumption:"4.5L/H"}),
  vehicle("FDB21-003322","D70S-9","엔진","12894","중원건기",{actualSource:true,operatingRate:42.8,efficiencyRate:94.9,shockCnt:1,distance:5,operatingTime:"41H 4M",batteryRate:null,fuelConsumption:"3.5L/H"}),
  vehicle("FDB22_225060115","D80S-9","엔진","12894","중원건기",{actualSource:true,operatingRate:49.1,efficiencyRate:92.6,shockCnt:59,distance:18,operatingTime:"23H 34M",batteryRate:null,fuelConsumption:"6.3L/H"}),
  vehicle("FBA35-000988","B20SE-7","납축","12894","중원건기",{actualSource:true,operatingRate:300,efficiencyRate:99.3,shockCnt:0,distance:0,operatingTime:"480H 0M",batteryRate:null,fuelConsumption:"0kWh"}),
];
const OPTION3_ACTUAL_TOTALS = {operatingTotal:102,engine:42,lead:22,lithium:38,hydrogen:0,operatingRate:187.1,efficiencyRate:55.1,shockCnt:3217,distance:4664,operatingTime:"16,663H",fuelConsumption:"4.2L/h",batteryConsumption:"0.7kWh"};

const SECTIONS = {
  summary:"요약정보", usage:"사용시간", efficiency:"운영효율", shock:"충격", engine:"엔진 연비",
  battery:"배터리", lithium:"리튬배터리", hydrogen:"수소배터리", lead:"납축배터리", supplies:"소모품관리", errors:"차량에러",
};

const state = {
  service: SERVICES[params.get("service")] ? params.get("service") : "fleet",
  companyId: params.get("companyId") || null,
  vehicleId: params.get("equipmentId") || null,
  section: SECTIONS[params.get("section")] ? params.get("section") : "summary",
  period: "월",
  source: params.get("source") || null,
  modalVehicleId: null,
};

const $ = (s,r=document) => r.querySelector(s);
const $$ = (s,r=document) => [...r.querySelectorAll(s)];
const data = () => SERVICES[state.service];
const isTop = () => document.body.dataset.layout === "top";
const isCompactList = () => document.body.dataset.view === "compact-list";
const availableVehicles = () => {
  if(!isCompactList()) return data().vehicles.filter(v=>!v.compactOnly);
  const hydrogenPrototype=SERVICES.fleet.vehicles.find(v=>v.id==='FHA30-000101');
  return hydrogenPrototype?[...OPTION3_ACTUAL_VEHICLES,hydrogenPrototype]:[...OPTION3_ACTUAL_VEHICLES];
};
const company = () => data().companies.find(c=>c.id===state.companyId) || {id:data().companyId,name:data().companyName};
const selectedVehicle = () => availableVehicles().find(v=>v.id===state.vehicleId) || null;
const companyVehicles = () => state.companyId==="all"?availableVehicles():availableVehicles().filter(v=>v.companyId===state.companyId);
let globalVehicleSearchSubmitted = false;

function init(){
  if(!state.companyId) state.companyId=isCompactList()?'all':data().companyId;
  bind(); render(); loadBrandLogo();
}

async function loadBrandLogo(){
  try{
    const source=await fetch('../assets/IconBobcat-C0NEtM9X.js').then(r=>r.text());
    const match=source.match(/H=e\('(.*?)',29\),V=/s);
    if(!match)return;
    const logo=$('.page-head__logo');
    const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');
    icon.setAttribute('viewBox','0 0 276 37'); icon.setAttribute('aria-hidden','true');
    icon.innerHTML=match[1].replace(/\\'/g,"'");
    logo.replaceChildren(icon);
  }catch(_error){/* 로고 원본 모듈을 읽지 못하면 텍스트 로고는 유지한다. */}
}

function bind(){
  $$('[data-global]').forEach(b=>b.addEventListener('click',()=>goGlobal(b.dataset.global)));
  $$('[data-section]').forEach(b=>b.addEventListener('click',()=>goSection(b.dataset.section)));
  $$('.period-tabs button').forEach(b=>b.addEventListener('click',()=>setPeriod(b)));
  $('#selector-toggle')?.addEventListener('click',()=>{$('#selector-dock').classList.toggle('collapsed');$('#selector-toggle').textContent=$('#selector-dock').classList.contains('collapsed')?'차량 상세검색':'차량 상세검색 닫기';});
  $('#quick-company-select')?.addEventListener('change',e=>setCompany(e.target.value));
  $('#quick-vehicle-select')?.addEventListener('change',e=>e.target.value?chooseVehicle(e.target.value):clearVehicle());
  $('#vehicle-search')?.addEventListener('input',resetGlobalVehicleSearch);
  $('#vehicle-search')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();submitGlobalVehicleSearch();}});
  $('#vehicle-search-submit')?.addEventListener('click',submitGlobalVehicleSearch);
  $('#current-vehicle-search')?.addEventListener('input',renderSelectors);
  $('#vehicle-list-toggle')?.addEventListener('click',toggleVehicleList);
  $('#modal-close')?.addEventListener('click',closeModal);
  $('#modal-backdrop')?.addEventListener('click',e=>{if(e.target.id==='modal-backdrop')closeModal();});
}

function setPeriod(button){
  state.period=button.textContent.trim();
  $$('.period-tabs button').forEach(b=>b.classList.toggle('active',b===button));
  if(isCompactList()) renderCards();
}

function setCompany(id){state.companyId=id;state.vehicleId=null;state.source=null;updateUrl();render();}
function clearVehicle(){state.vehicleId=null;state.source=null;updateUrl();render();}
function chooseVehicle(id){ if(isTop()){const target=data().vehicles.find(v=>v.id===id);if(target)state.companyId=target.companyId;state.vehicleId=id;state.source='top-selector';updateUrl();render();}else openModal(id); }
function goSection(section){state.section=section;updateUrl();render();}
function goGlobal(name){if(!isTop()){state.vehicleId=null;state.source=null;}updateUrl({global:name});render();toast(isTop()&&state.vehicleId?`${state.vehicleId} 차량 기준으로 ${name} 메뉴에 연결합니다.`:`${company().name} 업체 기준으로 ${name} 메뉴에 연결합니다.`);}
function updateUrl(extra={}){const q=new URLSearchParams({service:state.service,companyId:state.companyId,section:state.section});if(state.vehicleId){q.set('equipmentId',state.vehicleId);q.set('source',state.source||'vehicle-modal');}if(extra.global)q.set('global',extra.global);history.replaceState({},'',`${location.pathname}?${q}`);}

function render(){
  $('#account').textContent=data().account;
  $('#selected-company') && ($('#selected-company').textContent=company().name);
  $('#page-title').textContent=SECTIONS[state.section];
  $('#breadcrumb-current').textContent=SECTIONS[state.section];
  $('#dataset-name').textContent=selectedVehicle()?selectedVehicle().id:data().groupName;
  $$('[data-section]').forEach(b=>b.classList.toggle('active',b.dataset.section===state.section));
  renderSelectors(); renderSummary(); renderCards();
}

function renderSelectors(){
  if($('#quick-company-select')) $('#quick-company-select').innerHTML=data().companies.map(c=>`<option value="${c.id}" ${c.id===state.companyId?'selected':''}>${c.name}</option>`).join('');
  if($('#quick-company-select')) $('#quick-company-select').title=company().name;
  if($('#quick-vehicle-select')) $('#quick-vehicle-select').innerHTML=`<option value="">차량을 선택하세요</option>${companyVehicles().map(v=>`<option value="${v.id}" ${v.id===state.vehicleId?'selected':''}>${v.id} · ${v.model}</option>`).join('')}`;
  if($('#context-pill')) $('#context-pill').textContent=selectedVehicle()?`현재 조회 · 차량 ${selectedVehicle().id}`:state.companyId==='all'?'현재 조회 · 전체차량':`현재 조회 · 업체 ${company().name}`;
  if(isTop()) renderGlobalVehicleSearch();
  const input=$('#current-vehicle-search'); const keyword=(input?.value||'').trim().toLowerCase();
  let vehicles=companyVehicles(); vehicles=vehicles.filter(v=>`${v.id} ${v.model}`.toLowerCase().includes(keyword));
  if($('#current-vehicles')) $('#current-vehicles').innerHTML=vehicles.map(v=>`<button class="side-item type2" type="button" data-vehicle="${v.id}"><em>(${fuelCode(v.fuel)}) ${v.id}</em></button>`).join('');
  $$('[data-vehicle]').forEach(b=>b.addEventListener('click',()=>chooseVehicle(b.dataset.vehicle)));
}

function resetGlobalVehicleSearch(){globalVehicleSearchSubmitted=false;renderGlobalVehicleSearch();}
function submitGlobalVehicleSearch(){
  const input=$('#vehicle-search');
  if(!input?.value.trim()){globalVehicleSearchSubmitted=false;renderGlobalVehicleSearch();input?.focus();return;}
  globalVehicleSearchSubmitted=true;
  renderGlobalVehicleSearch();
  $$('[data-vehicle]').forEach(b=>b.addEventListener('click',()=>chooseVehicle(b.dataset.vehicle)));
}
function renderGlobalVehicleSearch(){
  const input=$('#vehicle-search');
  const keyword=(input?.value||'').trim().toLowerCase().replace(/[-_\s]/g,'');
  const isSearchable=keyword.length>=5;
  const vehicles=globalVehicleSearchSubmitted&&isSearchable?availableVehicles().filter(v=>v.id.toLowerCase().replace(/[-_\s]/g,'').includes(keyword)):[];
  if($('#vehicle-result-count')) $('#vehicle-result-count').textContent=globalVehicleSearchSubmitted&&isSearchable?`조회 결과 ${vehicles.length}대`:'조회 결과';
  if($('#vehicle-strip')) $('#vehicle-strip').innerHTML=!globalVehicleSearchSubmitted
    ? '<p class="vehicle-result-guide">차량번호를 5자 이상 입력한 뒤 조회 버튼을 누르세요.</p>'
    : !isSearchable
      ? '<p class="vehicle-result-guide">차량번호를 5자 이상 입력해 주세요.</p>'
    : vehicles.length
      ? vehicles.map(v=>`<button class="${v.id===state.vehicleId?'selected':''}" type="button" data-vehicle="${v.id}"><strong>${v.id}</strong><span>${v.companyName} · ${v.model} · ${v.fuel}</span></button>`).join('')
      : '<p class="vehicle-result-empty">입력한 차량번호와 일치하는 차량이 없습니다.</p>';
}

function aggregate(sourceList){const list=sourceList?.length?sourceList:(companyVehicles().length?companyVehicles():availableVehicles());const avg=k=>list.reduce((a,v)=>a+(Number(v[k])||0),0)/list.length;return{operatingRate:avg('operatingRate'),efficiencyRate:avg('efficiencyRate'),shockCnt:list.reduce((a,v)=>a+v.shockCnt,0),distance:list.reduce((a,v)=>a+v.distance,0),operatingTime:`${Math.round(list.reduce((a,v)=>a+parseFloat(v.operatingTime),0))}H`,batteryRate:avg('batteryRate')};}
function renderSummary(){
  const compact=isCompactList();
  const batteryMode=state.section==='battery';
  const count=sectionVehicles(companyVehicles());
  const useActualOverall=compact&&state.companyId==='all'&&!selectedVehicle()&&!batteryMode;
  const s=useActualOverall?OPTION3_ACTUAL_TOTALS:selectedVehicle()||aggregate(count);
  const counts=useActualOverall
    ? {엔진:OPTION3_ACTUAL_TOTALS.engine,납축:OPTION3_ACTUAL_TOTALS.lead,리튬:OPTION3_ACTUAL_TOTALS.lithium,수소:OPTION3_ACTUAL_TOTALS.hydrogen+1}
    : {엔진:count.filter(v=>v.fuel==='엔진').length,납축:count.filter(v=>v.fuel==='납축').length,리튬:count.filter(v=>v.fuel==='리튬').length,수소:count.filter(v=>v.fuel==='수소').length};
  const vehicleText=selectedVehicle()?`${s.model} (${s.id})`:batteryMode?`리튬 ${counts.리튬}대 / 수소 ${counts.수소}대`:compact?`엔진 ${counts.엔진}대 / 납축 ${counts.납축}대 / 리튬 ${counts.리튬}대 / 수소 ${counts.수소}대`:`엔진 ${counts.엔진} 대 / 납축 ${counts.납축} 대 / 리튬 ${counts.리튬} 대 / 수소 ${counts.수소} 대`;
  const distanceText=compact?`${s.distance.toLocaleString()}km`:`${s.distance}Km`;
  const engineVehicles=count.filter(v=>v.fuel==='엔진'&&Number.isFinite(parseFloat(v.fuelConsumption)));
  const batteryVehicles=count.filter(v=>(v.fuel==='리튬'||v.fuel==='납축')&&Number.isFinite(parseFloat(v.fuelConsumption)));
  const averageConsumption=list=>list.length?list.reduce((sum,v)=>sum+parseFloat(v.fuelConsumption),0)/list.length:0;
  const fuelText=useActualOverall?OPTION3_ACTUAL_TOTALS.fuelConsumption:compact
    ? selectedVehicle()?.fuel==='엔진'?(selectedVehicle().fuelConsumption||'-').replace('L/H','L/h'):selectedVehicle()?'-':engineVehicles.length?`${averageConsumption(engineVehicles).toFixed(1)}L/h`:'-'
    : selectedVehicle()?.fuel==='엔진'?'0.0L/H':'-';
  const batteryText=useActualOverall?OPTION3_ACTUAL_TOTALS.batteryConsumption:compact
    ? selectedVehicle()?(selectedVehicle().fuel==='리튬'||selectedVehicle().fuel==='납축'?selectedVehicle().fuelConsumption||'-':'-'):batteryVehicles.length?`${averageConsumption(batteryVehicles).toFixed(1)}kWh`:'-'
    : selectedVehicle()?.fuel==='엔진'?'-':'0kWh';
  $('#summary-table').innerHTML=`<table${compact?' class="summary-one-line"':''}><thead><tr><th>차량</th><th>운영률</th><th>운영효율</th><th>충격 횟수</th><th>거리</th><th>시간</th><th>평균연료소비량</th><th>평균배터리소비량</th></tr></thead><tbody><tr><td>${vehicleText}</td><td>${s.operatingRate.toFixed(1)}%</td><td>${s.efficiencyRate.toFixed(1)}%</td><td>${s.shockCnt}</td><td>${distanceText}</td><td>${s.operatingTime}</td><td>${fuelText}</td><td>${batteryText}</td></tr></tbody></table>`;
}

function sectionVehicles(list){return state.section==='battery'?list.filter(v=>v.fuel==='리튬'||v.fuel==='수소'):list;}
function renderCards(){const list=sectionVehicles(selectedVehicle()?[selectedVehicle()]:companyVehicles());if(isCompactList()){renderCompactCards(list);return;}$('#vehicle-cards').innerHTML=list.map(v=>`<section class="content-section"><div class="content-section__container"><div class="goods-summary"><div class="goods-summary__image"><img src="../assets/images/B20253032S7.jpg" alt="${v.model}"><button class="goods-summary__location" type="button" aria-label="위치찾기">⌖</button></div><div class="goods-summary__data"><div class="goods-summary__simple"><em>${v.model} (${v.id})</em></div><div class="goods-summary__detail">${detail(v)}</div></div></div></div></section>`).join('');}
function renderCompactCards(list){
  const remaining=[...list];
  const representatives=['리튬','엔진','납축','수소'].map(f=>{
    const index=remaining.findIndex(v=>v.fuel===f);
    return index<0?null:remaining.splice(index,1)[0];
  }).filter(Boolean);
  const ordered=[...representatives,...remaining];
  const listLabel=state.section==='battery'
    ? `배터리 차량 ${ordered.length}대 <small>리튬·수소 통합 목록</small>`
    : state.companyId==='all'&&!selectedVehicle()
    ? `차량 상세 ${ordered.length}대 <small>운영 전체 ${OPTION3_ACTUAL_TOTALS.operatingTotal}대</small>`
    : `${selectedVehicle()?'선택 차량':'차량'} ${ordered.length}대`;
  const legendTypes=state.section==='battery'?['리튬','수소']:['엔진','리튬','납축','수소'];
  $('#vehicle-cards').innerHTML=`
    <div class="compact-list-head">
      <strong>${listLabel}</strong>
      <div class="fuel-legend" aria-label="동력 유형">
        ${legendTypes.map(f=>`<span><i class="fuel-icon ${fuelClass(f)}">${fuelIconSvg(f)}</i>${f}</span>`).join('')}
      </div>
    </div>
    <div class="compact-card-list">
      ${ordered.map((v,index)=>compactCard(v,index)).join('')}
    </div>`;
}
function compactCard(v,index){
  const connectionKnown=!v.actualSource||typeof v.prototypeConnected==='boolean';
  const connected=typeof v.prototypeConnected==='boolean'?v.prototypeConnected:v.operatingRate>0;
  const healthKnown=!v.actualSource||Boolean(v.prototypeHealth);
  const warning=v.prototypeHealth==='warning'||v.supplies?.state==='warning'||v.errors?.state==='warning'||v.shock?.state==='danger';
  const energyLabel=v.fuel==='엔진'?'잔여 연료':v.fuel==='수소'?'잔여 수소':'잔여 배터리';
  const energyAugmented=Number.isFinite(v.prototypeEnergyRate);
  const energyRate=energyAugmented?v.prototypeEnergyRate:v.batteryRate;
  const energyAvailable=Number.isFinite(energyRate);
  const serial=(v.id.replace(/\D/g,'').slice(-8)||String(index+1)).padStart(8,'0');
  const periodBasis=state.period==='사용자설정'?'설정 기간 기준':`${state.period} 기준`;
  const sectionItem=state.section==='battery'?(v.fuel==='수소'?v.hydrogen:v.lithium):v[state.section];
  const sectionLabel=state.section==='battery'?`${v.fuel} 배터리 상태`:SECTIONS[state.section];
  const sectionStatus=state.section!=='summary'&&sectionItem?`<div><span>${sectionLabel}</span><strong>${sectionItem.value}</strong></div>`:'';
  return `<article class="compact-vehicle-card ${fuelClass(v.fuel)}">
    <div class="compact-card__icon"><i class="fuel-icon ${fuelClass(v.fuel)}">${fuelIconSvg(v.fuel)}</i></div>
    <div class="compact-card__body">
      <div class="compact-card__head">
        <div class="compact-card__identity"><strong>${v.id}</strong><span>${v.model}</span><b class="fuel-type-badge ${fuelClass(v.fuel)}">${fuelIconSvg(v.fuel)}<span>${v.fuel}</span></b></div>
        <div class="compact-card__status">
          ${healthKnown?`<span class="health-badge ${warning?'warning':'normal'}">${warning?'점검 필요':'정상'}</span>`:'<span class="health-badge unknown">상태 정보 미제공</span>'}
          ${connectionKnown?`<span class="connection-badge ${connected?'connected':'disconnected'}">${connected?'● 연결됨':'● 연결 끊김'}</span>`:'<span class="connection-badge unknown">통신 정보 미제공</span>'}
          <span class="energy-label">${energyLabel}</span>${energyAvailable?`<i class="energy-gauge ${fuelClass(v.fuel)}"><b style="width:${Math.max(4,Math.min(100,energyRate))}%"></b></i><strong class="energy-value">${energyRate}%</strong>`:'<strong class="energy-value unavailable">-</strong>'}
        </div>
      </div>
      <div class="compact-card__info">
        <div><span>소속 업체</span><strong title="${v.companyName}">${v.companyName}</strong></div>
        <div><span>소속 그룹</span><strong>${data().groupName}</strong></div>
        <div><span>동력 유형</span><strong>${v.fuel}</strong></div>
        <div><span>누적 이동거리</span><strong>${v.distance.toLocaleString()}km</strong></div>
        <div><span>누적 가동시간</span><strong>${v.operatingTime}</strong></div>
        <div><span>TMS 단말기 Serial</span><strong>${serial}</strong></div>
      </div>
      <div class="compact-card__metrics">
        <div><span>운영률 <small class="period-basis">${periodBasis}</small></span><strong>${v.operatingRate.toFixed(1)}%</strong></div>
        <div><span>운영효율 <small class="period-basis">${periodBasis}</small></span><strong>${v.efficiencyRate.toFixed(1)}%</strong></div>
        <div><span>충격 횟수 <small class="period-basis">${periodBasis}</small></span><strong>${v.shockCnt}회</strong></div>
        <div><span>기간 이동거리 <small class="period-basis">${periodBasis}</small></span><strong>${v.distance.toLocaleString()}km</strong></div>
        <div><span>기간 가동시간 <small class="period-basis">${periodBasis}</small></span><strong>${v.operatingTime}</strong></div>
        <div><span>${v.fuel==='엔진'?'평균연료소비량':'평균배터리소비량'} <small class="period-basis">${periodBasis}</small></span><strong>${v.fuelConsumption||'-'}</strong></div>
        ${sectionStatus}
      </div>
    </div>
  </article>`;
}
function fuelClass(f){return f==='엔진'?'engine':f==='리튬'?'lithium':f==='납축'?'lead':'hydrogen';}
function fuelIconSvg(f){
  const common='viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  if(f==='엔진') return `<svg ${common}><path d="M5 9h2l2-3h6l2 3h2v8H5z"/><path d="M3 11h2m14 1h2m-14 5v2m10-2v2M10 9h4m-5 4h6"/></svg>`;
  if(f==='리튬') return `<svg ${common}><rect x="4" y="6" width="15" height="12" rx="2"/><path d="M19 10h2v4h-2M11 8.5 8.5 13H12l-1 3 4-5h-3z"/></svg>`;
  if(f==='납축') return `<svg ${common}><path d="M6 6V4h3v2m6 0V4h3v2"/><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M6 10h4m-2-2v4m7-2h3m-12 5c2-1 4 1 6 0s4 1 6 0"/></svg>`;
  return `<svg ${common}><path d="M8 4h8v2h2v13H6V6h2z"/><path d="M10 4V2h4v2m-5 7h6m-6 4h6"/><circle cx="10" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="14" cy="15" r="1" fill="currentColor" stroke="none"/></svg>`;
}
function detail(v){const rows=[['모델명',v.model],['분류',v.fuel],['운영률',`${v.operatingRate.toFixed(1)}%`],['운영효율',`${v.efficiencyRate.toFixed(1)}%`],['충격 횟수',v.shockCnt],['거리',`${v.distance}Km`],['시간',v.operatingTime],['평균배터리소비량',v.fuel==='엔진'?'-':'0kWh'],['배터리충전횟수',v.fuel==='엔진'?'-':'0'],['배터리 정보',v.fuel==='엔진'?'-':v.batteryRate]];if(state.section!=='summary'){const st=v[state.section];if(st)rows.splice(0,0,[SECTIONS[state.section],st.value]);}return rows.map(([a,b])=>`<div class="goods-summary__detail-item"><span>${a}</span><em>${b}</em></div>`).join('');}

function toggleVehicleList(){const body=$('#current-vehicles');body.classList.toggle('opened');$('#vehicle-list-toggle').classList.toggle('opened');$('#vehicle-list-toggle').textContent=body.classList.contains('opened')?'⌃':'⌄';}
function openModal(id){state.modalVehicleId=id;const v=data().vehicles.find(x=>x.id===id);if(!v)return;$('#modal-vehicle-id').textContent=v.id;$('#modal-vehicle-meta').textContent=`${v.model} · ${v.fuel} · ${v.companyName}`;$('#modal-overall').textContent=(v.shock.state==='danger'||v.errors.state==='warning'||v.supplies.state==='warning')?'확인이 필요한 항목이 있습니다.':'전체 항목 정상';const items=[['engine','엔진',v.engine],['lithium','리튬배터리',v.lithium],['hydrogen','수소배터리',v.hydrogen],['lead','납축배터리',v.lead],['supplies','소모품관리',v.supplies],['errors','차량에러',v.errors],['shock','충격',v.shock]];$('#health-grid').innerHTML=items.map(([key,label,item])=>`<tr><td>${label}</td><td class="${item.state}">${item.value}</td><td>${item.note}</td><td><button type="button" data-modal-section="${key}">${label} 이동</button></td></tr>`).join('');$$('[data-modal-section]').forEach(b=>b.addEventListener('click',()=>goFromModal(b.dataset.modalSection)));$('#modal-backdrop').hidden=false;}
function closeModal(){$('#modal-backdrop') && ($('#modal-backdrop').hidden=true);}
function goFromModal(section){state.vehicleId=state.modalVehicleId;state.source='vehicle-modal';state.section=section;closeModal();updateUrl();render();}
function fuelCode(f){return f==='리튬'?'LI':f==='엔진'?'EN':f==='납축'?'LA':'HY';}
let timer;function toast(msg){const el=$('#toast');el.textContent=msg;el.hidden=false;clearTimeout(timer);timer=setTimeout(()=>el.hidden=true,2500);}
init();
