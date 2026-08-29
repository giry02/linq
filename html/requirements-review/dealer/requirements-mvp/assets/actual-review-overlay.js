(() => {
  if (window.__linqReviewOverlayMounted) return;
  window.__linqReviewOverlayMounted = true;

  const data = window.LINQ_REQUIREMENT_REVIEW || {};
  const screen = window.LINQ_REVIEW_SCREEN || '';
  const isDealerPreview = window.LINQ_REVIEW_SERVICE === 'dealer' || location.pathname.startsWith('/dealer/');
  const isServiceScreen = ['service-errors', 'maintenance-history', 'supplies-management'].includes(screen);
  const problemCatalog = data.problemCatalog || {};
  const issueMap = data.requirementIssueIds || {};

  const specialItems = {
    'option3-summary': [
      {number:1,id:'OPTION-3-001',ppt:'시안 3',title:'GNB·조회 대상·LNB 공통 구조',request:'3안의 상단 GNB 전체와 조회 대상, 좌측 LNB를 모든 검토 화면의 공통 레이아웃으로 유지한다.',change:'복사한 실제 플릿 GNB를 그대로 노출하고 그 아래 조회 대상을 배치했으며, 3안과 같은 240px LNB·활성 상태·접기 버튼을 유지했다.',targets:['.page-head','.requirements-option3-selector','.requirements-option3-side'],location:'상단 GNB, 조회 대상, 좌측 LNB',status:'UI 적용'},
      {number:2,id:'OPTION-3-002',ppt:'시안 3',title:'차량번호 통합 상세검색',request:'업체를 모르는 상황에서도 차량번호 일부를 이용해 전체 업체 차량을 검색한다.',change:'차량번호 5자 이상 입력 후 조회할 때만 결과가 표시되며 실제 로컬 JSON 차량 목록을 사용한다.',targets:['.requirements-option3-selector__detail'],location:'차량 상세검색 펼침 영역',status:'UI 적용'},
      {number:3,id:'OPTION-3-003',ppt:'시안 3',title:'하위 메뉴 좌측 배치',request:'기존 상단 하위 메뉴를 좌측 메뉴로 이동해 현재 기능과 선택 상태를 명확히 표시한다.',change:'실제 활성 대메뉴의 하위 기능을 좌측에 표시하고 현재 화면을 활성 색상으로 구분했다.',targets:['.requirements-option3-side'],location:'좌측 하위 메뉴',status:'UI 적용'},
      {number:4,id:'OPTION-3-004',ppt:'시안 3',title:'실제 요약 데이터 유지',request:'네비게이션을 변경해도 기존 실제 화면의 조회 결과와 데이터 동작은 유지한다.',change:'실제 요약 API 응답과 차량 카드를 그대로 사용하고 업체·그룹·차량 선택 시 기존 화면 동작을 호출한다.',targets:['.local-body .content-body'],location:'요약정보 표와 차량 목록',status:'UI 적용 / 실제 JSON 사용'},
    ],
    'option3-summary-en': [
      {number:1,id:'OPTION-3-EN-001',ppt:'다국어 확인',title:'영문 화면 길이 검토',request:'동일한 시안 3 구조가 영문 메뉴와 긴 레이블에서도 깨지지 않아야 한다.',change:'실제 영문 라우트에 동일한 조회 대상·좌측 메뉴 구조를 적용해 폭과 줄바꿈을 확인한다.',targets:['.requirements-option3-selector','.requirements-option3-side'],location:'영문 조회 대상과 좌측 메뉴',status:'UI 적용'},
    ],
    'shock-horizontal': [
      {number:1,id:'R-OPS-CHART-H-001',ppt:'그래프 비교안',title:'그래프 축 전환',request:'기존의 가로 날짜·세로 충격값 구성을 가로 충격값·세로 날짜 구성으로 비교한다.',change:'실제 충격 데이터 표를 사용해 Y축에 1~31일, X축에 충격 횟수를 배치했다.',targets:['.requirements-horizontal-chart'],location:'일별 충격 횟수 축 전환 그래프',status:'UI 비교안'},
      {number:2,id:'R-OPS-CHART-H-002',ppt:'그래프 비교안',title:'축 값 상시 표시',request:'마우스를 올리지 않아도 날짜와 충격값 기준을 확인할 수 있어야 한다.',change:'Y축 날짜와 X축 충격 횟수 눈금을 항상 표시하고 상세값만 롤오버로 제공한다.',targets:['.requirements-horizontal-chart__axis','.requirements-horizontal-chart__rows'],location:'그래프 좌측 날짜와 상단 횟수 눈금',status:'UI 적용'},
      {number:3,id:'R-OPS-CHART-H-003',ppt:'그래프 비교안',title:'날짜별 상세 롤오버',request:'각 날짜의 민감·주의·경고·합계를 자세히 확인한다.',change:'막대에 마우스를 올리거나 키보드 포커스하면 날짜별 상세값과 합계를 툴팁으로 표시한다.',targets:['.requirements-horizontal-chart__rows'],location:'각 날짜의 가로 막대',status:'UI 적용'},
    ],
  };

  function routeItems() {
    if (specialItems[screen]) return specialItems[screen];
    return (data.requirementCallouts?.[screen] || []).filter(item => !(screen === 'service-errors' && item.id === 'R-SVC-005')).map(item => {
      if (item.id === 'R-SVC-001') {
        return {...item, change:'원본 3안의 실제 GNB를 유지하고 서비스 활성 밑줄을 다른 GNB 항목과 동일한 기준선·두께로 표시했다.', location:'상단 GNB의 서비스 활성 항목', targets:['.page-head .gnb-text.current']};
      }
      return item;
    });
  }

  const targetById = {
    'R-SVC-002':'.content-head', 'R-SVC-003':'.content-head', 'R-SVC-004':'.content-head',
    'R-SVC-005':'.srvc-tab', 'R-SVC-006':'.content-body table', 'R-SVC-007':'.requirements-prototype-side',
    'R-SVC-008':'.content-body table', 'R-SVC-009':'.content-body table',
    'R-MNT-001':'.content-body table', 'R-MNT-002':'.content-body table', 'R-MNT-003':'.content-body table', 'R-MNT-004':'.content-body table',
    'R-MNT-005':'.content-body table', 'R-MNT-006':'.content-body table', 'R-MNT-007':'.content-body table',
    'R-OPS-001':'.requirements-prototype-side', 'R-OPS-002':'.content-body', 'R-OPS-003':'.content-body',
    'R-OPS-004':'.content-body canvas',
    'R-OPS-005':'.content-body canvas',
    'R-OPS-006':'.content-head, .requirements-prototype-side', 'R-OPS-007':'.content-body canvas',
    'R-BAT-001':'.content-body', 'R-BAT-002':'.content-body canvas', 'R-BAT-003':'.content-body table',
    'R-HOME-001':'.goods-summary', 'R-HOME-002':'.goods-summary',
    'R-SUP-001':'.content-body table', 'R-SUP-002':'.linq-review-reset', 'R-SUP-003':'.content-head', 'R-SUP-004':'.content-body table',
    'R-DSH-002':'.linq-review-fullscreen-button',
  };

  function resolveTarget(item) {
    const selectors = [`[data-review-id~="${item.id}"]`, targetById[item.id], ...(item.targets || [])].filter(Boolean);
    for (const selectorList of selectors) {
      for (const selector of String(selectorList).split(',').map(value => value.trim())) {
        try {
          const target = document.querySelector(selector);
          if (target && target.getBoundingClientRect().width > 0) return target;
        } catch (_error) {}
      }
    }
    return document.querySelector('.local-body .content-body, .local-body, #page');
  }

  const items = routeItems();
  if (!items.length) return;
  const entries = [];
  let activeItem = null;

  const guide = document.createElement('button');
  guide.type = 'button';
  guide.className = 'linq-review-guide';
  guide.innerHTML = `<strong>수정 위치 ${items.length}건</strong><span>번호 선택 시 요청·수정·문제점 확인</span>`;
  document.body.append(guide);

  const drawer = document.createElement('aside');
  drawer.className = 'linq-review-drawer';
  drawer.hidden = true;
  document.body.append(drawer);

  function severityClass(value) {
    return value === '치명' ? 'is-critical' : value === '높음' ? 'is-high' : value === '중간' ? 'is-medium' : '';
  }

  function issuesFor(item) {
    return (issueMap[item.id] || []).map(id => ({id, ...problemCatalog[id]})).filter(issue => issue.title);
  }

  function highestSeverity(issues) {
    const rank = {'치명':4,'높음':3,'중간':2,'낮음':1};
    return issues.reduce((value, issue) => (rank[issue.severity] || 0) > (rank[value] || 0) ? issue.severity : value, '');
  }

  function problemHtml(issue) {
    return `<article class="linq-review-problem ${severityClass(issue.severity)}"><div class="linq-review-problem__head"><strong>${issue.id}</strong><span class="linq-review-severity ${severityClass(issue.severity)}">${issue.severity}</span></div><h5>${issue.title}</h5><p>${issue.detail}</p><dl><div><dt>영향</dt><dd>${issue.impact}</dd></div><div><dt>결정 필요</dt><dd>${issue.decision}</dd></div></dl></article>`;
  }

  function openItem(item) {
    activeItem = item;
    entries.forEach(entry => {
      const active = entry.item === item;
      entry.marker.classList.toggle('is-active', active);
      entry.target.classList.toggle('is-active', active);
    });
    const issues = issuesFor(item);
    const highest = highestSeverity(issues);
    const needed = /필요|확정|정책|비교/.test(item.status);
    drawer.innerHTML = `<div class="linq-review-drawer__head"><span class="linq-review-drawer__number">${item.number}</span><div><small>${item.ppt} · ${item.id}</small><h3>${item.title}</h3></div><button type="button" class="linq-review-drawer__close" aria-label="설명 닫기">×</button></div><div class="linq-review-drawer__body"><div class="linq-review-status-row"><span class="linq-review-status ${needed ? 'is-needed' : ''}">${item.status}</span>${issues.length ? `<span class="linq-review-severity ${severityClass(highest)}">문제점 ${issues.length}건 · 최고 ${highest}</span>` : '<span class="linq-review-severity">연결 문제점 없음</span>'}</div><section><h4>요청 내용</h4><p>${item.request}</p></section><section><h4>수정한 방식</h4><p>${item.change}</p></section><section class="linq-review-location"><h4>화면에서 확인할 위치</h4><p>${item.location}</p></section>${issues.length ? `<section><h4>요구사항 정의서 문제점 연결</h4>${issues.map(problemHtml).join('')}</section>` : ''}</div>`;
    drawer.hidden = false;
    drawer.querySelector('.linq-review-drawer__close').addEventListener('click', closeDrawer);
  }

  function closeDrawer() {
    drawer.hidden = true;
    activeItem = null;
    entries.forEach(entry => {
      entry.marker.classList.remove('is-active');
      entry.target.classList.remove('is-active');
    });
  }

  function mountMarkers() {
    entries.splice(0).forEach(entry => entry.marker.remove());
    const usage = new Map();
    items.forEach(item => {
      const target = resolveTarget(item);
      if (!target) return;
      const offset = usage.get(target) || 0;
      usage.set(target, offset + 1);
      target.classList.add('linq-review-target');
      const marker = document.createElement('button');
      marker.type = 'button';
      marker.className = 'linq-review-marker';
      marker.textContent = item.number;
      marker.title = `${item.id} · ${item.title}`;
      marker.addEventListener('click', event => { event.stopPropagation(); openItem(item); });
      document.body.append(marker);
      entries.push({item, target, marker, offset});
    });
    positionMarkers();
  }

  function positionMarkers() {
    const occupied = [];
    const periodControls = document.querySelector('.linq-review-service-toolbar-row .filter-form__body');
    const periodTop = periodControls?.getBoundingClientRect().top;
    const alignedPeriodIds = new Set(['R-SVC-002', 'R-SVC-003', 'R-SVC-004']);
    entries.forEach(entry => {
      const rect = entry.target.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = document.documentElement.clientHeight;
      const visible = rect.width > 0 && rect.height > 0 && rect.right > 0 && rect.left < viewportWidth && rect.bottom > 0 && rect.top < viewportHeight;
      entry.marker.hidden = !visible;
      if (!visible) return;
      let left = window.scrollX + rect.right - 13 - entry.offset * 30;
      const markerTop = alignedPeriodIds.has(entry.item.id) && Number.isFinite(periodTop) ? periodTop : rect.top;
      const top = window.scrollY + Math.max(4, markerTop - 9);
      left = Math.min(left, window.scrollX + viewportWidth - 30);
      while (occupied.some(point => Math.abs(point.left - left) < 27 && Math.abs(point.top - top) < 27)) left -= 30;
      occupied.push({left, top});
      entry.marker.style.left = `${Math.max(3, left)}px`;
      entry.marker.style.top = `${top}px`;
    });
  }

  guide.addEventListener('click', () => openItem(items[0]));
  window.addEventListener('scroll', positionMarkers, {passive:true});
  window.addEventListener('resize', positionMarkers);
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && activeItem) closeDrawer(); });
  mountMarkers();
  const observer = new MutationObserver(() => {
    window.clearTimeout(observer.timer);
    observer.timer = window.setTimeout(() => {
      if (entries.length !== items.length || entries.some(entry => !entry.target.isConnected || !entry.marker.isConnected)) mountMarkers();
      else positionMarkers();
      applyRequirementContent();
    }, 80);
  });
  observer.observe(document.querySelector('#page') || document.body, {childList:true, subtree:true});

  function markReview(node, ...ids) {
    if (!node) return node;
    const values = new Set((node.dataset.reviewId || '').split(/\s+/).filter(Boolean));
    ids.flat().filter(Boolean).forEach(id => values.add(id));
    node.dataset.reviewId = [...values].join(' ');
    return node;
  }

  function exactText(root, selector, value) {
    return [...root.querySelectorAll(selector)].find(node => node.textContent.trim() === value) || null;
  }

  function contentBody() {
    return document.querySelector('.local-body .content-body, #content .content-body, .content-body, .local-body');
  }

  function insertColumn(table, key, label, index, valueForRow, reviewIds = []) {
    const headerRow = table.querySelector('thead tr');
    if (!headerRow) return null;
    let header = headerRow.querySelector(`[data-review-column="${key}"]`);
    if (header) return header;
    header = document.createElement('th');
    header.dataset.reviewColumn = key;
    header.textContent = label;
    headerRow.insertBefore(header, headerRow.children[index] || null);
    [...table.querySelectorAll('tbody tr')].forEach((row, rowIndex) => {
      const cell = document.createElement('td');
      cell.dataset.reviewColumn = key;
      const value = valueForRow(row, rowIndex);
      if (value instanceof Node) cell.append(value);
      else cell.textContent = value == null || value === '' ? '-' : String(value);
      row.insertBefore(cell, row.children[index] || null);
    });
    markReview(header, reviewIds);
    return header;
  }

  function configurePeriodFilterBase(content) {
    const dayText = exactText(content, '.radio__text, button', '일');
    const customText = exactText(content, '.radio__text, button', '사용자설정');
    const day = dayText?.closest('label, button') || dayText;
    const custom = customText?.closest('label, button') || customText;
    const inputs = [...content.querySelectorAll('input')].filter(input => /date|text/i.test(input.type || 'text'));
    if (day) {
      markReview(day, 'R-SVC-002');
      if (!day.dataset.reviewDefaultPeriod) {
        day.dataset.reviewDefaultPeriod = 'true';
        const radio = day.querySelector('input[type="radio"]');
        if (radio) {
          [...content.querySelectorAll('input[type="radio"]')].filter(input => ['daily', 'weekly', 'monthly', 'custom'].includes(input.value)).forEach(input => { input.checked = input === radio; });
        }
        document.activeElement?.blur();
      }
    }
    if (inputs.length >= 2) {
      inputs.slice(0, 2).forEach(input => {
        input.disabled = false;
        input.removeAttribute('readonly');
        input.addEventListener('input', () => custom?.click(), { once: true });
      });
      markReview(inputs[0].parentElement, 'R-SVC-004');
      content.querySelectorAll('.linq-review-period-help, .linq-review-period-info-button, .linq-static-period-info').forEach(node => node.remove());
    }
    const form = inputs[0]?.closest('.filter-form');
    const head = content.closest('.content-container')?.querySelector(':scope > .content-head')
      || content.parentElement?.querySelector(':scope > .content-head')
      || document.querySelector('.content-head');
    if (form && head) {
      const toolbar = form.closest('.linq-review-service-toolbar-row');
      head.classList.add('linq-review-title-filter-row');
      if (form.parentElement !== head) head.append(form);
      toolbar?.classList.add('linq-review-period-detached');
    }
  }

  function configurePeriodFilter(content) {
    configurePeriodFilterBase(content);

    const customText = exactText(content, '.radio__text, button', '사용자설정');
    const custom = customText?.closest('label, button') || customText;
    if (!custom?.parentElement) return;

    custom.parentElement.querySelectorAll('.linq-review-period-info-button, .linq-static-period-info').forEach(node => node.remove());
    document.getElementById('linq-review-period-popover')?.remove();
    const form = custom.closest('.filter-form');
    if (form) {
      let help = form.querySelector('.linq-review-period-help');
      if (!help) {
        help = document.createElement('p');
        help.className = 'linq-review-period-help';
        form.prepend(help);
      }
      help.textContent = '사용자설정 조회기간은 최대 31일까지 선택할 수 있습니다.';
    }
    markReview(custom, 'R-SVC-003');
    return;

    const helpText = '시작일과 종료일을 직접 선택합니다. 서버에서 허용하는 최대 조회 범위는 확인이 필요합니다.';
    custom.parentElement.classList.add('linq-review-period-control-row');
    const duplicates = [...custom.parentElement.querySelectorAll('.linq-review-period-info-button, .linq-static-period-info')];
    let info = duplicates.shift();
    duplicates.forEach(node => node.remove());
    if (!info) {
      info = document.createElement('button');
      info.type = 'button';
      info.textContent = 'i';
    }
    info.classList.add('linq-review-period-info-button');
    info.setAttribute('title', helpText);
    info.setAttribute('aria-label', helpText);
    custom.parentElement.insertBefore(info, custom.nextSibling);

    let popover = document.getElementById('linq-review-period-popover');
    if (!popover) {
      popover = document.createElement('div');
      popover.id = 'linq-review-period-popover';
      popover.className = 'linq-review-period-popover';
      popover.hidden = true;
      popover.setAttribute('role', 'tooltip');
      popover.setAttribute('aria-hidden', 'true');
      document.body.append(popover);
    }
    popover.textContent = helpText;
    info.setAttribute('aria-controls', popover.id);
    info.setAttribute('aria-expanded', 'false');

    const closePopover = () => {
      info.classList.remove('is-open');
      info.setAttribute('aria-expanded', 'false');
      popover.hidden = true;
      popover.setAttribute('aria-hidden', 'true');
    };
    const positionPopover = () => {
      if (popover.hidden) return;
      const rect = info.getBoundingClientRect();
      const width = Math.min(360, Math.max(240, window.innerWidth - 32));
      const left = Math.min(window.innerWidth - width - 16, Math.max(16, rect.right - width));
      popover.style.width = `${width}px`;
      popover.style.left = `${left}px`;
      popover.style.top = `${rect.bottom + 8}px`;
    };

    info.onclick = event => {
      event.preventDefault();
      event.stopPropagation();
      if (!popover.hidden) {
        closePopover();
        return;
      }
      info.classList.add('is-open');
      info.setAttribute('aria-expanded', 'true');
      popover.hidden = false;
      popover.setAttribute('aria-hidden', 'false');
      positionPopover();
    };
    info.onkeydown = event => {
      if (event.key === 'Escape') closePopover();
    };
    if (document.body.dataset.periodInfoOutsideBound !== 'true') {
      document.body.dataset.periodInfoOutsideBound = 'true';
      document.addEventListener('click', event => {
        const activeButton = document.querySelector('.linq-review-period-info-button.is-open');
        const activePopover = document.getElementById('linq-review-period-popover');
        if (activeButton && activePopover && !activeButton.contains(event.target) && !activePopover.contains(event.target)) {
          activeButton.classList.remove('is-open');
          activeButton.setAttribute('aria-expanded', 'false');
          activePopover.hidden = true;
          activePopover.setAttribute('aria-hidden', 'true');
        }
      });
    }
    window.__linqPositionPeriodPopover = positionPopover;
    if (window.__linqPeriodPopoverWindowBound !== true) {
      window.__linqPeriodPopoverWindowBound = true;
      window.addEventListener('resize', () => window.__linqPositionPeriodPopover?.());
      window.addEventListener('scroll', () => window.__linqPositionPeriodPopover?.(), true);
    }
    markReview(info, 'R-SVC-003');
  }

  function removeHeaderCompanySearch() {
    const input = document.querySelector('input[placeholder="Find Company"]');
    if (!input) return;
    const dropdown = input.closest('.dropdown');
    const wrapper = dropdown?.parentElement;
    if (wrapper && wrapper.children.length === 1) wrapper.remove();
    else dropdown?.remove();
  }

  function markPrototypeSide() {
    const side = document.querySelector('.requirements-prototype-side');
    if (!side) return;
    if (screen === 'service-errors') {
      const active = [...side.querySelectorAll('.side-item')].find(item => item.textContent.replace(/\s/g, '').includes('차량에러'));
      markReview(active || side, 'R-SVC-007');
    }
    if (screen === 'operation-shock') markReview(side, 'R-OPS-001');
    if (screen === 'engine-efficiency') markReview(side, 'R-OPS-006');
  }

  function configureServiceSummary() {
    if (!isServiceScreen) return {};
    const serviceTabs = document.querySelector('.srvc-tab');
    if (!serviceTabs) return {};
    const errorSummary = serviceTabs.querySelector('.srvc-tab__item[data-icon="error"]');
    const batterySummary = serviceTabs.querySelector('.srvc-tab__item[data-icon="battery"]');
    if (serviceTabs.dataset.reviewCompactSummary !== 'true') {
      const errorCount = errorSummary?.querySelector('.srvc-tab__count');
      const batteryCount = batterySummary?.querySelector('.srvc-tab__count');
      if (errorCount && batteryCount) {
        const mergedCount = (Number(errorCount.textContent.replace(/[^0-9]/g, '')) || 0)
          + (Number(batteryCount.textContent.replace(/[^0-9]/g, '')) || 0);
        errorCount.textContent = String(mergedCount);
      }
      [...serviceTabs.querySelectorAll('.srvc-tab__item')].forEach(item => {
        if (!['maintenance', 'supplies', 'error'].includes(item.dataset.icon || '')) item.remove();
      });
      serviceTabs.dataset.reviewCompactSummary = 'true';
    serviceTabs.classList.add('linq-review-service-summary-compact');
    let storedCounts = {};
    try { storedCounts = JSON.parse(sessionStorage.getItem('linqReviewServiceCounts') || '{}'); } catch (_error) {}
    const fallbackCounts = {maintenance: 3};
    serviceTabs.querySelectorAll('.srvc-tab__item[data-icon]').forEach(item => {
      const icon = item.dataset.icon;
      const count = item.querySelector('.srvc-tab__count');
      const current = Number(count?.textContent.replace(/[^0-9]/g, '')) || 0;
      const replacement = Number(storedCounts[icon] ?? fallbackCounts[icon]) || 0;
      if (count && current === 0 && replacement > 0) count.textContent = String(replacement);
    });
      serviceTabs.setAttribute('aria-label', '\uc11c\ube44\uc2a4 \ud604\ud669 \uc694\uc57d');
    }
    serviceTabs.classList.add('linq-review-service-summary-in-side');
    mountServiceCountsInSide();
    return {serviceTabs, errorSummary};
  }

  function mountServiceCountsInSide() {
    if (!isServiceScreen) return;
    const serviceTabs = document.querySelector('.srvc-tab');
    const side = document.querySelector('.requirements-prototype-side .analysis-menu-list');
    if (!serviceTabs || !side) return;
    let storedCounts = {};
    try { storedCounts = JSON.parse(sessionStorage.getItem('linqReviewServiceCounts') || '{}'); } catch (_error) {}
    const counts = {};
    serviceTabs.querySelectorAll('.srvc-tab__item[data-icon]').forEach(item => {
      const icon = item.dataset.icon;
      const current = Number(item.querySelector('.srvc-tab__count')?.textContent.replace(/[^0-9]/g, '')) || 0;
      counts[icon] = current || Number(storedCounts[icon]) || 0;
    });
    const fallbackCounts = {maintenance: 3, supplies: 213, error: 3};
    [
      {label: '정비이력', icon: 'maintenance'},
      {label: '소모품관리', icon: 'supplies'},
      {label: '차량에러', icon: 'error'},
    ].forEach(({label, icon}) => {
      const item = [...side.querySelectorAll('.side-item')]
        .find(button => button.textContent.replace(/\s/g, '').includes(label));
      const text = item?.querySelector('em');
      if (!text) return;
      let badge = text.querySelector('.linq-review-side-count');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'linq-review-side-count';
        text.append(badge);
      }
      badge.textContent = String(fallbackCounts[icon]);
      badge.setAttribute('aria-label', `${label} ${badge.textContent}건`);
    });
  }

  function syncServiceSummaryCount(content) {
    const iconByScreen = {'maintenance-history':'maintenance','supplies-management':'supplies','service-errors':'error'};
    const icon = iconByScreen[screen];
    if (!icon) return;
    const rows = [...(content.querySelector('table')?.tBodies?.[0]?.rows || [])]
      .filter(row => row.cells.length && row.textContent.trim());
    if (!rows.length) return;
    const count = document.querySelector(`.srvc-tab__item[data-icon="${icon}"] .srvc-tab__count`);
    if (count && count.textContent.trim() !== String(rows.length)) count.textContent = String(rows.length);
    try {
      const stored = JSON.parse(sessionStorage.getItem('linqReviewServiceCounts') || '{}');
      stored[icon] = rows.length;
      sessionStorage.setItem('linqReviewServiceCounts', JSON.stringify(stored));
    } catch (_error) {}
    mountServiceCountsInSide();
  }

  function applyDealerServiceErrors(content) {
    configurePeriodFilter(content);
    configureServiceSummary();
    const table = content.querySelector('table');
    if (!table || table.dataset.reviewDealerServiceApplied) return;
    table.dataset.reviewDealerServiceApplied = 'true';
    const scoped = node => {
      table.getAttributeNames().filter(name => name.startsWith('data-v-')).forEach(name => node.setAttribute(name, ''));
      return node;
    };
    const labels = ['\ub51c\ub7ec','\uadf8\ub8f9/\uace0\uac1d\uba85','\ud638\uae30 / \uae30\uc885','\ud604\uc7ac/\uacfc\uac70','\uc5d0\ub7ec\ucf54\ub4dc(\ucf54\ub4dc/SPN/FMI)','\uc124\uba85','\uc911\uc694\ub3c4','\ubc1c\uc0dd\uc77c\uc2dc','\uc644\ub8cc \uc77c\uc2dc'];
    const widths = ['7%','10%','16%','7%','16%','20%','7%','9%','8%'];
    let colgroup = table.querySelector('colgroup');
    if (!colgroup) {
      colgroup = scoped(document.createElement('colgroup'));
      table.prepend(colgroup);
    }
    colgroup.replaceChildren(...widths.map(width => {
      const col = scoped(document.createElement('col'));
      col.style.width = width;
      return col;
    }));
    const headerRow = table.querySelector('thead tr') || scoped(table.createTHead().insertRow());
    headerRow.replaceChildren(...labels.map((label, index) => {
      const th = scoped(document.createElement('th'));
      th.scope = 'col';
      th.textContent = label;
      if (index === 4) markReview(th, 'D-SVC-002');
      if (index === 6) markReview(th, 'D-SVC-003');
      return th;
    }));
    const rows = [
      ['\ucda9\ubd81\ub51c\ub7ec','(\uc8fc)\ub450\uc0b0',{serial:'FDB12-000345',model:'D30SE-9'},'\ud604\uc7ac','P0196/175/11','\uc624\uc77c \uc628\ub3c4/\ub808\ubca8 \uc13c\uc11c \uc624\uc77c \uc628\ub3c4 \ubc94\uc704 \ucd08\uacfc','\ub192\uc74c','2026-07-15 14:46','-'],
      ['\ucda9\ubd81\ub51c\ub7ec','(\uc8fc)\ub450\uc0b0',{serial:'FDB12-000345',model:'D30SE-9'},'\ud604\uc7ac','P0562/168/17','\uc2dc\uc2a4\ud15c \uc804\uc555 \ub0ae\uc74c','\uc911\uac04','2026-07-14 09:22','-'],
      ['\ucda9\ubd81\ub51c\ub7ec','(\uc8fc)\ub450\uc0b0',{serial:'FDB12-000345',model:'D30SE-9'},'\uacfc\uac70','P0196/175/11','\uc624\uc77c \uc628\ub3c4/\ub808\ubca8 \uc13c\uc11c \uc624\uc77c \uc628\ub3c4 \ubc94\uc704 \ucd08\uacfc','\ub192\uc74c','2026-07-10 11:08','2026-07-11 15:30'],
    ];
    const body = table.tBodies[0] || table.createTBody();
    body.replaceChildren(...rows.map(values => {
      const tr = scoped(document.createElement('tr'));
      values.forEach(value => {
        const td = scoped(document.createElement('td'));
        if (value && typeof value === 'object') {
          td.className = 'linq-review-dealer-equipment';
          const serial = document.createElement('strong');
          serial.textContent = value.serial;
          const model = document.createElement('span');
          model.textContent = value.model;
          td.append(serial, model);
        } else {
          td.textContent = value;
        }
        tr.append(td);
      });
      return tr;
    }));
    table.style.minWidth = '100%';
    table.style.width = '100%';
    markReview(table, 'D-SVC-001');
  }

  function applyServiceErrors(content) {
    if (isDealerPreview) {
      applyDealerServiceErrors(content);
      return;
    }
    configurePeriodFilter(content);
    const serviceTabs = document.querySelector('.srvc-tab');
    const errorSummary = serviceTabs?.querySelector('.srvc-tab__item[data-icon="error"]');
    const batterySummary = serviceTabs?.querySelector('.srvc-tab__item[data-icon="battery"]');
    const errorCount = errorSummary?.querySelector('.srvc-tab__count');
    const batteryCount = batterySummary?.querySelector('.srvc-tab__count');
    if (errorCount && batteryCount) {
      const mergedCount = (Number(errorCount.textContent.replace(/[^0-9]/g, '')) || 0) + (Number(batteryCount.textContent.replace(/[^0-9]/g, '')) || 0);
      errorCount.textContent = String(mergedCount);
    }
    if (serviceTabs) serviceTabs.remove();
    const table = content.querySelector('table');
    if (!table || table.dataset.reviewServiceApplied) return;
    table.dataset.reviewServiceApplied = 'true';
    const headers = [...table.querySelectorAll('thead th')];
    const headerIndex = patterns => {
      const values = Array.isArray(patterns) ? patterns : [patterns];
      return headers.findIndex(cell => values.some(pattern => cell.textContent.trim().includes(pattern)));
    };
    const stateIndex = headerIndex(['현재/과거', '상태']);
    const codeIndex = headerIndex(['에러코드', '코드']);
    const contentIndex = headerIndex(['내용']);
    const severityIndex = headerIndex('중요도');
    const occurredIndex = headerIndex(['발생일시']);
    const completedIndex = headerIndex(['완료일시']);
    const actionIndex = headerIndex(['조치방법']);
    const selectedVehicle = decodeURIComponent(location.pathname.match(/\/(?:equip|vehicle)\/([^/?#]+)/)?.[1] || '');
    const body = table.tBodies[0] || table.createTBody();
    if (selectedVehicle && !body.rows.length) {
      [
        ['현재','기본그룹',selectedVehicle,'BMS-0193','배터리 통신 오류','높음','2026-08-13 14:00','',''],
        ['현재','기본그룹',selectedVehicle,'J1939 DM1 · SPN 523614 / FMI 2','엔진 오류 (J1939 DM1)','중간','2026-08-13 13:59','',''],
      ].forEach(values => {
        const row = body.insertRow();
        values.slice(0, headers.length).forEach(value => {
          const cell = row.insertCell();
          cell.textContent = value;
        });
      });
    }
    [...table.querySelectorAll('tbody tr')].forEach((row, index) => {
      const cells = row.cells;
      if (index === 0 && cells[codeIndex]) cells[codeIndex].textContent = 'BMS-0193';
      if (index === 0 && cells[contentIndex]) cells[contentIndex].textContent = '배터리 통신 오류';
      if (index === 1 && cells[codeIndex]) cells[codeIndex].textContent = 'J1939 DM1 · SPN 523614 / FMI 2';
      if (index === 1 && cells[contentIndex]) cells[contentIndex].textContent = '엔진 오류 (J1939 DM1)';
      if (cells[severityIndex] && index === 0) cells[severityIndex].textContent = '높음';
      if (cells[severityIndex] && index === 1) cells[severityIndex].textContent = '중간';
      if (cells[actionIndex]) cells[actionIndex].textContent = '';
    });
    markReview(table, 'R-SVC-006');
    if (severityIndex >= 0) markReview(headers[severityIndex], 'R-SVC-009');
    if (actionIndex >= 0) markReview(headers[actionIndex], 'R-SVC-008');
  }

  function applyDealerMaintenance(content) {
    configurePeriodFilter(content);
    configureServiceSummary();
    [...content.querySelectorAll('.section-top__text')]
      .filter(title => title.textContent.trim().startsWith('장비점검 목록'))
      .forEach(title => title.remove());
    const table = content.querySelector('table');
    if (!table || table.dataset.reviewDealerMaintenanceApplied) return;
    table.dataset.reviewDealerMaintenanceApplied = 'true';
    const scoped = node => {
      table.getAttributeNames().filter(name => name.startsWith('data-v-')).forEach(name => node.setAttribute(name, ''));
      return node;
    };
    const labels = ['딜러','그룹/고객명','호기 / 기종','Claim 번호','정비 일시','고장부위','현상','상세내용','완료 여부'];
    const widths = ['7%','10%','14%','12%','10%','13%','8%','19%','7%'];
    let colgroup = table.querySelector('colgroup');
    if (!colgroup) {
      colgroup = scoped(document.createElement('colgroup'));
      table.prepend(colgroup);
    }
    colgroup.replaceChildren(...widths.map(width => {
      const col = scoped(document.createElement('col'));
      col.style.width = width;
      return col;
    }));
    const headerRow = table.querySelector('thead tr') || scoped(table.createTHead().insertRow());
    headerRow.replaceChildren(...labels.map(label => {
      const th = scoped(document.createElement('th'));
      th.scope = 'col';
      th.textContent = label;
      return th;
    }));
    const rows = [
      ['충북딜러','(주)두산',{serial:'FDB12-000345',model:'D30SE-9'},'수리 ID 확인 필요','2026-05-06','엔진 주변/에어컨 컴프레서','이음','아이들풀리가 조기 마모되어 벨트가 끊어지며, 텐션 베어링 및 에어컨 컴프레서 파손','O'],
      ['충북딜러','(주)두산',{serial:'FDB12-000418',model:'D30SE-9'},'수리 ID 확인 필요','2026-04-22','유압 계통','압력 저하','유압 호스 연결부 누유 확인 후 호스와 씰 교체','O'],
      ['경기딜러','세종물류',{serial:'FBA34-224250279',model:'B35S-7'},'수리 ID 확인 필요','2026-04-18','배터리 계통','충전 불량','충전 커넥터 접촉 상태 점검 및 단자 교체 진행 중','X'],
    ];
    const body = table.tBodies[0] || table.createTBody();
    body.replaceChildren(...rows.map(values => {
      const tr = scoped(document.createElement('tr'));
      values.forEach(value => {
        const td = scoped(document.createElement('td'));
        if (value && typeof value === 'object') {
          td.className = 'linq-review-dealer-equipment';
          const serial = document.createElement('strong');
          serial.textContent = value.serial;
          const model = document.createElement('span');
          model.textContent = value.model;
          td.append(serial, model);
        } else {
          td.textContent = value;
        }
        tr.append(td);
      });
      return tr;
    }));
    [...content.querySelectorAll('button')].filter(button => ['등록','수정','삭제'].includes(button.textContent.trim())).forEach(button => button.remove());
    table.style.minWidth = '100%';
    table.style.width = '100%';
    markReview(table, 'D-MNT-001');
    markReview(headerRow.cells[2], 'D-MNT-002');
    markReview(headerRow.cells[3], 'D-MNT-004');
    markReview(headerRow.cells[8], 'D-MNT-003');
  }

  function applyMaintenance(content) {
    if (isDealerPreview) {
      applyDealerMaintenance(content);
      return;
    }
    const table = content.querySelector('table');
    if (!table || table.dataset.reviewMaintenanceApplied) return;
    table.dataset.reviewMaintenanceApplied = 'true';
    const headerRow = table.querySelector('thead tr');
    const originalHeaders = [...headerRow.cells];
    const editIndex = originalHeaders.findIndex(cell => /수정|삭제/.test(cell.textContent));
    if (editIndex >= 0) {
      headerRow.cells[editIndex]?.remove();
      [...table.querySelectorAll('tbody tr')].forEach(row => row.cells[editIndex]?.remove());
    }
    [...content.querySelectorAll('button')].filter(button => ['등록', '수정', '삭제'].includes(button.textContent.trim())).forEach(button => button.remove());
    insertColumn(table, 'claim', 'Claim 번호', 2, (_row, index) => `CLM-2608${String(17 - index).padStart(2, '0')}-${String(index + 1).padStart(3, '0')}`, ['R-MNT-001']);
    const headers = [...table.querySelectorAll('thead th')];
    const maintenanceIndex = headers.findIndex(cell => cell.textContent.trim() === '접수일시');
    if (maintenanceIndex >= 0) {
      headers[maintenanceIndex].textContent = '정비일시';
      headers[maintenanceIndex].dataset.reviewColumn = 'maintenance-at';
      markReview(headers[maintenanceIndex], 'R-MNT-003');
    }
    const completedIndex = headers.findIndex(cell => cell.textContent.trim() === '완료일시');
    if (completedIndex >= 0) {
      headers[completedIndex].textContent = '완료 여부';
      headers[completedIndex].dataset.reviewColumn = 'completed';
      markReview(headers[completedIndex], 'R-MNT-004');
      [...table.querySelectorAll('tbody tr')].forEach(row => { row.cells[completedIndex].textContent = row.cells[completedIndex].textContent.trim() ? 'O' : 'X'; });
    }
    markReview(table, 'R-MNT-002', 'R-MNT-005', 'R-MNT-006', 'R-MNT-007');
  }

  function chartMarkup(title, unit, values, color, detailFor) {
    const bars = values.map((value, index) => `<button type="button" class="linq-review-month-chart__bar" style="--bar:${Math.max(4, value)}%;--bar-color:${color}" data-tooltip="${detailFor(index, value)}" aria-label="${detailFor(index, value)}"><span></span></button>`).join('');
    const dates = values.map((_value, index) => `<span>${index + 1}</span>`).join('');
    return `<section class="linq-review-chart-panel"><div class="linq-review-chart-panel__head"><h4>${title}</h4><span>1일~31일 · ${unit} · 막대에 올리면 상세 표시</span></div><div class="linq-review-month-chart"><div class="linq-review-month-chart__unit">${unit}</div><div class="linq-review-month-chart__y"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><div class="linq-review-month-chart__plot">${bars}</div><div class="linq-review-month-chart__dates">${dates}</div><div class="linq-review-month-chart__x-label">일자</div></div></section>`;
  }

  function replaceActualChart(content, options) {
    const canvases = [...content.querySelectorAll('canvas')];
    const canvas = canvases.at(-1);
    const section = canvas?.closest('.content-section') || [...content.querySelectorAll('.content-section')].at(-1) || content;
    const host = section.querySelector('.content-section__body') || section;
    if (host.dataset.reviewChartApplied === options.key) return host.querySelector('.linq-review-chart-panel');
    host.dataset.reviewChartApplied = options.key;
    host.replaceChildren();
    host.insertAdjacentHTML('afterbegin', chartMarkup(options.title, options.unit, options.values, options.color, options.detailFor));
    return host.querySelector('.linq-review-chart-panel');
  }

  function addMetricStrip(before, metrics, reviewId) {
    const parent = before.parentElement;
    let strip = parent?.querySelector(`.linq-review-metric-strip[data-strip="${reviewId}"]`);
    if (strip) return strip;
    strip = document.createElement('div');
    strip.className = 'linq-review-metric-strip';
    strip.dataset.strip = reviewId;
    strip.innerHTML = metrics.map(([label, value]) => `<div><small>${label}</small><strong>${value}</strong></div>`).join('');
    markReview(strip, reviewId);
    parent?.insertBefore(strip, before);
    return strip;
  }

  function applyOperationEfficiency(content) {
    if (content.dataset.reviewOperationApplied) return;
    content.dataset.reviewOperationApplied = 'true';
    const topGroup = content.querySelector('.operate-top-group');
    if (topGroup && !topGroup.dataset.reviewPruned) {
      topGroup.dataset.reviewPruned = 'true';
      topGroup.querySelector('.content-section')?.remove();
    }
    markReview(content, 'R-OPS-002', 'R-OPS-003');
    const canvas = [...content.querySelectorAll('canvas')].at(-1);
    markReview(canvas?.parentElement || canvas || content, 'R-OPS-004', 'R-OPS-005');
  }

  function replaceExactText(root, from, to) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) if (walker.currentNode.nodeValue.trim() === from) nodes.push(walker.currentNode);
    nodes.forEach(node => { node.nodeValue = node.nodeValue.replace(from, to); });
  }

  function applyEngineEfficiency(content) {
    replaceExactText(document.querySelector('.content-head, #content') || content, '엔진', '엔진 연비');
    replaceExactText(document.querySelector('.content-path') || content, '엔진', '엔진 연비');
    const title = document.querySelector('.content-head');
    markReview(title, 'R-OPS-006');
    if (content.dataset.reviewEngineApplied) return;
    content.dataset.reviewEngineApplied = 'true';
    const canvas = [...content.querySelectorAll('canvas')].at(-1);
    markReview(canvas?.parentElement || canvas || content, 'R-OPS-007');
  }

  function applyLithiumBattery(content) {
    if (content.dataset.reviewBatteryApplied) return;
    content.dataset.reviewBatteryApplied = 'true';
    [...content.querySelectorAll('.content-section')].filter(section => /^오류정보/.test(section.textContent.trim())).forEach(section => section.remove());
    markReview(content, 'R-BAT-001');
    const table = content.querySelector('table');
    markReview(table || content, 'R-BAT-003');
    const canvas = [...content.querySelectorAll('canvas')].at(-1);
    markReview(canvas?.parentElement || canvas || content, 'R-BAT-002');
  }

  function applyHomeVehicles(content) {
    const cards = [...content.querySelectorAll('.goods-summary')];
    if (!cards.length || content.dataset.reviewHomeApplied) return;
    content.dataset.reviewHomeApplied = 'true';
    cards.forEach(card => markReview(card, 'R-HOME-001'));
    markReview(cards[0], 'R-HOME-002');
  }

  function bindResetButton(button, dateCell) {
    if (button.dataset.reviewResetBound) return;
    button.dataset.reviewResetBound = 'true';
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      dateCell.textContent = '2026-08-21 14:00:00';
      button.textContent = '리셋 완료';
      button.classList.add('is-complete');
    }, true);
  }

  function applySupplies(content) {
    const table = content.querySelector('table');
    if (!table || table.dataset.reviewSuppliesApplied) return;
    table.dataset.reviewSuppliesApplied = 'true';
    const headers = [...table.querySelectorAll('thead th')];
    const dateIndex = headers.findIndex(cell => cell.textContent.trim() === '등록일자');
    const actionIndex = headers.findIndex(cell => cell.textContent.trim() === '수정');
    if (dateIndex >= 0) {
      headers[dateIndex].textContent = '관리 시작 시점';
      markReview(headers[dateIndex], 'R-SUP-004');
    }
    if (actionIndex >= 0) headers[actionIndex].textContent = '관리';
    [...table.querySelectorAll('tbody tr')].forEach((row, index) => {
      const button = row.cells[actionIndex]?.querySelector('button') || row.querySelector('button');
      if (!button) return;
      button.textContent = '리셋';
      button.classList.add('linq-review-reset');
      if (index === 0) markReview(button, 'R-SUP-001', 'R-SUP-002');
      const dateCell = row.cells[dateIndex];
      if (dateCell) {
        dateCell.dataset.resetBase = 'true';
        if (index === 0) markReview(dateCell, 'R-SUP-004');
        bindResetButton(button, dateCell);
      }
    });
    markReview(document.querySelector('.content-head') || table, 'R-SUP-003');
  }

  function ensureDashboardControls() {
    if (screen !== 'dashboard' || document.querySelector('.linq-review-fullscreen-button')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'linq-review-fullscreen-button';
    button.textContent = '전체화면';
    button.addEventListener('click', () => {
      const active = document.body.classList.toggle('linq-review-dashboard-fullscreen');
      button.textContent = active ? '전체화면 종료' : '전체화면';
    });
    markReview(button, 'R-DSH-002');
    const host = document.querySelector('.content-head, .page-management [class*="head"], .page-management') || document.body;
    host.append(button);
  }

  function applyRequirementContent() {
    removeHeaderCompanySearch();
    document.querySelectorAll('.linq-review-fallback').forEach(node => node.remove());
    document.querySelectorAll('.linq-review-original-hidden').forEach(node => node.classList.remove('linq-review-original-hidden'));
    const content = contentBody();
    ensureDashboardControls();
    markPrototypeSide();
    if (!content) return;
    if (isServiceScreen) configureServiceSummary();
    if (['service-errors', 'maintenance-history', 'supplies-management'].includes(screen)) configurePeriodFilter(content);
    if (screen === 'service-errors') applyServiceErrors(content);
    if (screen === 'maintenance-history') applyMaintenance(content);
    if (screen === 'operation-efficiency') applyOperationEfficiency(content);
    if (screen === 'engine-efficiency') applyEngineEfficiency(content);
    if (screen === 'lithium-battery') applyLithiumBattery(content);
    if (screen === 'home-vehicles') applyHomeVehicles(content);
    if (screen === 'supplies-management') applySupplies(content);
    syncServiceSummaryCount(content);
    const needsRefine = document.body.dataset.reviewMarkersRefined !== 'true';
    if (needsRefine) {
      document.body.dataset.reviewMarkersRefined = 'true';
      mountMarkers();
    } else if (entries.length !== items.length || entries.some(entry => !entry.target.isConnected || !entry.marker.isConnected)) {
      mountMarkers();
    } else {
      positionMarkers();
    }
  }

  applyRequirementContent();
})();
