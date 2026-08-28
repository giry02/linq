(() => {
  const parts = window.FRONTEND_CONTRACTS_PARTS || [];
  const contracts = {
    fleet: parts.flatMap((part) => part.fleet || []),
    dealer: parts.flatMap((part) => part.dealer || []),
  };

  const specs = [
    {id:"AUTH",section:"공통",title:"로그인",scope:"공통",fleetRoute:"/fleet/:locale/login",dealerRoute:"/dealer/:locale/login",patterns:["/common/auth/fleet/authenticate"],route:["locale"],future:"인증 응답과 사용자·권한 컨텍스트를 분리. 토큰 만료시각과 사용자 범위를 명시."},
    {id:"FL-DSH-001",section:"대시보드",title:"플릿 그룹별 대시보드",scope:"fleet",fleetRoute:"/fleet/:locale/page/dashboard/equip",patterns:["/fleet/dashboard/summary$","/fleet/dashboard/ranking$"],route:["locale"],future:"선택 기간과 플릿 조직 범위를 공통 조회 컨텍스트로 전달."},
    {id:"DL-DSH-001",section:"대시보드",title:"딜러 업체 대시보드",scope:"dealer",dealerRoute:"/dealer/:locale/page/mgmt/dashboard/company/:companyId",patterns:["/fleet/dashboard/summary-company$","/fleet/dashboard/ranking$","/fleet/management/company/summary-operation$"],route:["locale","companyId"],future:"딜러와 고객 업체의 역할을 organizationId·scopeType으로 분리."},
    {id:"DSH-002",section:"대시보드",title:"그룹·업체 위젯 대시보드",scope:"both",fleetRoute:"/fleet/:locale/page/dashboard/widget",dealerRoute:"/dealer/:locale/page/dashboard/widget-company",patterns:["summary-group-widget","ranking-group-widget","summary-company-widget","ranking-company-widget","/fleet/userWidgets"],route:["locale","companyId","groupId"],future:"위젯 배치와 조회 데이터를 분리. 위젯 식별자와 버전을 응답에 포함."},
    {id:"DL-MON-001",section:"대시보드",title:"딜러 모니터링",scope:"dealer",dealerRoute:"/dealer/:locale/page/mgmt/monitoring/:equipmentStockId",patterns:["/fleet/management/company/daily-summary$","/fleet/management/company/ranking$","/fleet/management/company/search-daily-equipments$"],route:["locale","equipmentStockId","companyId"],future:"재고·판매·운영 대상을 명시하는 scopeType 필요."},
    {id:"EQP-001",section:"차량관리",title:"차량 목록",scope:"both",fleetRoute:"/fleet/:locale/page/equip/list/group/:companyId/:groupId",dealerRoute:"/dealer/:locale/page/equip/list/company/:companyId",patterns:["/fleet/management/company/search-daily-equipments$","/fleet/management/company/daily-summary$","/fleet/management/equipment/category$","/fleet/menu/equipment"],route:["locale","companyId","groupId"],future:"업체 전체·그룹·차량 검색 범위를 scopeType으로 통일. 목록 응답을 items/page 구조로 통일."},
    {id:"EQP-002",section:"차량관리",title:"차량 상세",scope:"both",fleetRoute:"/fleet/:locale/page/equip/detail/equip/:companyId/:groupId/:equipmentId",dealerRoute:"/dealer/:locale/page/equip/detail/equip/:companyId/:equipmentId",patterns:["/fleet/management/equipment/:equipmentId$","/fleet/management/equipment/graph$","/fleet/management/equipment/schedules$","/fleet/management/equipment/summary-operation$"],route:["locale","companyId","groupId","equipmentId"],future:"차량 기본정보·기간 요약·그래프를 별도 계약으로 유지. equipmentId 형식을 하나로 통일."},
    {id:"OPS-001",section:"운행이력",title:"요약정보",scope:"both",fleetRoute:"/fleet/:locale/page/anlz/summary/group/:companyId/:groupId",dealerRoute:"/dealer/:locale/page/anlz/summary/company/:companyId",patterns:["/fleet/analysis/summary"],route:["locale","companyId","groupId","equipmentId"],future:"업체·그룹·차량 조회를 하나의 scope 객체로 통일. 숫자값과 표시문자열을 분리."},
    {id:"OPS-002",section:"운행이력",title:"사용시간",scope:"both",fleetRoute:"/fleet/:locale/page/anlz/calendar/group/:companyId/:groupId",dealerRoute:"/dealer/:locale/page/anlz/calendar/company/:companyId",patterns:["/fleet/analysis/calendar/"],route:["locale","companyId","groupId","equipmentId"],future:"달력 기준일과 조회 범위를 period 객체로 전달. 휴일·근무시간 기준을 meta에 포함."},
    {id:"OPS-003",section:"운행이력",title:"운영효율",scope:"both",fleetRoute:"/fleet/:locale/page/anlz/operate/group/:companyId/:groupId",dealerRoute:"/dealer/:locale/page/anlz/operate/company/:companyId",patterns:["/fleet/analysis/operating/"],route:["locale","companyId","groupId","equipmentId"],future:"작업·대기·미사용 시간을 분 단위 원값으로 제공. 비율은 동일 원값에서 계산."},
    {id:"OPS-004",section:"운행이력",title:"충격",scope:"both",fleetRoute:"/fleet/:locale/page/anlz/shock/group/:companyId/:groupId",dealerRoute:"/dealer/:locale/page/anlz/shock/company/:companyId",patterns:["/fleet/analysis/shock/"],route:["locale","companyId","groupId","equipmentId"],future:"충격 값의 단위·임계치·발생시각을 응답에 명시."},
    {id:"OPS-006",section:"운행이력",title:"엔진 연비",scope:"both",fleetRoute:"/fleet/:locale/page/anlz/fuel/group/:companyId/:groupId",dealerRoute:"/dealer/:locale/page/anlz/fuel/company/:companyId",patterns:["/fleet/analysis/fuel/"],route:["locale","companyId","groupId","equipmentId"],future:"연비와 누적 소비량의 단위를 meta로 전달. 그래프는 날짜별 원값 배열로 통일."},
    {id:"BAT-LI-001",section:"운행이력",title:"리튬배터리 목록",scope:"both",fleetRoute:"/fleet/:locale/page/anlz/battery/li/group/:companyId/:groupId",dealerRoute:"/dealer/:locale/page/anlz/battery/li/company/:companyId",patterns:["/fleet/analysis/li/stat/group/","/fleet/analysis/li/stat/company/"],route:["locale","companyId","groupId"],future:"배터리 종류는 batteryTypeCode로 구분. 상태 코드는 공통 enum으로 관리."},
    {id:"BAT-LI-002",section:"운행이력",title:"리튬배터리 상세",scope:"both",fleetRoute:"/fleet/:locale/page/anlz/battery/li/detail/equip/:companyId/:groupId/:equipmentId",dealerRoute:"/dealer/:locale/page/anlz/battery/li/detail/equip/:companyId/:equipmentId",patterns:["/fleet/analysis/li/stat/equipment/","/fleet/analysis/li/graph/","/fleet/analysis/li/error/"],route:["locale","companyId","groupId","equipmentId"],future:"온도와 충·방전량은 동일 시간축을 가진 두 그래프로 제공. 에러는 차량에러 계약으로 이동."},
    {id:"BAT-HI-001",section:"운행이력",title:"수소배터리",scope:"both",fleetRoute:"/fleet/:locale/page/anlz/battery/hydrogen/group/:companyId/:groupId",dealerRoute:"/dealer/:locale/page/anlz/battery/hydrogen/company/:companyId",patterns:["/fleet/analysis/hi/"],route:["locale","companyId","groupId","equipmentId"],future:"수소 차량 여부와 수소 전용 상태 필드를 공통 차량 계약에서 식별."},
    {id:"BAT-LA-001",section:"운행이력",title:"납축배터리",scope:"both",patterns:["/fleet/analysis/la/"],route:["locale","companyId","groupId","equipmentId"],future:"배터리 종류별 API를 유지하더라도 공통 상태 필드명과 단위를 일치."},
    {id:"SVC-001",section:"서비스",title:"서비스 전체",scope:"both",fleetRoute:"/fleet/:locale/page/srvc/list/group/:companyId/:groupId",dealerRoute:"/dealer/:locale/page/srvc/list/company/:companyId",patterns:["/fleet/service/service-count$","/fleet/service/services$"],route:["locale","companyId","groupId","equipmentId"],future:"정비·소모품·차량에러 건수를 상태별로 제공. 완료 건과 미처리 건을 분리."},
    {id:"MNT-001",section:"서비스",title:"정비이력",scope:"both",fleetRoute:"/fleet/:locale/page/srvc/maintenance/group/:companyId/:groupId",dealerRoute:"/dealer/:locale/page/srvc/maintenance/company/:companyId",patterns:["/fleet/service/ocses$"],route:["locale","companyId","groupId","equipmentId"],future:"접수일시·완료일시·완료여부를 분리. Claim 번호는 데이터 출처 확인 후 추가."},
    {id:"SUP-001",section:"서비스",title:"소모품관리",scope:"both",fleetRoute:"/fleet/:locale/page/srvc/supplies/group/:companyId/:groupId",dealerRoute:"/dealer/:locale/page/srvc/supplies/company/:companyId",patterns:["/fleet/service/schedules$"],route:["locale","companyId","groupId","equipmentId"],future:"교환일자·완료여부·조치사항 저장 계약 추가. 사용량은 원값과 단위를 분리."},
    {id:"ERR-001",section:"서비스",title:"차량에러",scope:"both",fleetRoute:"/fleet/:locale/page/srvc/equipError/group/:companyId/:groupId",dealerRoute:"/dealer/:locale/page/srvc/equipError/company/:companyId",patterns:["/fleet/service/errors$","/fleet/service/errors/battery$"],route:["locale","companyId","groupId","equipmentId"],future:"차량·엔진·배터리 에러를 errorTypeCode로 구분. PDF 존재 여부와 파일 식별자를 응답에 포함."},
    {id:"RPT-001",section:"리포트",title:"그룹별 현황",scope:"both",fleetRoute:"/fleet/:locale/page/report/status/group/:companyId/:groupId",dealerRoute:"/dealer/:locale/page/report/status/company/:companyId",patterns:["/fleet/report/summary$","/fleet/report/summary/company$","/fleet/report/summary/graph"],route:["locale","companyId","groupId"],future:"현재·이전·차이를 metric 배열로 통일. 단위와 집계 기준을 meta에 포함."},
    {id:"RPT-002",section:"리포트",title:"그룹·업체 비교",scope:"both",fleetRoute:"/fleet/:locale/page/report/comparison/group/:companyId/:groupId",dealerRoute:"/dealer/:locale/page/report/comparison/company/:companyId",patterns:["/fleet/report/diffgroup","/fleet/report/diffcompany","/fleet/report/diffcompnay"],route:["locale","companyIds","groupIds"],future:"비교 대상 ID 배열과 표시 순서를 요청에 명시."},
    {id:"RPT-003",section:"리포트",title:"히트맵",scope:"both",fleetRoute:"/fleet/:locale/page/report/hitmap/group/:companyId/:groupId",dealerRoute:"/dealer/:locale/page/report/hitmap/company/:companyId",patterns:["/fleet/report/heatmap/"],route:["locale","companyIds","groupIds"],future:"구간값과 색상 기준을 서버 응답으로 제공. 화면 하드코딩 제거."},
    {id:"MAP-001",section:"지도",title:"차량 위치·지오펜스",scope:"both",fleetRoute:"/fleet/:locale/page/map/group/:companyId/:groupId",dealerRoute:"/dealer/:locale/page/map/company/:companyId",patterns:["/common/map/geofence/"],route:["locale","companyId","groupId","equipmentId"],future:"좌표 기준계·수신시각·정확도·지오펜스 권한을 응답에 명시."},
    {id:"ADM-USR-001",section:"관리기능",title:"사용자 관리",scope:"both",patterns:["/fleet/admin/users$","/fleet/admin/user/","/common/user/user$"],route:["locale","userId"],future:"사용자와 조직 역할을 분리. 메뉴 권한은 permissionCodes 배열로 제공."},
    {id:"ADM-COM-001",section:"관리기능",title:"업체 관리",scope:"both",patterns:["/fleet/admin/companies$","/fleet/admin/company$","/fleet/admin/all-companies$"],route:["locale","companyId"],future:"companyId를 organizationId로 전환. 조직유형·국가·시간대·상태를 명시."},
    {id:"ADM-EQP-001",section:"관리기능",title:"차량 관리",scope:"both",patterns:["/fleet/admin/equipments$","/fleet/admin/equipment/:equipmentId$","/fleet/admin/all-equipments$"],route:["locale","equipmentId"],future:"차량 소유·운영·판매·정비 관계를 차량 기본정보와 분리."},
    {id:"ADM-REQ-001",section:"관리기능",title:"계정 신청 관리",scope:"both",patterns:["/fleet/admin/account/requests$","/fleet/admin/account/companys$"],route:["locale"],future:"신청 상태·처리자·처리일시·반려사유를 공통 상태 이력으로 관리."},
    {id:"ADM-REQ-002",section:"관리기능",title:"차량 신청 관리",scope:"both",patterns:["/fleet/admin/equipment/requests$","/fleet/admin/equipment/companys$"],route:["locale","equipmentId"],future:"차량 신청과 조직 관계 승인을 분리. 승인 후 관계 유효기간을 생성."},
    {id:"ADM-GRP-001",section:"관리기능",title:"그룹 관리",scope:"both",patterns:["/fleet/admin/groups$","/fleet/admin/group/","/fleet/admin/equipment/:equipmentId/groups"],route:["locale","companyId","groupId","equipmentId"],future:"그룹을 조직 하위 분류로 정의. 업체·차량 관계와 혼용하지 않음."},
  ];

  const fieldInfo = {
    locale:["표시 언어 코드","한글·영문 등 화면 언어 선택"], language:["사용 언어 코드","사용자 언어 설정"], timezone:["시간대","날짜·시각 변환 기준"], unitSystem:["단위 체계","km·mile, L·gallon 표시 기준"],
    companyId:["업체 ID","조회 대상 업체 식별"], rentalCompanyId:["렌탈 업체 ID","렌탈 관계 업체 식별"], dealerCompanyId:["딜러 업체 ID","딜러 관계 업체 식별"], organizationId:["조직 ID","업체·딜러·지점 공통 식별"], groupId:["그룹 ID","업체 하위 그룹 식별"], groupIds:["그룹 ID 목록","비교할 그룹 목록"], companyIds:["업체 ID 목록","비교할 업체 목록"], equipmentId:["차량 ID","차량 한 대 식별"], equipmentStockId:["재고 ID","딜러 재고·판매 대상 식별"], userId:["사용자 ID","사용자 계정 식별"],
    startDate:["조회 시작일","조회 기간 시작일"], endDate:["조회 종료일","조회 기간 종료일"], periodTypeCode:["조회 단위 코드","일·주·월·사용자설정 구분"], rankType:["순위 기준","가동시간·효율 등 순위 기준"], pageNo:["페이지 번호","목록 페이지 위치"], pageSize:["페이지 크기","한 번에 받는 목록 건수"], sortCol:["정렬 필드","목록 정렬 기준 필드"], sortOrder:["정렬 방향","오름차순·내림차순"], searchKeyword:["검색어","이름·번호 등 목록 검색"], category:["분류 항목","차량 목록 분류 기준"], value:["분류 값","선택한 분류의 값"], infiniteIdentifier:["연속조회 식별자","무한 스크롤 다음 묶음 식별"], widgetType:["위젯 유형","저장·조회할 대시보드 위젯 구분"],
    access_token:["접근 토큰","인증된 API 호출에 사용"], refresh_token:["갱신 토큰","접근 토큰 재발급에 사용"], login_datetime:["로그인 일시","현재 로그인 시각"], last_login_datetime:["최근 로그인 일시","직전 로그인 이력"], last_login_ip:["최근 로그인 IP","접속 이력 확인"],
    equipmentNumber:["차량번호","사용자가 차량을 식별하는 주요 번호"], equipmentName:["모델명","차량 모델 표시"], engineModelCode:["엔진 모델 코드","엔진 사양 식별"], fuelTypeCode:["동력 유형 코드","엔진·리튬·납축·수소 구분"], fuelTypeCodeName:["동력 유형명","동력 유형 표시"], modelYear:["연식","차량 생산 연도"], makerCode:["제조사 코드","차량 제조사 식별"], equipmentCode:["기종 코드","차량 기종 식별"], groupName:["그룹명","소속 그룹 표시"], companyName:["업체명","소속·대상 업체 표시"],
    operatingRate:["운영률","선택 기간의 운영 비율"], efficiencyRate:["운영효율","작업시간 기준 효율 비율"], workingTime:["작업시간","실제 작업 시간"], idleTime:["대기시간","전원 켜짐 상태의 대기 시간"], offTime:["미사용시간","작동하지 않은 시간"], distance:["이동거리","선택 기간 이동거리"], cumulativeDistance:["누적 이동거리","차량 등록 후 전체 이동거리"], cumulativeTimeVal:["누적 가동시간","차량 등록 후 전체 가동시간"], shockCnt:["충격 횟수","선택 기간 충격 발생 건수"], errorCnt:["차량 에러 건수","차량·엔진 오류 건수"], batterErrorCnt:["배터리 에러 건수","배터리 오류 건수"], batteryErrorCount:["배터리 에러 건수","배터리 오류 건수"], repairCnt:["정비 건수","정비 이력 건수"],
    avgFuelConsum:["평균 연료소비량","선택 기간 평균 연료 사용량"], batteryChargeCnt:["배터리 충전 횟수","선택 기간 충전 건수"], batteryRate:["배터리 잔량","현재 배터리 잔량 비율"], hydrogenRate:["수소 잔량","현재 수소 잔량 비율"], temperature:["온도","배터리 또는 장치 온도"],
    errorCode:["에러코드","오류 종류 식별 코드"], errorItem:["에러 내용","오류 설명"], errorLevelCode:["에러 수준 코드","오류 심각도 구분"], eventDatetime:["발생일시","오류가 발생한 시각"], resolveDatetime:["완료일시","오류 조치 완료 시각"], resolveNm:["조치방법","오류 해결 안내 또는 조치 내용"], statusCode:["상태 코드","현재·과거·완료 상태 구분"],
    serviceId:["서비스 ID","정비·서비스 건 식별"], scheduleId:["소모품 일정 ID","교환 주기 항목 식별"], scheduleName:["소모품명","관리 대상 소모품 표시"], exchangeCycleHour:["교환주기","권장 교환 시간"], exchangeUseHour:["사용시간","교환 후 사용 시간"], per:["사용률","교환주기 대비 사용 비율"], regUserId:["등록 사용자 ID","소모품 정보를 등록한 사용자"],
    totalElements:["전체 건수","검색 조건에 맞는 전체 목록 수"], totalPages:["전체 페이지 수","전체 목록의 페이지 수"], number:["현재 페이지","현재 목록 페이지 번호"], size:["페이지 크기","현재 페이지 표시 건수"], content:["목록","화면에 반복 표시할 데이터 목록"], items:["목록","화면에 반복 표시할 데이터 목록"],
    latitude:["위도","지도 세로 좌표"], longitude:["경도","지도 가로 좌표"], signalDatetime:["최종 통신일시","차량 위치가 마지막 수신된 시각"],
  };

  const inputType = (name, captured="") => {
    if (["pageNo","pageSize"].includes(name)) return "정수";
    if (["startDate","endDate"].includes(name)) return "문자열(YYYY-MM-DD)";
    if (name === "periodTypeCode") return "코드(enum)";
    if (["groupIds","companyIds"].includes(name)) return "배열 또는 구분 문자열";
    if (/Id$/.test(name)) return name === "equipmentId" ? "문자열" : "문자열·정수";
    if (captured.includes("integer") && captured.includes("string")) return "문자열·정수";
    if (captured.includes("integer")) return "정수";
    return "문자열";
  };
  const typeLabel = (type="") => type.split("|").map((item) => ({string:"문자열",number:"숫자",integer:"정수",boolean:"참·거짓",null:"null",array:"배열",object:"객체",empty:"빈 문자열"}[item] || item)).join(" · ");
  const safe = (value="") => String(value).replace(/[&<>\"]/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const lastName = (path) => path.replace(/\[\]/g,"").split(".").pop();
  const describe = (path) => {
    const name = lastName(path);
    if (fieldInfo[name]) return fieldInfo[name][1];
    if (/Cnt$|Count$/.test(name)) return "해당 항목의 건수";
    if (/Rate$|Percentage$/.test(name)) return "해당 항목의 비율";
    if (/Datetime$|DateTime$|At$/.test(name)) return "해당 처리 시각";
    if (/Date$/.test(name)) return "해당 기준 일자";
    if (/Name$|Nm$/.test(name)) return "화면에 표시할 명칭";
    if (/Code$/.test(name)) return "업무 구분 코드";
    if (/Id$/.test(name)) return "대상 식별자";
    if (/Time$|Hour$/.test(name)) return "시간 또는 시간값";
    return "화면 표시 또는 상태 계산에 사용하는 값";
  };
  const label = (name) => fieldInfo[name]?.[0] || name;
  const useText = (path) => {
    const name = lastName(path);
    if (/total|page|size|number/i.test(name)) return "목록·페이징";
    if (/Id$|Code$/.test(name)) return "식별·분기";
    if (/Rate|Percentage|Time|Distance|Cnt|Count|Fuel|Battery|Shock/.test(name)) return "수치·그래프";
    if (/Date|At/.test(name)) return "일자·상태";
    return "본문 표시";
  };
  const matches = (endpoint, spec) => spec.patterns.some((pattern) => new RegExp(pattern).test(endpoint.path));
  const selectedEndpoints = (spec) => {
    const scopes = spec.scope === "fleet" ? ["fleet"] : spec.scope === "dealer" ? ["dealer"] : ["fleet","dealer"];
    const rows = [];
    scopes.forEach((scope) => contracts[scope].filter((endpoint) => matches(endpoint,spec)).forEach((endpoint) => rows.push({...endpoint,scope})));
    const seen = new Set();
    return rows.filter((row) => {const key=`${row.scope}:${row.method}:${row.path}:${JSON.stringify(row.query)}`;if(seen.has(key))return false;seen.add(key);return true;});
  };
  const buildInputs = (spec,endpoints) => {
    const rows = [];
    (spec.route || []).forEach((name) => rows.push({name,source:"URL·화면상태",type:inputType(name),desc:fieldInfo[name]?.[1] || "화면 진입 대상 식별",rule:"경로값은 필수"}));
    endpoints.forEach((endpoint) => Object.entries(endpoint.query || {}).forEach(([name,type]) => rows.push({name,source:"API Query",type:inputType(name,type),desc:fieldInfo[name]?.[1] || describe(name),rule:type.includes("empty") ? "선택·빈값 가능" : "조회 시 전달"})));
    const map = new Map();
    rows.forEach((row) => {const old=map.get(row.name);if(!old)map.set(row.name,row);else if(old.source!==row.source)old.source="URL·API Query";});
    return [...map.values()];
  };
  const buildOutputs = (endpoints) => {
    const map = new Map();
    endpoints.forEach((endpoint) => Object.entries(endpoint.response || {}).forEach(([path,type]) => {
      if (path === "result") return;
      const clean = path.replace(/^result\.?/,"").replace(/^\[\]\./,"list[].");
      if (!clean) return;
      const key=clean;
      const source=`${endpoint.scope === "dealer" ? "딜러" : "플릿"} ${endpoint.path}`;
      if (!map.has(key)) map.set(key,{path:clean,type:new Set(),sources:new Set()});
      type.split("|").forEach((item)=>map.get(key).type.add(item));
      map.get(key).sources.add(source);
    }));
    return [...map.values()].map((row)=>({path:row.path,type:[...row.type].join("|"),source:[...row.sources].join(" · ")}));
  };
  const header = (eyebrow,title,pageNo) => `<header><div><p class="eyebrow">${safe(eyebrow)}</p><h2>${safe(title)}</h2></div><span class="slide-no">${safe(pageNo)}</span></header>`;
  const inputRows = (rows) => `<div class="field-row head"><b>필드</b><b>출처</b><b>타입</b><b>내용</b><b>필수·빈값</b></div>${rows.map((r)=>`<div class="field-row"><code>${safe(r.name)}</code><em>${safe(r.source)}</em><span>${safe(r.type)}</span><p>${safe(r.desc)}</p><strong>${safe(r.rule)}</strong></div>`).join("")}`;
  const outputRows = (rows,compact=false) => `<div class="field-row output head"><b>필드</b><b>실제 타입</b><b>내용</b><b>화면 사용</b><b>null·빈값</b></div>${rows.map((r)=>`<div class="field-row output"><code>${safe(r.path)}</code><span>${safe(typeLabel(r.type))}</span><p>${safe(describe(r.path))}</p><em>${safe(useText(r.path))}</em><strong>${r.type.includes("null") ? "빈값 허용" : r.type.includes("array") ? "빈 배열 가능" : "값 사용"}</strong></div>`).join("")}`;
  const sourceFooter = `<p class="source-line">근거: 최종 구현 HTML의 API 모듈 · 캡처 JSON · QA 화면 경로 (2026.08.28)</p>`;

  const slides = [];
  slides.push(`<section class="slide cover is-active" data-title="표지"><div class="cover-band"><img src="../../dealer/mobile-home/bobcat-machine-iq.svg" alt="Bobcat MACHINE IQ"><span>프론트 화면별 입력·출력 계약 · 2026.08.28</span></div><div class="cover-copy"><p class="eyebrow">FLEET · DEALER · FRONTEND CONTRACT</p><h1>화면이 받는 값과<br><em>API 응답 필드 정의</em></h1><p class="lead">각 화면의 경로 변수, 조회 조건, API 입력·출력 필드, 실제 타입, 빈값 처리와 향후 표준 계약을 정리한 개발 문서</p><div class="cover-grid"><article><b>입력</b><span>URL·화면상태·API Query 구분</span></article><article><b>출력</b><span>실제 캡처 JSON의 모든 응답 필드</span></article><article><b>개선</b><span>공통 컨텍스트·타입·null 규칙</span></article></div></div><footer>근거 파일: final-implementation/fleet|dealer/assets/api*.js · fleet-data|dealer-data/*.json · qa-report.json</footer></section>`);
  slides.push(`<section class="slide" data-title="문서 기준">${header("01 · DOCUMENT RULE","현행 값과 개선안을 분리","")}<div class="scope-grid"><article><b>현행 입력</b><ul><li>URL 경로값</li><li>선택 업체·그룹·차량</li><li>기간·검색·페이징 Query</li></ul></article><article><b>현행 출력</b><ul><li>캡처 JSON의 실제 필드명</li><li>실제 수신 타입</li><li>null·배열 여부</li></ul></article><article><b>개선안</b><ul><li>화면별 표준 요청 계약</li><li>공통 응답 봉투</li><li>OpenAPI 기반 타입 생성</li></ul></article></div><div class="definition-box"><b>타입 기준</b> 본 문서의 출력 타입은 DB 타입이 아니라 브라우저가 실제 JSON에서 받은 타입. 캡처되지 않은 요청 본문과 서버 내부 검증은 확정값으로 표시하지 않음.</div>${sourceFooter}</section>`);
  slides.push(`<section class="slide" data-title="입력 전달 흐름">${header("02 · CURRENT INPUT FLOW","화면 진입부터 API 호출까지 전달되는 값","")}<div class="flow-grid"><article><b>1. URL</b><span>서비스·언어·업체·그룹·차량 ID 수신</span></article><article><b>2. 화면 상태</b><span>상단 조회대상과 기간 선택값 저장</span></article><article><b>3. API Query</b><span>날짜·대상·페이징·정렬값 조합</span></article><article><b>4. JSON 응답</b><span>result 목록·요약·그래프 수신</span></article><article><b>5. 화면 렌더링</b><span>표시값·상태·그래프·빈값 처리</span></article></div><div class="rule-grid"><article><h3>현재 확인된 문제</h3><ul><li>companyId·groupId·equipmentId 조합이 화면마다 다름</li><li>딜러 화면도 일부 <code>/fleet/</code> API 사용</li><li>숫자와 표시 문자열이 함께 존재</li><li>동일 필드가 빈 문자열·문자열·숫자로 수신</li></ul></article><article class="good"><h3>필요한 기준</h3><ul><li>조회 대상을 <code>scope</code>로 통일</li><li>기간을 <code>period</code>로 통일</li><li>숫자는 원값, 단위는 <code>meta</code>로 분리</li><li>null·빈 배열·미수신 규칙 명시</li></ul></article></div>${sourceFooter}</section>`);

  let logicalPage = 3;
  specs.forEach((spec) => {
    const endpoints = selectedEndpoints(spec);
    if (!endpoints.length) return;
    const inputs = buildInputs(spec,endpoints);
    const outputs = buildOutputs(endpoints);
    logicalPage += 1;
    const routeText = [spec.fleetRoute && `플릿 ${spec.fleetRoute}`,spec.dealerRoute && `딜러 ${spec.dealerRoute}`].filter(Boolean).join("  |  ") || "관리기능 공통 화면 경로";
    const endpointBadges = endpoints.slice(0,8).map((e)=>`<code>${safe(e.method)} ${safe(e.path)}</code>`).join("") + (endpoints.length>8?`<code>외 ${endpoints.length-8}개</code>`:"");
    const preview = outputs.slice(0,7);
    slides.push(`<section class="slide" data-title="${safe(spec.section)} · ${safe(spec.title)}">${header(`${String(logicalPage).padStart(2,"0")} · ${spec.id} · ${spec.section}`,spec.title,`${outputs.length} fields`)}<div class="route-strip"><b>화면 경로</b><code>${safe(routeText)}</code></div><div class="endpoint-list">${endpointBadges}</div><div class="contract-layout"><article class="panel"><div class="panel-head"><h3>입력 필드</h3><span>${inputs.length}개</span></div><div class="field-table">${inputRows(inputs.slice(0,9))}</div></article><article class="panel"><div class="panel-head"><h3>주요 출력 필드</h3><span>전체 ${outputs.length}개</span></div><div class="field-table">${outputRows(preview)}</div></article></div><div class="definition-box"><b>향후 계약</b> ${safe(spec.future)}</div>${sourceFooter}</section>`);
    const remaining = outputs.slice(7);
    const chunkSize = 13;
    for(let offset=0;offset<remaining.length;offset+=chunkSize){
      const chunk=remaining.slice(offset,offset+chunkSize);
      const part=Math.floor(offset/chunkSize)+1;
      slides.push(`<section class="slide continuation" data-title="${safe(spec.title)} · 출력 ${part}">${header(`${spec.id} · OUTPUT FIELDS`,`${spec.title} 응답 필드`,`${offset+8}-${offset+7+chunk.length} / ${outputs.length}`)}<div class="page-context"><span><b>화면</b> ${safe(routeText)}</span><span><b>API</b> ${endpoints.length}개 응답 통합</span></div><div class="field-table">${outputRows(chunk,true)}</div><div class="definition-box"><b>필드 출처</b> 동일 필드가 여러 API에서 수신되면 타입을 합쳐 표시. 필드별 API 경로는 브라우저 개발자도구와 캡처 JSON으로 재확인 가능.</div>${sourceFooter}</section>`);
    }
  });

  slides.push(`<section class="slide" data-title="목표 입력 계약">${header("TARGET REQUEST CONTRACT","화면별 입력을 공통 구조로 전달","")}<div class="rule-grid"><article><h3>공통 컨텍스트</h3><p><code>tenantId</code> 데이터 경계<br><code>serviceType</code> FLEET·DEALER<br><code>locale</code> 표시 언어<br><code>timezone</code> 날짜 변환<br><code>unitSystem</code> 단위 체계</p></article><article class="good"><h3>조회 조건</h3><p><code>scope.type</code> COMPANY·GROUP·EQUIPMENT<br><code>scope.organizationId</code> 대상 조직<br><code>scope.equipmentId</code> 대상 차량<br><code>period.type</code> DAY·WEEK·MONTH·CUSTOM<br><code>period.startDate/endDate</code> 조회 기간</p></article></div><div class="api-line route-strip"><b>예시</b><code>{ context:{tenantId,serviceType,locale,timezone,unitSystem}, scope:{type,organizationId,equipmentId}, period:{type,startDate,endDate}, page:{number,size,sort} }</code></div><div class="definition-box"><b>필요한 처리</b> 기존 Query는 호환 기간 동안 유지. 백엔드 어댑터에서 새 공통 요청 구조로 변환.</div>${sourceFooter}</section>`);
  slides.push(`<section class="slide" data-title="목표 출력 계약">${header("TARGET RESPONSE CONTRACT","응답 봉투와 빈값 규칙을 통일","")}<div class="decision-table"><div><b>영역</b><b>필드</b><b>내용</b><b>규칙</b></div><div><strong>상태</strong><code>code · message · traceId</code><p>처리 결과와 추적 ID</p><span>모든 API 공통</span></div><div><strong>데이터</strong><code>result</code><p>화면에서 사용하는 실제 데이터</p><span>목록은 items 사용</span></div><div><strong>부가정보</strong><code>meta.generatedAt · timezone · unitSystem · locale</code><p>표시 기준과 생성 시각</p><span>화면 계산 제거</span></div><div><strong>페이징</strong><code>page.number · size · totalElements · totalPages</code><p>목록 위치와 전체 건수</p><span>0 또는 1 기준 확정</span></div><div><strong>빈값</strong><code>null · [] · field omitted</code><p>값 없음·목록 없음·권한 없음 구분</p><span>API 명세에 정의</span></div></div>${sourceFooter}</section>`);
  slides.push(`<section class="slide" data-title="구현 순서">${header("IMPLEMENTATION","프론트 계약 표준화 작업","")}<div class="flow-grid"><article><b>1. OpenAPI</b><span>화면별 요청·응답 스키마 확정</span></article><article><b>2. 타입 생성</b><span>TypeScript 타입 자동 생성</span></article><article><b>3. 검증</b><span>런타임 응답 검증과 로그</span></article><article><b>4. 어댑터</b><span>기존 API 응답을 새 화면 모델로 변환</span></article><article><b>5. 전환</b><span>화면별 순차 교체와 회귀 테스트</span></article></div><div class="rule-grid"><article><h3>우선 결정</h3><ul><li>ID 타입과 표기 형식</li><li>기간 최대 범위와 시간대</li><li>플릿·딜러 조회 권한 범위</li><li>null·0·빈 배열의 의미</li></ul></article><article class="good"><h3>완료 기준</h3><ul><li>화면 변수와 API 명세 일치</li><li>모든 화면 타입 오류 없음</li><li>영문·단위 변경 시 값 손실 없음</li><li>차량 선택 후 모든 메뉴 조회 가능</li></ul></article></div>${sourceFooter}</section>`);
  slides.push(`<section class="slide closing" data-title="종료"><span class="closing-mark">FRONTEND CONTRACT</span><h2>화면 변수는<br><em>API 계약으로 관리</em></h2><p>경로값·조회조건·응답필드·타입·빈값 규칙을 화면별 계약으로 고정. 플릿·딜러 공통 컴포넌트와 글로벌 확장의 기준으로 사용.</p><div class="closing-actions"><span>화면별 입력 확정</span><span>응답 필드 정리</span><span>OpenAPI·TypeScript 연결</span></div></section>`);

  const deck = document.querySelector("#deck");
  deck.innerHTML = slides.join("");
  const slideNodes = [...deck.querySelectorAll(".slide")];
  const current = document.querySelector(".page-indicator b");
  const total = document.querySelector(".page-indicator span");
  const progress = document.querySelector(".progress i");
  const dialog = document.querySelector(".overview");
  const list = document.querySelector(".overview-list");
  let index = Math.max(0,Number(location.hash.slice(1))-1 || 0);
  total.textContent = `/ ${slideNodes.length}`;
  slideNodes.forEach((slide,i)=>{const button=document.createElement("button");button.type="button";button.textContent=`${String(i+1).padStart(2,"0")} · ${slide.dataset.title || "슬라이드"}`;button.addEventListener("click",()=>{show(i);dialog.close();});list.append(button);});
  function show(next){index=(next+slideNodes.length)%slideNodes.length;slideNodes.forEach((slide,i)=>slide.classList.toggle("is-active",i===index));current.textContent=String(index+1);progress.style.width=`${((index+1)/slideNodes.length)*100}%`;history.replaceState(null,"",`#${index+1}`);}
  document.addEventListener("click",(event)=>{const action=event.target.closest("[data-action]")?.dataset.action;if(action==="next")show(index+1);if(action==="prev")show(index-1);if(action==="overview")dialog.showModal();if(action==="close")dialog.close();if(action==="print")window.print();});
  document.addEventListener("keydown",(event)=>{if(["ArrowRight","PageDown"," "].includes(event.key)){event.preventDefault();show(index+1);}if(["ArrowLeft","PageUp"].includes(event.key)){event.preventDefault();show(index-1);}if(event.key==="Home")show(0);if(event.key==="End")show(slideNodes.length-1);if(event.key.toLowerCase()==="o")dialog.showModal();if(event.key.toLowerCase()==="p")window.print();});
  show(index);
})();
