/* ══════════════════════════════════════════════════════════════
   Bobcat MachineIQ '26 — Mock-up 공용 내비게이션 / 인터랙션
   사용법:
     <body data-gnb="anlz" data-sub="usage" data-variant="tobe" data-base="../">
     <div id="gnb"></div>            ← GNB 자동 주입
     <script src="../_shared/nav.js"></script>  (body 끝)

   MVP 메뉴 정책 (2026-08-05 확정 · 2026-08-13 보강)
     · asisOnly:true    → 현행(AS-IS)에만 존재. TO-BE GNB에서는 숨김.
                          차량관리(=차량정보 리스트, 요약정보로 병합) / 관리기능>Geofence(기능 미검증)
     · hidden:true      → 두 변형 모두 GNB 드롭다운에 노출하지 않는 숨은 화면.
                          차량 상세는 운행이력>요약정보에서만 진입.
     · hiddenTobe:true  → 현행 기록은 AS-IS 드롭다운에 남기고 TO-BE 에서만 숨김.
                          충격·엔진·리튬은 TO-BE 에서 차량 상세의 지표·패널 클릭으로만 진입.
     · from:'…'         → 숨은 화면을 보고 있을 때 드롭다운에 표시할 진입 경로 안내.
   제공 인터랙션:
     .period-tabs button / .tabs button[data-tab] / .pill-tabs button
     .lnb__group-title (접기) / .lnb__item (선택)
     [data-modal-open="id"] / [data-modal-close] / .dim 배경 클릭
     [data-toggle-row="id"] 아코디언
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 사이트맵: 한 곳에서만 관리 ── */
  var MENU = [
    { key: 'dash', label: '대시보드', dir: 'Dashboard',
      subs: [{ key: 'group', label: '그룹별 대시보드', asis: 'group-dashboard-asis.html', tobe: 'group-dashboard-tobe-v2.html' }] },

    /* 차량관리 = 현행 전용. 차량정보 리스트는 운행이력>요약정보로 병합됨 */
    { key: 'equip', label: '차량관리', dir: 'Vehicle Detail', asisOnly: true,
      subs: [{ key: 'detail', label: '차량 정보', asis: 'vehicle-detail-asis.html', tobe: 'vehicle-detail-tobe.html' }] },

    { key: 'anlz', label: '운행이력',
      subs: [
        { key: 'summary', label: '요약정보', dir: 'Vehicle Summary', asis: 'vehicle-summary-asis.html', tobe: 'vehicle-summary-tobe-v2.html' },
        /* 차량 상세 = 숨은 화면. 요약정보에서만 진입 */
        { key: 'detail', label: '차량 상세', dir: 'Vehicle Detail', asis: 'vehicle-detail-asis.html', tobe: 'vehicle-detail-tobe.html', hidden: true, from: '요약정보' },
        { key: 'usage', label: '사용시간', dir: 'Usage Time', asis: 'usage-time-asis.html', tobe: 'usage-time-tobe.html' },
        { key: 'oper', label: '운영효율', dir: 'Operational Efficiency', asis: 'operational-efficiency-asis.html', tobe: 'operational-efficiency-tobe.html' },
        /* 충격 · 엔진 · 리튬 = TO-BE 에서는 GNB 에서 감추고 차량 상세에서만 진입
           (충격 = 충격 횟수 지표 클릭 / 리튬 = 에너지 상세 정보 클릭 / 엔진 = 엔진 상세 정보 클릭) */
        { key: 'shock', label: '충격', dir: 'Shock', asis: 'shock-asis.html', tobe: 'shock-tobe.html', hiddenTobe: true, from: '차량 상세' },
        { key: 'engine', label: '엔진', dir: 'Engine', asis: 'engine-asis.html', tobe: 'engine-tobe.html', hiddenTobe: true, from: '차량 상세' },
        { key: 'lithium', label: '리튬', dir: 'Lithium', asis: 'lithium-asis.html', tobe: 'lithium-tobe.html', hiddenTobe: true, from: '차량 상세' }
      ] },

    { key: 'srvc', label: '서비스', dir: 'Service',
      subs: [
        { key: 'all', label: '전체', asis: 'service-asis.html', tobe: 'service-tobe-v2.html' },
        { key: 'maintenance', label: '정비이력', asis: 'service-asis.html', tobe: 'service-maintenance-tobe.html' },
        { key: 'supply', label: '소모품관리', asis: 'service-asis.html', tobe: 'service-supply-tobe.html' },
        { key: 'error', label: '차량 에러', asis: 'service-asis.html', tobe: 'service-error-tobe.html' }
      ] },

    { key: 'rpt', label: '리포트',
      subs: [
        { key: 'rptstatus', label: '업체별 현황', dir: 'Report Status', asis: 'report-status-asis.html', tobe: 'report-status-tobe.html' },
        { key: 'rptcompare', label: '업체별 비교', dir: 'Report Comparison', asis: 'report-comparison-asis.html', tobe: 'report-comparison-tobe.html' },
        { key: 'rptheat', label: '업체별 히트맵', dir: 'Report Heatmap', asis: 'report-heatmap-asis.html', tobe: 'report-heatmap-tobe.html' },
        /* 3화면 통합 시도판 — 반려됨. 참조용으로만 보존 */
        { key: 'report', label: '(구) 통합 리포트', dir: 'Report', asis: 'report-asis.html', tobe: 'report-tobe.html', hidden: true }
      ] },

    { key: 'map', label: '지도', dir: 'Map',
      subs: [{ key: 'map', label: '지도 · 이동경로', asis: 'map-asis.html', tobe: 'map-tobe.html' }] },

    { key: 'mgmt', label: '관리기능',
      subs: [
        { key: 'user', label: '사용자', dir: 'Mgmt User', asis: 'mgmt-user-asis.html', tobe: 'mgmt-user-tobe.html' },
        { key: 'company', label: '업체', dir: 'Mgmt Company', asis: 'mgmt-company-asis.html', tobe: 'mgmt-company-tobe.html' },
        { key: 'group', label: '그룹', dir: 'Mgmt Group', asis: 'mgmt-group-asis.html', tobe: 'mgmt-group-tobe.html' },
        /* Geofence = 현행 전용. 탐지/SMS/앱푸시 미검증으로 MVP 제외 */
        { key: 'geofence', label: 'Geofence', dir: 'Mgmt Geofence', asisOnly: true, asis: 'mgmt-geofence-asis.html', tobe: 'mgmt-geofence-tobe.html' },
        { key: 'vehicle', label: '차량', dir: 'Mgmt Vehicle', asis: 'mgmt-vehicle-asis.html', tobe: 'mgmt-vehicle-tobe.html' },
        /* 계정신청관리 = 관리기능 > 사용자의 즉시 승인 처리로 대체되어 MVP 제외 */
        { key: 'acctreq', label: '계정신청관리', dir: 'Mgmt Account Request', asisOnly: true, asis: 'mgmt-account-request-asis.html', tobe: 'mgmt-account-request-tobe.html' },
        /* 차량신청관리 = 관리기능 > 차량의 승인 대기 패널로 대체되어 MVP 제외 */
        { key: 'equipreq', label: '차량신청관리', dir: 'Mgmt Vehicle Request', asisOnly: true, asis: 'mgmt-vehicle-request-asis.html', tobe: 'mgmt-vehicle-request-tobe.html' }
      ] },

    /* GNB 우측 사용자 영역에서 진입 — 상단 메뉴 줄에는 노출하지 않는다 */
    { key: 'myacct', label: '마이페이지', dir: 'My Account', userMenu: true,
      subs: [{ key: 'account', label: '내 계정', asis: 'my-account-asis.html', tobe: 'my-account-tobe.html' }] },

    /* 로그인 이전 화면 — GNB 없음. 사이트맵/검증 용도로만 등록 */
    { key: 'login', label: '로그인', dir: 'Login', preLogin: true,
      subs: [{ key: 'login', label: '로그인', asis: 'login-asis.html', tobe: 'login-tobe.html' }] },
    { key: 'findpw', label: '비밀번호 찾기', dir: 'Find Password', preLogin: true,
      subs: [{ key: 'findpw', label: '비밀번호 찾기', asis: 'find-password-asis.html', tobe: 'find-password-tobe.html' }] }
  ];

  /* ── MVP 진행상태 (index.html 상태판과 동일 기준 · 2026-08-13 현행화) ──
     done = MVP 확정 · nd(not done) = 미진행 · dl(delete) = MVP 제외 */
  var STATUS = {
    'dash/group': 'done',
    'anlz/summary': 'done', 'anlz/detail': 'done', 'anlz/oper': 'done',
    'anlz/shock': 'done', 'anlz/engine': 'done', 'anlz/lithium': 'done',
    'srvc/all': 'done', 'srvc/maintenance': 'done', 'srvc/supply': 'done', 'srvc/error': 'done',
    'rpt/rptstatus': 'done', 'rpt/rptcompare': 'done', 'rpt/rptheat': 'done',
    'map/map': 'done',
    'mgmt/user': 'done', 'mgmt/company': 'done', 'mgmt/group': 'done', 'mgmt/vehicle': 'done',
    'myacct/account': 'done', 'login/login': 'done', 'findpw/findpw': 'done',
    /* 남은 미진행 */
    'anlz/usage': 'nd',
    /* MVP 제외 */
    'equip/detail': 'dl', 'mgmt/geofence': 'dl', 'mgmt/acctreq': 'dl', 'mgmt/equipreq': 'dl',
    'rpt/report': 'dl'
  };
  function statusOf(mk, sk) { return STATUS[mk + '/' + sk] || ''; }

  var body = document.body;
  var d = body.dataset;
  var BASE = d.base || '../';
  var VARIANT = d.variant === 'asis' ? 'asis' : 'tobe';
  var ACT = d.gnb || '';
  var ACTSUB = d.sub || '';

  /* 현재 운영 화면의 공통 셸을 마지막 스타일로 적용한다. 요구사항 본문은 변경하지 않는다. */
  if (document.getElementById('gnb')) {
    body.classList.add('miq-current-shell');
    if (!document.querySelector('link[data-current-shell]')) {
      var shellCss = document.createElement('link');
      shellCss.rel = 'stylesheet';
      shellCss.href = BASE + '_shared/current-shell.css';
      shellCss.setAttribute('data-current-shell', '');
      document.head.appendChild(shellCss);
    }
  }

  /* MVP 정책 필터 */
  function menuVisible(m) {
    if (m.preLogin || m.userMenu) return false;          // 상단 메뉴 줄에는 노출하지 않음
    if (m.key === 'equip') return VARIANT === 'asis';    // TO-BE는 요약정보로 통합되어 상단 차량관리 제거
    return !(m.asisOnly && VARIANT !== 'asis');
  }
  function subVisible(s) { return !(s.asisOnly && VARIANT !== 'asis'); }
  function subHidden(s) { return !!s.hidden || (s.hiddenTobe && VARIANT !== 'asis'); }
  function subInDropdown(s) { return subVisible(s) && !subHidden(s); }

  function enc(s) { return s.replace(/ /g, '%20'); }
  function href(menu, sub) {
    var dir = sub.dir || menu.dir;
    var file = sub[VARIANT] || sub.tobe;
    return BASE + enc(dir) + '/' + file;
  }

  /* ── GNB 렌더 ── */
  var mount = document.getElementById('gnb');
  if (mount) {
    var logo = '<img src="' + BASE + '_shared/bobcat-machine-iq.svg" alt="Bobcat MACHINE IQ">';

    var html = '<div class="gnb' + (VARIANT === 'asis' ? ' gnb--asis' : '') + '">' +
      '<a class="gnb__logo" href="' + BASE + enc('Dashboard') + '/group-dashboard-' + VARIANT + (VARIANT === 'tobe' ? '-v2' : '') + '.html">' + logo + '</a><nav class="gnb__menu">';

    MENU.forEach(function (m) {
      if (!menuVisible(m)) return;
      var shown = m.subs.filter(subInDropdown);
      var landing = shown.length ? shown[0] : m.subs.filter(subVisible)[0];
      if (!landing) return;

      html += '<div class="gnb__item' + (m.key === ACT ? ' active' : '') + '">' +
        '<a href="' + href(m, landing) + '">' + m.label + '</a></div>';
    });

    /* 우측: 마이페이지 + 사이트맵 + 로그아웃
       (2026-08-13) 현행 화면은 실제 운영 웹사이트에서 확인하므로 AS-IS / TO-BE 전환 버튼은 제거한다. */
    var acct = null;
    MENU.forEach(function (m) { if (m.key === 'myacct') acct = m; });
    var acctHref = acct ? href(acct, acct.subs[0]) : '';

    html += '</nav><div class="gnb__right">' +
      '<label class="gnb__language"><span class="miq-sr-only">언어 선택</span>' +
        '<select aria-label="언어 선택"><option value="ko">KO</option><option value="en">EN</option></select></label>' +
      (acctHref ? '<a class="home gnb__account" href="' + acctHref + '"' + (ACT === 'myacct' ? ' style="background:rgba(255,255,255,.22)"' : '') +
        '>세종물류 - 관리자</a>' : '<span>세종물류 - 관리자</span>') +
      '<a class="home gnb__logout" href="' + BASE + enc('Login') + '/login-' + VARIANT + '.html">로그아웃</a></div></div>';

    mount.outerHTML = html;
    renderTargetSelector();
  }

  /* ── 요구사항 반영 공통 조회 대상 ──
     운영 화면에서 사용 중인 GNB 바로 아래의 업체/차량 선택 구조를 재사용한다.
     로그인 이전 화면에는 표시하지 않으며, 상세검색은 명시적으로 펼쳤을 때만 노출한다. */
  function renderReportSubnav() {
    if (document.querySelector('.miq-report-subnav')) return;

    var reportMenu = null;
    MENU.forEach(function (m) {
      if (m.key === 'rpt') reportMenu = m;
    });
    if (!reportMenu) return;

    var links = reportMenu.subs.filter(subInDropdown);
    var nav = document.createElement('nav');
    nav.className = 'miq-report-subnav';
    nav.setAttribute('aria-label', '리포트 하위 메뉴');

    var html = '<div class="miq-report-subnav__inner">';
    links.forEach(function (s) {
      var active = s.key === ACTSUB;
      html += '<a class="miq-report-subnav__link' + (active ? ' is-active' : '') + '" href="' + href(reportMenu, s) + '"' +
        (active ? ' aria-current="page"' : '') + '>' + s.label + '</a>';
    });
    html += '</div>';
    nav.innerHTML = html;

    document.querySelector('.gnb').insertAdjacentElement('afterend', nav);
  }

  function renderTargetSelector() {
    if (!document.querySelector('.gnb')) return;
    if (ACT === 'rpt') {
      renderReportSubnav();
      return;
    }
    if (document.querySelector('.miq-target-selector')) return;

    var companies = [
      ['all', '전체차량'], ['1933', '(주)세종물류중부지점'], ['20119', '김현종'],
      ['167', '두산물류 주식회사'], ['34317', '두산밥캣코리아 주식회사'],
      ['15857', '두산지게차 경남중부영업소'], ['33767', '두산지게차 경남중부판매 주식회사'],
      ['11214', '두산지게차 마창영업소'], ['6057', '에스엔케이중공업'],
      ['364', '온양지게차(호성건설중기)'], ['12894', '중원건기'], ['20289', '창녕지게차'],
      ['20106', '창원중기'], ['20120', '최재민'], ['3703', '태형금속공업(주)'],
      ['7690', '팔팔지게차서비스'], ['8246', '한일중기(주)']
    ];
    var vehicles = [
      ['FBA32_224250271', 'FBA32_224250271 · B30S-7'], ['FBA32_224250383', 'FBA32_224250383 · B30S-7'],
      ['FBD25_113920044', 'FBD25_113920044 · D25S-9'],
      ['FBA32-002038', 'FBA32-002038 · B30S-7'], ['FBA32-002039', 'FBA32-002039 · B30S-7'],
      ['FBA32-002040', 'FBA32-002040 · B30S-7'], ['FBA32-002043', 'FBA32-002043 · B30S-7'],
      ['FBA32-002044', 'FBA32-002044 · B30S-7'], ['FBA32-002045', 'FBA32-002045 · B30S-7'],
      ['FBA32-002065', 'FBA32-002065 · B30S-7'], ['FBA32-002067', 'FBA32-002067 · B30S-7'],
      ['FBA32-002068', 'FBA32-002068 · B30S-7'], ['FBA32-002069', 'FBA32-002069 · B30S-7'],
      ['FBA32-002071', 'FBA32-002071 · B30S-7'], ['FBA32-002073', 'FBA32-002073 · B30S-7'],
      ['FBA32-002074', 'FBA32-002074 · B30S-7'], ['FBA34_224030249', 'FBA34_224030249 · B35S-7'],
      ['FBA34_224250279', 'FBA34_224250279 · B35S-7'], ['FBA34-000509', 'FBA34-000509 · B35S-7'],
      ['FBA34-000518', 'FBA34-000518 · B35S-7'], ['FBA34-000520', 'FBA34-000520 · B35S-7'],
      ['FBA34-000522', 'FBA34-000522 · B35S-7']
    ];

    /* 목록 화면은 업체/차량을 바꿔 조회하고, 차량 상세 계열은 진입 시 받은
       업체/차량 문맥을 유지한다. 상세 화면에 빈 차량 선택값이 노출되면 현재
       데이터의 기준이 불명확해지므로 해당 화면에서만 선택값을 고정한다. */
    var scopedVehicleByPage = {
      detail: 'FBA32_224250271',
      shock: 'FBA32_224250271',
      engine: 'FBD25_113920044',
      lithium: 'FBA32_224250271'
    };
    var isVehicleScoped = ACT === 'anlz' && !!scopedVehicleByPage[ACTSUB];
    var scopedVehicle = '';
    if (isVehicleScoped) {
      var queryVehicle = new URLSearchParams(location.search).get('veh');
      var lnbVehicle = document.querySelector('[data-lnb-tree][data-vin]');
      scopedVehicle = queryVehicle || (lnbVehicle && lnbVehicle.getAttribute('data-vin')) || scopedVehicleByPage[ACTSUB];
      if (!vehicles.some(function (item) { return item[0] === scopedVehicle; })) scopedVehicle = scopedVehicleByPage[ACTSUB];
    }

    function options(items, selected) {
      return items.map(function (item) {
        return '<option value="' + item[0] + '"' + (item[0] === selected ? ' selected' : '') + '>' + item[1] + '</option>';
      }).join('');
    }

    var wrap = document.createElement('section');
    wrap.className = 'miq-target-selector' + (isVehicleScoped ? ' is-vehicle-scope' : '');
    wrap.innerHTML =
      '<div class="miq-target-selector__row">' +
        '<strong>조회 대상</strong>' +
        '<label>업체 <select data-target-company>' + options(companies, '1933') + '</select></label>' +
        '<label>차량 <select data-target-vehicle>' + (isVehicleScoped ? '' : '<option value="">차량을 선택하세요</option>') + options(vehicles, scopedVehicle) + '</select></label>' +
        '<span class="miq-target-selector__current" data-target-current></span>' +
        '<button type="button" class="miq-target-selector__detail" data-target-detail aria-expanded="false">' +
          '<svg class="miq-target-selector__detail-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"></circle><path d="m15.5 15.5 5 5"></path></svg>' +
          '<span>차량 상세검색</span>' +
        '</button>' +
      '</div>' +
      '<div class="miq-target-selector__panel" data-target-panel hidden>' +
        '<div class="miq-target-selector__search-field">' +
          '<span>전체 업체 차량번호 검색</span>' +
          '<div class="miq-target-selector__search-control"><input type="search" data-target-search placeholder="차량번호 5자 이상 입력 (예: FBA32)"><button type="button" data-target-search-button>조회</button></div>' +
          '<small>업체 선택과 관계없이 전체 차량에서 차량번호가 일부 일치하는 차량을 조회합니다. 5자 이상 입력해 주세요.</small>' +
        '</div>' +
        '<div class="miq-target-selector__result-area">' +
          '<div class="miq-target-selector__result-head"><strong data-target-result-count>검색 결과</strong><span>차량번호 · 소속 업체 · 모델 · 동력 유형</span></div>' +
          '<div class="miq-target-selector__results" data-target-results><p class="miq-target-selector__result-guide">차량번호를 입력하고 조회해 주세요.</p></div>' +
        '</div>' +
      '</div>';

    document.querySelector('.gnb').insertAdjacentElement('afterend', wrap);

    var company = wrap.querySelector('[data-target-company]');
    var vehicle = wrap.querySelector('[data-target-vehicle]');
    var current = wrap.querySelector('[data-target-current]');
    var panel = wrap.querySelector('[data-target-panel]');
    var input = wrap.querySelector('[data-target-search]');
    var results = wrap.querySelector('[data-target-results]');
    var resultCount = wrap.querySelector('[data-target-result-count]');
    var detailButton = wrap.querySelector('[data-target-detail]');

    if (isVehicleScoped) {
      company.disabled = true;
      vehicle.disabled = true;
      detailButton.hidden = true;
    }

    function companyName() { return company.options[company.selectedIndex].text; }
    function vehicleName() { return vehicle.value ? vehicle.options[vehicle.selectedIndex].text.split(' · ')[0] : ''; }
    function updateCurrent() {
      current.textContent = vehicle.value ? '현재 조회 · 차량 ' + vehicleName() : '현재 조회 · 업체 ' + companyName();
      document.dispatchEvent(new CustomEvent('miq:target-change', {
        detail: { companyId: company.value, equipmentId: vehicle.value || null, vehicleScoped: isVehicleScoped }
      }));
    }
    function runSearch() {
      var q = input.value.trim().toLowerCase();
      if (q.length < 5) {
        resultCount.textContent = '검색 결과';
        results.innerHTML = '<p class="miq-target-selector__result-guide">차량번호를 5자 이상 입력해 주세요.</p>';
        return;
      }
      var found = vehicles.filter(function (item) { return item[1].toLowerCase().indexOf(q) > -1; });
      resultCount.textContent = '검색 결과 ' + found.length + '대';
      results.innerHTML = found.length ? found.map(function (item) {
        var parts = item[1].split(' · ');
        var model = parts[1] || '-';
        var power = /^B/i.test(model) ? '리튬' : (/^D/i.test(model) ? '엔진' : '-');
        return '<button type="button" data-result-vehicle="' + item[0] + '"><strong>' + item[0] + '</strong><span>(주)세종물류중부지점 · ' + model + ' · ' + power + '</span></button>';
      }).join('') : '<p class="miq-target-selector__result-guide">일치하는 차량이 없습니다.</p>';
    }

    company.addEventListener('change', function () {
      vehicle.value = '';
      updateCurrent();
    });
    vehicle.addEventListener('change', updateCurrent);
    detailButton.addEventListener('click', function () {
      panel.hidden = !panel.hidden;
      detailButton.setAttribute('aria-expanded', panel.hidden ? 'false' : 'true');
      if (!panel.hidden) input.focus();
    });
    wrap.querySelector('[data-target-search-button]').addEventListener('click', runSearch);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') runSearch(); });
    results.addEventListener('click', function (e) {
      var button = e.target.closest('[data-result-vehicle]');
      if (!button) return;
      company.value = '1933';
      vehicle.value = button.dataset.resultVehicle;
      updateCurrent();
      panel.hidden = true;
      detailButton.setAttribute('aria-expanded', 'false');
    });
    updateCurrent();
  }

  function removeMockupAnnotations() {
    document.title = document.title
      .replace(/\s*TO-BE\s*v?\d*\s*\(Mock-up\)/gi, '')
      .replace(/\s*\(Mock-up\)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    Array.prototype.forEach.call(document.querySelectorAll('.change-tag, .new-tag, .remove-tag, .draft-tag'), function (tag) {
      tag.remove();
    });
    /*
       고객 목업을 검토하기 위해 넣었던 권한 선택기·설명 말풍선은 실제 구현 화면의
       기능이 아니다. 화면별로 복제하지 않고 공통 셸에서 일괄 제거해 원본 레이아웃과
       실제 버튼/필터만 남긴다.
    */
    Array.prototype.forEach.call(document.querySelectorAll('.role-picker'), function (node) {
      /* 목업용 권한 전환기는 화면에서 감추되 기존 페이지 스크립트의 참조는 보존한다. */
      node.hidden = true;
      node.setAttribute('aria-hidden', 'true');
    });
    Array.prototype.forEach.call(document.querySelectorAll('.hidden-note, .merged-note, .web-only'), function (node) {
      node.remove();
    });
    Array.prototype.forEach.call(document.querySelectorAll('.note, .policy-callout'), function (note) {
      var text = note.textContent.replace(/\s+/g, ' ').trim();
      /*
         policy-callout은 처리 결과·삭제 영향처럼 실제 동작 피드백에도 사용한다.
         클래스만 보고 전부 지우지 않고, 고객에게 노출할 이유가 없는 목업 설명만 제거한다.
      */
      if (/TO-BE 개선 사항|개발 참고|화면 설명|화면 병합 안내|권한 노출 대상|계정 권한 종류|노출 대상|목업 확인|확인용|가안|본 목업|내부 처리 안내|내부 사용자.*전체 딜러.*조회 전용|위 권한을 바꾸어|계정신청관리 패널.*계정에만 노출|그룹 셀에서 대상 그룹을 선택/.test(text)) {
        note.hidden = true;
        note.setAttribute('aria-hidden', 'true');
      }
    });
    /* 검토 포털에서만 쓰던 AS-IS·사이트맵 링크는 실제 구현 화면에서 노출하지 않는다. */
    Array.prototype.forEach.call(document.querySelectorAll('.pre__links a'), function (link) {
      var href = link.getAttribute('href') || '';
      if (/-asis\.html|\.\.\/index\.html/.test(href)) link.remove();
    });

    /* 로그인 화면의 시나리오 전환 탭은 검토용 제어 UI다. 실제 화면은 기본 로그인만 노출한다. */
    var loginBasicButton = document.querySelector('[data-tab="stBasic"]');
    if (loginBasicButton) {
      var loginTabs = loginBasicButton.closest('.tabs');
      if (loginTabs) loginTabs.remove();
      var basicPane = document.getElementById('stBasic');
      if (basicPane) basicPane.classList.add('active');
      var lockPane = document.getElementById('stLock');
      if (lockPane) lockPane.remove();
    }

    /* 기간 탭은 확정된 일·주·월·사용자설정만 유지한다. */
    Array.prototype.forEach.call(document.querySelectorAll('button'), function (button) {
      if (button.textContent.replace(/\s+/g, '') !== '\uB144') return;
      var group = button.parentElement;
      if (!group) return;
      var labels = Array.prototype.map.call(group.querySelectorAll('button'), function (item) {
        return item.textContent.replace(/\s+/g, '');
      });
      if (labels.indexOf('\uC77C') > -1 && labels.indexOf('\uC8FC') > -1 && labels.indexOf('\uC6D4') > -1) {
        button.remove();
      }
    });
  }

  /* ── 현재 화면형 LNB / 접기 / 푸터 ── */
  var serviceCountsCache = {};

  function readServiceCounts() {
    var counts = {};
    if (ACT !== 'srvc') return counts;
    Array.prototype.forEach.call(document.querySelectorAll('.count-row .count-card'), function (card) {
      var label = card.querySelector('.count-card__k');
      var value = card.querySelector('.count-card__v');
      if (!label || !value) return;
      var text = label.textContent.replace(/\s+/g, '');
      var number = value.textContent.replace(/[^0-9]/g, '');
      if (text.indexOf('정비') > -1) counts.maintenance = number;
      else if (text.indexOf('소모품') > -1) counts.supply = number;
      else if (text.indexOf('에러') > -1) counts.error = number;
    });
    if (Object.keys(counts).length) serviceCountsCache = counts;
    return serviceCountsCache;
  }

  function removeServiceKpiRows() {
    if (ACT !== 'srvc') return;
    Array.prototype.forEach.call(document.querySelectorAll('.count-row'), function (row) {
      row.remove();
    });
  }

  function enhanceServiceHeader() {
    if (ACT !== 'srvc') return;

    var labels = {
      all: '서비스 - 전체',
      maintenance: '정비이력 - 기본그룹',
      supply: '소모품관리 - 기본그룹',
      error: '차량 에러 - 기본그룹'
    };
    var title = document.querySelector('.main .page-title');
    if (!title) return;

    var label = labels[ACTSUB] || labels.all;
    var marker = title.querySelector('[data-lnb-label]');
    if (marker) {
      title.childNodes[0].nodeValue = '';
      marker.textContent = label;
    } else {
      title.textContent = label;
    }

    /* 기준 미확정 상태에서 추가됐던 31일 안내 문구는 제거한다. */
    Array.prototype.forEach.call(document.querySelectorAll('.period-note, .period-help, .miq-period-guide'), function (node) {
      if (/31일|조회\s*기간/.test(node.textContent)) node.remove();
    });

    var sectionTop = document.querySelector('.main .section-top');
    if (!sectionTop) return;
    var action = sectionTop.querySelector('.finder, .section-actions');
    var row = title.closest('.miq-service-header-row');

    if (!row) {
      row = document.createElement('div');
      row.className = 'miq-service-header-row';
      title.parentNode.insertBefore(row, title);
      row.appendChild(title);
    }
    if (action && action.parentNode !== row) row.appendChild(action);

    Array.prototype.forEach.call(sectionTop.querySelectorAll('.section-top__title'), function (heading) {
      heading.remove();
    });
    if (!sectionTop.children.length) sectionTop.remove();
  }

  function enhancePeriodControls() {
    Array.prototype.forEach.call(document.querySelectorAll('.finder, .filter-bar'), function (bar) {
      var tabs = bar.querySelector('.period-tabs');
      if (!tabs || bar.dataset.periodReady === 'true') return;
      bar.dataset.periodReady = 'true';
      bar.classList.add('miq-period-filter');

      var range = bar.querySelector('.date-range');
      if (range && !bar.querySelector('input[type="date"]')) {
        var raw = range.textContent.trim().replace(/\./g, '-');
        var dates = raw.match(/\d{4}-\d{2}-\d{2}/g) || ['2026-07-01', '2026-07-31'];
        var start = document.createElement('input');
        var end = document.createElement('input');
        var sep = document.createElement('span');
        start.type = end.type = 'date';
        start.className = end.className = 'miq-date-input';
        start.value = dates[0] || '2026-07-01';
        end.value = dates[1] || dates[0] || '2026-07-31';
        sep.className = 'miq-date-separator';
        sep.textContent = '~';
        range.replaceWith(start, sep, end);
      }

      var inputs = bar.querySelectorAll('input[type="date"]');
      var buttons = Array.prototype.slice.call(tabs.querySelectorAll('button'));
      var searchButton = Array.prototype.filter.call(bar.querySelectorAll('button'), function (button) {
        var label = button.textContent.replace(/\s+/g, '');
        return label === '조회' || button.classList.contains('btn-search') || button.id === 'btnSearch';
      })[0];
      var periodCodes = { '일': 'D', '주': 'W', '월': 'M', '사용자설정': 'C' };

      function formatDate(date) {
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var day = String(date.getDate()).padStart(2, '0');
        return year + '-' + month + '-' + day;
      }

      function parseDate(value) {
        var parts = String(value || '').split('-').map(Number);
        if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return new Date(2026, 6, 31);
        return new Date(parts[0], parts[1] - 1, parts[2]);
      }

      function buttonLabel(button) {
        return button ? button.textContent.replace(/\s+/g, '') : '';
      }

      buttons.forEach(function (button) {
        var label = buttonLabel(button);
        if (label === '기간' || label === '사용자검색' || label === '사용자') {
          button.textContent = '사용자설정';
        }
      });
      if (searchButton) searchButton.classList.add('btn-search');

      function activate(button) {
        buttons.forEach(function (item) { item.classList.toggle('active', item === button); });
      }

      function emitPeriodChange(button) {
        if (!inputs.length) return;
        var label = buttonLabel(button);
        bar.dispatchEvent(new CustomEvent('miq:period-change', {
          bubbles: true,
          detail: {
            periodTypeCode: periodCodes[label] || 'C',
            startDate: inputs[0].value,
            endDate: inputs[1] ? inputs[1].value : inputs[0].value
          }
        }));
      }

      function applyPreset(label) {
        if (inputs.length < 2) return;
        var endDate = parseDate(inputs[1].value || inputs[0].value);
        var startDate = new Date(endDate.getTime());
        if (label === '일') {
          startDate = new Date(endDate.getTime());
        } else if (label === '주') {
          startDate.setDate(startDate.getDate() - 6);
        } else if (label === '월') {
          startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
          endDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
        }
        inputs[0].value = formatDate(startDate);
        inputs[1].value = formatDate(endDate);
      }

      function setCustomMode(enabled) {
        Array.prototype.forEach.call(inputs, function (input) {
          input.disabled = !enabled;
          input.classList.toggle('is-enabled', enabled);
        });
      }
      var custom = Array.prototype.filter.call(tabs.querySelectorAll('button'), function (button) {
        return button.textContent.replace(/\s+/g, '') === '사용자설정';
      })[0];
      setCustomMode(!!(custom && custom.classList.contains('active')));
      tabs.addEventListener('click', function (event) {
        var button = event.target.closest('button');
        if (!button) return;
        var isCustom = button === custom;
        activate(button);
        setCustomMode(isCustom);
        if (!isCustom) {
          applyPreset(buttonLabel(button));
          emitPeriodChange(button);
        }
        if (button === custom && inputs[0]) {
          inputs[0].focus();
          if (typeof inputs[0].showPicker === 'function') inputs[0].showPicker();
        }
      });
      Array.prototype.forEach.call(inputs, function (input) {
        input.addEventListener('change', function () {
          if (custom) activate(custom);
          setCustomMode(true);
        });
        input.addEventListener('click', function () {
          if (!input.disabled && typeof input.showPicker === 'function') input.showPicker();
        });
      });
      if (searchButton) {
        searchButton.addEventListener('click', function () {
          var active = tabs.querySelector('button.active') || custom || buttons[0];
          emitPeriodChange(active);
        });
      }
    });
  }

  function enhanceTitlePeriodHeader() {
    var main = document.querySelector('.main');
    if (!main) return;

    /* 본문 카드/그래프 내부의 기간 필터는 이동하지 않는다.
       페이지 제목과 함께 쓰는 상단 조회 영역만 공통 행으로 묶는다. */
    var periodFilters = Array.prototype.slice.call(main.querySelectorAll('.miq-period-filter'));
    var periodFilter = periodFilters.filter(function (filter) {
      var parent = filter.parentElement;
      if (!parent) return false;
      if (filter.closest('.miq-title-period-row, .miq-service-header-row')) return true;
      if (parent === main) return true;
      if (parent.classList.contains('page-head') || parent.classList.contains('section-top')) return true;
      return false;
    })[0];
    var title = main.querySelector('.page-head__title, .page-title');
    if (!periodFilter || !title) return;

    var row = title.closest('.miq-title-period-row, .miq-service-header-row');
    var titleHost = title.parentElement;

    if (!row && titleHost && titleHost.classList.contains('page-head') && !titleHost.querySelector('.page-head__bc')) {
      row = titleHost;
      row.classList.add('miq-title-period-row');
    }

    if (!row) {
      row = document.createElement('div');
      row.className = 'miq-title-period-row';
      if (titleHost && titleHost.classList.contains('page-head')) {
        titleHost.insertAdjacentElement('afterend', row);
      } else {
        title.parentNode.insertBefore(row, title);
      }
      row.appendChild(title);
    } else {
      row.classList.add('miq-title-period-row');
    }

    var filterHost = periodFilter.parentElement;
    if (periodFilter.parentNode !== row) row.appendChild(periodFilter);

    if (titleHost && titleHost !== row && titleHost !== main && !titleHost.children.length) titleHost.remove();
    if (filterHost && filterHost !== row && filterHost !== main && !filterHost.children.length) filterHost.remove();
  }

  function enhanceCurrentShell() {
    var serviceCounts = readServiceCounts();
    removeMockupAnnotations();
    document.body.classList.add('miq-section-' + ACT, 'miq-page-' + ACTSUB);
    var vehicleScopedPages = { detail: true, shock: true, engine: true, lithium: true };
    if (vehicleScopedPages[ACTSUB]) document.body.classList.add('miq-vehicle-scoped');
    if (ACTSUB === 'lithium') document.body.classList.add('miq-lithium-detail');

    var layout = document.querySelector('.layout');
    if (!layout) return;

    var aside = layout.querySelector('aside.lnb');
    var sideMenus = {
      anlz: {
        title: '운행이력',
        items: [
          ['summary', '요약정보'], ['usage', '사용시간'], ['oper', '운영효율']
        ]
      },
      srvc: {
        title: '서비스',
        items: [['all', '전체'], ['maintenance', '정비이력'], ['supply', '소모품관리'], ['error', '차량 에러']]
      },
      mgmt: {
        title: '관리기능',
        items: [['user', '사용자'], ['company', '업체'], ['group', '그룹'], ['vehicle', '차량']]
      }
    };

    if (!aside && sideMenus[ACT]) {
      aside = document.createElement('aside');
      aside.className = 'lnb';
      layout.insertBefore(aside, layout.firstChild);
    }

    var noSideMenus = { dash: true, rpt: true };
    if (aside && noSideMenus[ACT]) {
      aside.hidden = true;
      layout.classList.add('miq-no-side');
    } else if (aside) {
      /* 지도처럼 기존 화면이 보유한 트리형 LNB는 그대로 유지한다. */
      aside.hidden = false;
      layout.classList.remove('miq-no-side');
    } else if (noSideMenus[ACT]) {
      layout.classList.add('miq-no-side');
    }

    if (aside && sideMenus[ACT]) {
      aside.hidden = false;
      layout.classList.remove('miq-no-side');
      var config = sideMenus[ACT];
      /* 차량 상세·충격·엔진·배터리는 요약정보에서만 진입하는 숨은 화면이다.
         LNB에 새 메뉴를 만들지 않고 진입 경로만 유지한다. */
      var activeKey = ACTSUB === 'detail' ? 'summary' : ACTSUB;
      var menu = MENU.filter(function (m) { return m.key === ACT; })[0];
      var links = config.items.map(function (item) {
        var sub = menu.subs.filter(function (s) { return s.key === item[0]; })[0];
        if (!sub) return '';
        var badge = ACT === 'srvc' && serviceCounts[item[0]]
          ? '<span class="miq-side-count">' + serviceCounts[item[0]] + '</span>'
          : '';
        return '<a class="miq-side-item' + (item[0] === activeKey ? ' active' : '') + '" href="' + href(menu, sub) + '"><span>' + item[1] + '</span>' + badge + '</a>';
      }).join('');
      aside.removeAttribute('data-lnb-tree');
      aside.innerHTML = '<h2 class="miq-side-title">' + config.title + '</h2><nav class="miq-side-menu">' + links + '</nav>';
    }

    removeServiceKpiRows();
    enhanceServiceHeader();
    enhancePeriodControls();
    enhanceTitlePeriodHeader();

    if (aside && !aside.hidden && !layout.querySelector('.miq-side-toggle')) {
      var toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'miq-side-toggle';
      toggle.setAttribute('aria-label', '좌측 메뉴 접기');
      toggle.innerHTML = '<span>‹</span>';
      toggle.addEventListener('click', function () {
        var collapsed = layout.classList.toggle('miq-side-collapsed');
        toggle.innerHTML = '<span>' + (collapsed ? '›' : '‹') + '</span>';
        toggle.setAttribute('aria-label', collapsed ? '좌측 메뉴 펴기' : '좌측 메뉴 접기');
      });
      layout.appendChild(toggle);
    }

    if (!document.querySelector('.miq-page-foot')) {
      var foot = document.createElement('footer');
      foot.className = 'miq-page-foot';
      foot.innerHTML = '<div class="miq-page-foot__brand"><img src="' + BASE + '_shared/favicon.ico" alt="">' +
        '<strong>Bobcat</strong><span>MACHINE IQ</span></div>' +
        '<div class="miq-page-foot__links"><b>이용약관</b><b>위치정보 및 위치기반서비스 이용약관</b><b>개인(위치)정보 처리방침</b><b>오픈소스 고지</b>' +
        '<small>©2024 Bobcat Company. ALL RIGHTS RESERVED.</small></div>' +
        '<div class="miq-page-foot__help"><strong>HELP</strong><span>help.machineiq@doosan.com</span><small>최종접속 : 2026-08-31 21:00</small></div>';
      document.body.appendChild(foot);
    }

    /* 일·주·월·사용자설정 조회는 현행 화면의 우측 정렬 패턴으로 통일한다. */
    Array.prototype.forEach.call(document.querySelectorAll('.filter-bar'), function (bar) {
      if (bar.querySelector('.period-tabs')) bar.classList.add('miq-period-filter');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceCurrentShell);
  } else {
    enhanceCurrentShell();
  }

  window.addEventListener('load', function () {
    /* 화면별 LNB 초기화가 끝난 뒤 공통 현재 화면 셸을 적용한다. */
    window.setTimeout(enhanceCurrentShell, 0);
  });

  /* ── 공통 인터랙션 ── */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('button, [data-modal-open], [data-modal-close], .lnb__group-title, .lnb__item, [data-toggle-row]');
    if (!t) return;

    /* 기간 탭 / pill 탭 : 형제 중 하나만 active */
    if (t.matches('.period-tabs button, .pill-tabs button, .map-type button, .seg button')) {
      Array.prototype.forEach.call(t.parentNode.children, function (b) { b.classList.remove('active'); });
      t.classList.add('active');
      var lab = t.closest('[data-period-target]');
      if (lab) {
        var tgt = document.querySelector(lab.dataset.periodTarget);
        if (tgt && t.dataset.range) tgt.textContent = t.dataset.range;
      }
    }

    /* 콘텐츠 탭 : 패널이 .tabs 의 형제가 아닌 경우도 안전하게 처리 */
    if (t.matches('.tabs button[data-tab]')) {
      var wrap = t.closest('.tabs');
      Array.prototype.forEach.call(wrap.querySelectorAll('button'), function (b) { b.classList.remove('active'); });
      t.classList.add('active');
      var pane = document.getElementById(t.dataset.tab);
      if (pane) {
        Array.prototype.forEach.call(pane.parentNode.children, function (p) {
          if (p.classList.contains('tab-pane')) p.classList.remove('active');
        });
        pane.classList.add('active');
      }
    }

    /* LNB */
    if (t.matches('.lnb__group-title')) {
      var open = t.dataset.open !== 'n';
      t.dataset.open = open ? 'n' : 'y';
      var ar = t.querySelector('span'); if (ar) ar.textContent = open ? '▼' : '▲';
      var n = t.nextElementSibling;
      while (n && !n.classList.contains('lnb__group-title')) { n.style.display = open ? 'none' : ''; n = n.nextElementSibling; }
    }
    if (t.matches('.lnb__item')) {
      var lnb = t.closest('.lnb');
      if (lnb) Array.prototype.forEach.call(lnb.querySelectorAll('.lnb__item'), function (i) { i.classList.remove('active'); });
      t.classList.add('active');
      var out = document.querySelector('[data-lnb-label]');
      if (out) out.textContent = '- ' + (t.dataset.label || t.textContent.trim());
    }

    /* 모달 */
    if (t.dataset.modalOpen) {
      var m1 = document.getElementById(t.dataset.modalOpen);
      if (m1) m1.classList.add('open');
    }
    if (t.hasAttribute('data-modal-close')) {
      var m2 = t.closest('.dim'); if (m2) m2.classList.remove('open');
    }

    /* 아코디언 행 */
    if (t.dataset.toggleRow) {
      var row = document.getElementById(t.dataset.toggleRow);
      if (row) row.style.display = row.style.display === 'none' || !row.style.display ? 'table-row' : 'none';
    }
  });

  /* dim 배경 클릭으로 닫기 */
  document.addEventListener('mousedown', function (e) {
    if (e.target.classList && e.target.classList.contains('dim')) e.target.classList.remove('open');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') Array.prototype.forEach.call(document.querySelectorAll('.dim.open'), function (m) { m.classList.remove('open'); });
  });

  window.MIQ = { MENU: MENU, BASE: BASE, VARIANT: VARIANT, enhanceCurrentShell: enhanceCurrentShell };
})();
