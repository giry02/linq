(() => {
  const DATA = window.MIQ_ATLAS;
  const PROCESS = window.MIQ_ATLAS_PROCESS;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const memoText = (value = '') => String(value)
    .replace(/할 수 있습니다\./g, '가능.')
    .replace(/해야 합니다\./g, '해야 함.')
    .replace(/이어야 합니다\./g, '이어야 함.')
    .replace(/보여줍니다\./g, '표시.')
    .replace(/바꿉니다\./g, '변경.')
    .replace(/남깁니다\./g, '보존.')
    .replace(/남습니다\./g, '남음.')
    .replace(/내려받습니다\./g, '다운로드.')
    .replace(/받습니다\./g, '수신.')
    .replace(/돌아갑니다\./g, '복귀.')
    .replace(/좁힙니다\./g, '범위 축소.')
    .replace(/찾습니다\./g, '탐색.')
    .replace(/붙입니다\./g, '배치.')
    .replace(/막힙니다\./g, '접근 차단 위험.')
    .replace(/깨집니다\./g, '깨짐.')
    .replace(/나옵니다\./g, '발생.')
    .replace(/바뀝니다\./g, '전환됨.')
    .replace(/달라집니다\./g, '달라짐.')
    .replace(/사라집니다\./g, '사라짐.')
    .replace(/만듭니다\./g, '발생.')
    .replace(/어렵습니다\./g, '어려움.')
    .replace(/않았습니다\./g, '하지 않았음.')
    .replace(/있습니다\./g, '있음.')
    .replace(/없습니다\./g, '없음.')
    .replace(/않습니다\./g, '않음.')
    .replace(/됩니다\./g, '됨.')
    .replace(/다릅니다\./g, '다름.')
    .replace(/([가-힣]+)합니다\./g, '$1.')
    .replace(/합니다\./g, '처리.')
    .replace(/입니다\./g, '임.');

  const serviceLabel = (key) => PROCESS.services[key];
  const anchorUrl = (service, key) => {
    const nodeId = PROCESS.anchors[service][key];
    return `${serviceLabel(service).figjam}?node-id=${nodeId.replace(':', '-')}`;
  };

  $('#stat-grid').innerHTML = [
    [DATA.meta.fleetFiles.toLocaleString(), '플릿 정적 파일'],
    [DATA.meta.dealerFiles.toLocaleString(), '딜러 정적 파일'],
    [DATA.meta.apiModules, '공통 API 모듈'],
    [DATA.meta.customerRequirements, 'PPT 고객 요구사항']
  ].map(([value, label]) => `<div class="stat"><b>${value}</b><span>${label}</span></div>`).join('');

  $('#actor-grid').innerHTML = [
    ['플릿 전용', '플릿 관리자', '소속 업체·그룹·차량의 운행·서비스 현황 조회', '고객에게 허용된 현상·상태 중심'],
    ['딜러 전용', '딜러 관리자·서비스 담당자', '판매·관리 대상 업체와 차량의 문제 확인·조치', '승인된 정비 상세·소모품 조치 포함'],
    ['공통 운영', '본사 서비스 담당자', '서비스 정책·조치 권한 운영과 결과 검증', '소모품 초기화 등 서버 권한 필요'],
    ['공통 운영', '개발·운영 담당자', 'API·권한·화면 상태·데이터 품질·감사 이력 관리', '실패·중복·권한 오류 확인']
  ].map(([tag, name, scope, permission]) => `<article class="actor"><small>${tag}</small><h3>${name}</h3><p>${scope}</p><em>${permission}</em></article>`).join('');

  $('#service-usecases').innerHTML = ['fleet', 'dealer'].map((service) => {
    const meta = serviceLabel(service);
    return `<article class="service-usecase ${service}"><header><span>${meta.name}</span><h3>${meta.audience} 유스케이스</h3></header><p>${memoText(meta.purpose)}</p><ol>${meta.usecases.map((item, index) => `<li><b>${index + 1}</b><span>${memoText(item)}</span></li>`).join('')}</ol><a href="${meta.figjam}" target="_blank" rel="noopener">${meta.name} FigJam 전체 흐름 보기</a></article>`;
  }).join('');

  $('#runtime-role-list').innerHTML = DATA.runtimeRoles.map((item, index) => `<article><b>${index + 1}. ${item.name}</b><span>${item.detail}</span></article>`).join('');
  $('#context-variable-list').innerHTML = `<div class="runtime-row runtime-head"><b>변수</b><b>의미</b><b>값 생성 위치</b><b>전달·수신</b><b>검증 원칙</b></div>${DATA.contextVariables.map((item) => `<div class="runtime-row"><code>${item.key}</code><span>${item.meaning}</span><span>${item.source}</span><span>${item.receive}</span><em>${item.rule}</em></div>`).join('')}`;
  $('#permission-list').innerHTML = DATA.permissions.map((item) => `<article><h4>${item.title}</h4><p><b>현재</b>${item.current}</p><p><b>목표</b>${item.target}</p></article>`).join('');
  $('#i18n-list').innerHTML = DATA.i18n.map((item) => `<article><h4>${item.title}</h4><p><b>현재</b>${item.current}</p><p><b>목표</b>${item.target}</p></article>`).join('');

  const menuIdMap = {
    '대시보드':'DSH-001','차량 관리':'VHC-001','운행 이력':'OPS-001~006','서비스':'SVC-001~004','리포트':'RPT-001','지도':'COM-001','관리 기능':'ADM-001'
  };
  $('#menu-map').innerHTML = ['fleet', 'dealer'].map((service) => {
    const meta = serviceLabel(service);
    return `<section class="service-menu-section ${service}"><header><span>${meta.name}</span><h3>${meta.name} 대메뉴·소메뉴</h3><p>${memoText(meta.scope)}</p></header><div>${DATA.menu.map((menu) => `<article class="menu-card"><small>${meta.prefix}-${menuIdMap[menu.name]}</small><h3>${menu.name}</h3><ul>${menu.children.map((item) => `<li>${item}</li>`).join('')}</ul><p>${memoText(menu.note)}</p></article>`).join('')}</div></section>`;
  }).join('');

  const baseScreens = DATA.screens.flatMap((screen) => {
    if (screen.key !== 'map-admin') return [screen];
    return [
      {...screen, key:'map', name:'지도', menu:'지도 > 차량 위치·지오펜스', data:['차량 위치','좌표','지오펜스','연결 상태'], actions:['지도 조회','차량 선택','전체 화면'], next:'차량 마커 또는 목록에서 차량 상세로 이동합니다.'},
      {...screen, key:'admin', name:'관리 기능', menu:'관리 기능 > 사용자·업체·그룹·차량·신청 관리', data:['사용자','업체','그룹','차량','신청 상태'], actions:['검색','목록 관리','상태 변경','저장'], next:'저장 결과를 확인하고 현재 목록을 다시 조회합니다.'}
    ];
  });

  const screenList = $('#screen-list');
  let activeService = 'fleet';
  let screenFilter = 'all';

  function idFor(screen, service) {
    if (screen.key === 'map') return `${serviceLabel(service).prefix}-COM-001`;
    if (screen.key === 'admin') return `${serviceLabel(service).prefix}-ADM-001`;
    return screen.ids.find((id) => id.startsWith(serviceLabel(service).prefix)) || screen.ids[0];
  }

  function screenMatches(screen, filter) {
    if (filter === 'all') return true;
    if (filter === '관리') return /차량 관리|지도|관리 기능|대시보드/.test(screen.menu);
    return screen.menu.includes(filter);
  }

  function serviceDifference(screen, service) {
    if (service === 'fleet') {
      const special = {
        maintenance:'플릿 고객은 고장부위와 현상까지 확인하며 승인되지 않은 상세·등록·수정·삭제 기능은 제공하지 않습니다.',
        supplies:'플릿은 소모품 도래와 사용량 조회가 중심이며 초기화 액션은 역할 정책에 따라 제한합니다.',
        errors:'플릿 허용 컬럼으로 차량·배터리 오류를 통합하고 PDF·상세 직접 접근 권한도 동일하게 적용합니다.',
        report:'그룹을 기본 집계·비교 단위로 사용합니다.'
      };
      return special[screen.key] || '소속 업체·그룹·차량 범위와 플릿 사용자 권한을 적용합니다.';
    }
    const special = {
      maintenance:'딜러·고객명·기종·호기와 승인된 정비 상세·완료 상태를 딜러 업무 컬럼으로 제공합니다.',
      supplies:'딜러 대표·본사 서비스 권한이 확인되면 교환 완료와 관리 시작점 초기화를 수행합니다.',
      errors:'관리 업체 범위에서 차량·배터리 오류를 통합하고 딜러 서비스 상세·PDF 업무로 연결합니다.',
      report:'업체를 기본 집계·비교 단위로 사용합니다.',
      vehicle:'판매·관리 관계와 고객 동의가 확인된 차량만 검색·목록·직접 조회에 제공합니다.'
    };
    return special[screen.key] || '전체 차량 또는 관리 업체 범위와 딜러 사용자 권한을 적용합니다.';
  }

  function renderScreens() {
    const query = $('#global-search').value.trim().toLowerCase();
    const meta = serviceLabel(activeService);
    const filtered = baseScreens.filter((screen) => {
      const process = PROCESS.screenText[screen.key];
      const searchText = JSON.stringify({screen, process, service:meta.name, id:idFor(screen, activeService)}).toLowerCase();
      return screenMatches(screen, screenFilter) && (!query || searchText.includes(query));
    });
    $('#screen-service-heading').innerHTML = `<div><span>${meta.name}</span><h3>${meta.name} 화면 프로세스 ${filtered.length}개</h3><p>${memoText(meta.scope)}</p></div><a href="${meta.figjam}" target="_blank" rel="noopener">${meta.name} FigJam 전체 보기</a>`;
    screenList.innerHTML = filtered.map((screen) => {
      const process = PROCESS.screenText[screen.key];
      const id = idFor(screen, activeService);
      return `<article class="screen-card ${activeService}" data-screen="${screen.key}" data-service="${activeService}"><div class="screen-card-top"><span class="service-badge">${meta.name}</span><span class="screen-id">${id}</span></div><h3>${process.title}</h3><p class="menu-path"><b>대메뉴</b> ${process.menu} <i>›</i> <b>소메뉴</b> ${process.submenu}</p><p class="screen-purpose">${memoText(process.purpose)}</p><dl><div><dt>주요 사용자</dt><dd>${meta.audience}</dd></div><div><dt>사용 목적</dt><dd>${memoText(process.usecase)}</dd></div><div><dt>주요 데이터</dt><dd>${screen.data.slice(0,4).join(' · ')}</dd></div><div><dt>관련 요구</dt><dd>${screen.requirements.length ? screen.requirements.join(' · ') : '현재 화면·소스 기준'}</dd></div></dl><button type="button">화면 흐름·FigJam 보기</button></article>`;
    }).join('') || '<p class="empty-result">검색 결과가 없습니다.</p>';
  }

  $$('.service-switch button').forEach((button) => button.addEventListener('click', () => {
    activeService = button.dataset.service;
    $$('.service-switch button').forEach((item) => item.classList.toggle('active', item === button));
    renderScreens();
  }));

  $$('.filters button').forEach((button) => button.addEventListener('click', () => {
    $$('.filters button').forEach((item) => item.classList.toggle('active', item === button));
    screenFilter = button.dataset.screenFilter;
    renderScreens();
  }));

  const dialog = $('#screen-dialog');
  const dialogBody = $('#screen-dialog-body');
  const stepLabels = ['사용자와 진입', '조회 조건 입력', 'API 요청', '응답 데이터', '화면 상태', '다음 이동·조치'];
  screenList.addEventListener('click', (event) => {
    const card = event.target.closest('.screen-card');
    if (!card || !event.target.closest('button')) return;
    const service = card.dataset.service;
    const screen = baseScreens.find((item) => item.key === card.dataset.screen);
    const process = PROCESS.screenText[screen.key];
    const meta = serviceLabel(service);
    const id = idFor(screen, service);
    const figjamUrl = anchorUrl(service, screen.key);
    const contextDetails = screen.context.map((key) => {
      const item = DATA.contextVariables.find((entry) => entry.key.split(' / ').includes(key)) || DATA.contextVariables.find((entry) => entry.key.includes(key));
      return item ? `${key}: ${item.meaning} / ${item.rule}` : `${key}: 화면별 조회·정렬 조건`;
    }).join('\n');
    dialogBody.innerHTML = `<div class="dialog-content ${service}"><header><div class="dialog-kicker"><span>${meta.name}</span><b>${id}</b></div><h2>${process.title}</h2><p><b>대메뉴</b> ${process.menu} <i>›</i> <b>소메뉴</b> ${process.submenu}</p></header><div class="dialog-body"><section class="dialog-intro"><div><small>이 화면이 하는 일</small><h3>${memoText(process.purpose)}</h3></div><div><small>기본 유스케이스</small><p>${memoText(process.usecase)}</p></div></section><section class="process-detail"><header><div><small>${id}</small><h3>화면 처리 순서</h3></div><a href="${figjamUrl}" target="_blank" rel="noopener">FigJam에서 이 화면 위치 바로 보기</a></header><ol>${process.steps.map((step, index) => `<li><b>${index + 1}</b><div><small>${stepLabels[index]}</small><span>${memoText(step)}</span></div></li>`).join('')}</ol><p class="participant-note"><b>참여 요소는 전체 명칭으로 표기</b> 사용자 → 화면 입력·선택 상태 → 프론트 화면·상태 제어 → API 요청·응답 처리 → 데이터 응답·저장소</p></section><div class="detail-grid"><div class="detail-block"><h3>진입·조회 조건</h3><p>${screen.context.join(' · ')}</p></div><div class="detail-block"><h3>${meta.name} 적용 범위</h3><p>${memoText(serviceDifference(screen, service))}</p></div><div class="detail-block"><h3>응답 데이터</h3><ul>${screen.data.map((item) => `<li>${item}</li>`).join('')}</ul></div><div class="detail-block"><h3>화면 상태</h3><ul>${screen.states.map((item) => `<li>${item}</li>`).join('')}</ul></div><div class="detail-block"><h3>사용자 행동</h3><ul>${screen.actions.map((item) => `<li>${item}</li>`).join('')}</ul></div><div class="detail-block"><h3>다음 흐름</h3><p>${memoText(screen.next)}</p><h3>관련 요구사항</h3><p>${screen.requirements.join(' · ') || '현재 화면·소스 기준'}</p></div></div><details class="technical-detail"><summary>개발 연결 정보</summary><pre>화면 경로: ${screen.route}\nAPI 모듈: ${screen.module}\nAPI:\n${screen.api.map((api) => `  ${api}`).join('\n')}\n\n페이지 변수:\n${contextDetails}\n\n권한 원칙:\nURL·클라이언트 상태만 신뢰하지 않고 사용자 조직·역할·차량 접근 범위를 서버에서 재검증\n\n다국어 원칙:\n표시 문구는 locale 리소스, 시간은 UTC 저장 후 사용자 IANA timezone, 수치와 unitCode는 분리</pre></details></div></div>`;
    dialog.showModal();
  });
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });

  function requirementCategory(row) {
    const [, , scope] = row;
    if (/데이터|권한|서버|외부|업무/.test(scope)) return '데이터';
    if (scope.includes('플릿')) return '플릿';
    if (scope.includes('딜러')) return '딜러';
    return '공통';
  }
  function renderRequirements() {
    const query = $('#requirement-search').value.trim().toLowerCase();
    const scope = $('#requirement-scope').value;
    const rows = DATA.requirements.filter((row) => (!query || row.join(' ').toLowerCase().includes(query)) && (scope === 'all' || requirementCategory(row) === scope || row[2].includes(scope)));
    $('#requirement-list').innerHTML = rows.map(([id,title,label]) => `<article class="requirement-item"><b>${id}</b><span>${title}</span><em>${label}</em></article>`).join('') || '<p>검색 결과가 없습니다.</p>';
  }
  renderRequirements();
  $('#requirement-search').addEventListener('input', renderRequirements);
  $('#requirement-scope').addEventListener('change', renderRequirements);
  $('#additional-list').innerHTML = DATA.additional.map((item) => `<article class="additional-item"><b>${item.id} · ${item.title}</b><p>${item.reason}</p></article>`).join('');
  $('#decision-list').innerHTML = DATA.decisions.map((item) => `<article class="decision-card"><header><b>${item.id} · ${item.title}</b><span>${item.severity}</span></header><p>${item.detail}</p></article>`).join('');

  $('#global-search').addEventListener('input', (event) => {
    renderScreens();
    if (event.target.value) location.hash = '#screens';
  });
  $('#print-button').addEventListener('click', () => window.print());
  renderScreens();

  const navLinks = $$('#section-nav a');
  const sections = navLinks.map((link) => $(link.getAttribute('href'))).filter(Boolean);
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
  }, {rootMargin:'-20% 0px -65%',threshold:[0,.15,.5]});
  sections.forEach((section) => observer.observe(section));
})();
