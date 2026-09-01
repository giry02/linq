(() => {
  if (window.__linqReviewOverlayMounted) return;
  window.__linqReviewOverlayMounted = true;

  const data = window.LINQ_REQUIREMENT_REVIEW || {};
  const screen = window.LINQ_REVIEW_SCREEN || document.documentElement.dataset.linqReviewScreen || '';
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
    const hiddenIds = screen === 'service-errors' ? new Set(['R-SVC-005']) : new Set();
    if (screen === 'lithium-battery') {
      const compare = new URLSearchParams(location.search).get('batteryCompare') === '1';
      return (data.requirementCallouts?.[screen] || []).filter(item => item.id === 'R-BAT-001' || (compare && item.id === 'R-BAT-002'));
    }
    return (data.requirementCallouts?.[screen] || []).filter(item => !hiddenIds.has(item.id)).map(item => {
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
    'R-MNT-001':'[data-review-column="claim"]', 'R-MNT-002':'[data-review-column="detail"]', 'R-MNT-003':'[data-review-column="maintenance-at"]', 'R-MNT-004':'[data-review-column="completed"]',
    'R-MNT-005':'[data-review-area="readonly"]', 'R-MNT-006':'[data-review-area="readonly"]', 'R-MNT-007':'[data-review-column="sort-base"]',
    'R-OPS-001':'.requirements-prototype-side', 'R-OPS-002':'.linq-review-efficiency-chart', 'R-OPS-003':'.linq-review-period-metrics',
    'R-OPS-004':'.linq-review-efficiency-list',
    'R-OPS-006':'.content-head, .requirements-prototype-side', 'R-OPS-007':'.content-body canvas', 'R-OPS-008':'.linq-review-fuel-fallback', 'Q-OPS-001':'.content-body canvas',
    'R-BAT-001':'.content-body', 'R-BAT-002':'.linq-review-battery-compare',
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
  if (!items.length) {
    applyRequirementContent();
    return;
  }
  document.querySelectorAll('.linq-review-guide, .linq-review-drawer, .linq-review-marker').forEach(node => node.remove());
  document.querySelectorAll('.linq-review-target').forEach(node => node.classList.remove('linq-review-target', 'is-active'));
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
      let left = window.scrollX + rect.left - 13 + entry.offset * 30;
      const markerTop = alignedPeriodIds.has(entry.item.id) && Number.isFinite(periodTop) ? periodTop : rect.top;
      const top = window.scrollY + Math.max(4, markerTop - 9);
      left = Math.min(left, window.scrollX + viewportWidth - 30);
      while (occupied.some(point => Math.abs(point.left - left) < 27 && Math.abs(point.top - top) < 27)) left += 30;
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
  // Observe the stable document body. The Vue app can replace its #page node after API rendering;
  // observing that replaceable node made the review graph appear briefly and then disappear.
  const observerRoot = document.body || document.documentElement;
  try { if (observerRoot) observer.observe(observerRoot, {childList:true, subtree:true}); } catch (_error) {}

  function markReview(node, ...ids) {
    if (!node) return node;
    const values = new Set((node.dataset.reviewId || '').split(/\s+/).filter(Boolean));
    ids.flat().filter(Boolean).forEach(id => values.add(id));
    const nextValue = [...values].join(' ');
    if (node.dataset.reviewId !== nextValue) node.dataset.reviewId = nextValue;
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
    const inheritScope = (node, template) => {
      (template || table).getAttributeNames().filter(name => name.startsWith('data-v-')).forEach(name => node.setAttribute(name, ''));
      return node;
    };
    let header = headerRow.querySelector(`[data-review-column="${key}"]`);
    if (header) {
      const columnIndex = [...headerRow.children].indexOf(header);
      [...table.querySelectorAll('tbody tr')].forEach((row, rowIndex) => {
        if (row.querySelector(`[data-review-column="${key}"]`)) return;
        const cell = inheritScope(document.createElement('td'), row.children[columnIndex] || row.children[0]);
        cell.dataset.reviewColumn = key;
        const value = valueForRow(row, rowIndex);
        if (value instanceof Node) cell.append(value);
        else cell.textContent = value == null || value === '' ? '-' : String(value);
        row.insertBefore(cell, row.children[columnIndex] || null);
      });
      return header;
    }
    header = inheritScope(document.createElement('th'), headerRow.children[index] || headerRow.children[0]);
    header.scope = 'col';
    header.dataset.reviewColumn = key;
    header.textContent = label;
    headerRow.insertBefore(header, headerRow.children[index] || null);
    [...table.querySelectorAll('tbody tr')].forEach((row, rowIndex) => {
      const cell = inheritScope(document.createElement('td'), row.children[index] || row.children[0]);
      cell.dataset.reviewColumn = key;
      const value = valueForRow(row, rowIndex);
      if (value instanceof Node) cell.append(value);
      else cell.textContent = value == null || value === '' ? '-' : String(value);
      row.insertBefore(cell, row.children[index] || null);
    });
    markReview(header, reviewIds);
    return header;
  }

  function applyColumnWidths(table, weightsByLabel) {
    const headerRow = table.querySelector('thead tr');
    if (!headerRow) return;
    const headers = [...headerRow.cells];
    const weights = headers.map(cell => {
      const label = cell.textContent.replace(/\s/g, '');
      const match = Object.entries(weightsByLabel).find(([pattern]) => label.includes(pattern));
      return match ? match[1] : 8;
    });
    const total = weights.reduce((sum, value) => sum + value, 0) || 1;
    const colgroups = [...table.querySelectorAll(':scope > colgroup')];
    let colgroup = colgroups.find(group => group.dataset.reviewColumnWidths === 'true') || colgroups[0];
    if (!colgroup) {
      colgroup = document.createElement('colgroup');
      table.prepend(colgroup);
    }
    colgroup.dataset.reviewColumnWidths = 'true';
    colgroups.filter(group => group !== colgroup).forEach(group => group.remove());
    colgroup.replaceChildren(...weights.map(weight => {
      const col = document.createElement('col');
      col.style.width = `${(weight / total * 100).toFixed(2)}%`;
      return col;
    }));
  }

  function configurePeriodFilter(content) {
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
      const helpText = '시작일과 종료일을 직접 선택합니다. 서버에서 허용하는 최대 조회 범위는 확인이 필요합니다.';
      if (custom?.parentElement) {
        custom.parentElement.classList.add('linq-review-period-control-row');
        custom.classList.remove('linq-review-period-info');
        const infoButtons = [...custom.parentElement.querySelectorAll('.linq-review-period-info-button, .linq-static-period-info')];
        let info = infoButtons.shift();
        infoButtons.forEach(node => node.remove());
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
          const willOpen = popover.hidden;
          if (!willOpen) {
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
        markReview(custom, 'R-SVC-003');
      }
      content.querySelectorAll('.linq-review-period-help').forEach(node => node.remove());
    }
    const form = inputs[0]?.closest('.filter-form');
    const head = content.closest('.content-container')?.querySelector(':scope > .content-head')
      || content.parentElement?.querySelector(':scope > .content-head');
    if (form && head) {
      head.classList.add('linq-review-title-filter-row');
      if (form.parentElement !== head) head.append(form);
    }
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
    if (!location.pathname.includes('/srvc/')) return {};
    const serviceTabs = document.querySelector('.srvc-tab');
    if (!serviceTabs) return {};
    const errorSummary = serviceTabs.querySelector('.srvc-tab__item[data-icon="error"]');
    const batterySummary = serviceTabs.querySelector('.srvc-tab__item[data-icon="battery"]');
    if (serviceTabs.dataset.reviewCompactSummary !== 'true') {
      const errorCount = errorSummary?.querySelector('.srvc-tab__count');
      const batteryCount = batterySummary?.querySelector('.srvc-tab__count');
      if (errorCount && batteryCount) {
        const mergedCount = (Number(errorCount.textContent.replace(/[^0-9]/g, '')) || 0) + (Number(batteryCount.textContent.replace(/[^0-9]/g, '')) || 0);
        errorCount.textContent = String(mergedCount);
      }
      [...serviceTabs.querySelectorAll('.srvc-tab__item')].forEach(item => {
        if (!['maintenance', 'supplies', 'error'].includes(item.dataset.icon || '')) item.remove();
      });
      serviceTabs.dataset.reviewCompactSummary = 'true';
    serviceTabs.classList.add('linq-review-service-summary-compact');
    let storedCounts = {};
    try { storedCounts = JSON.parse(sessionStorage.getItem('linqReviewServiceCounts') || '{}'); } catch (_error) {}
    const fallbackCounts = {maintenance: 2};
    serviceTabs.querySelectorAll('.srvc-tab__item[data-icon]').forEach(item => {
      const icon = item.dataset.icon;
      const count = item.querySelector('.srvc-tab__count');
      const current = Number(count?.textContent.replace(/[^0-9]/g, '')) || 0;
      const replacement = Number(storedCounts[icon] ?? fallbackCounts[icon]) || 0;
      if (count && current === 0 && replacement > 0) count.textContent = String(replacement);
    });
      serviceTabs.setAttribute('aria-label', '서비스 현황 요약');
    }
    if (screen === 'service-errors') markReview(errorSummary, 'R-SVC-006');
    serviceTabs.classList.add('linq-review-service-summary-in-side');
    mountServiceCountsInSide();
    return {serviceTabs, errorSummary};
  }

  function mountServiceCountsInSide() {
    if (!['service-errors', 'maintenance-history', 'supplies-management'].includes(screen)) return;
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
    const fallbackCounts = {maintenance: 2, supplies: 25, error: 9};
    const menuIcons = [
      {label: '정비이력', icon: 'maintenance'},
      {label: '소모품관리', icon: 'supplies'},
      {label: '차량에러', icon: 'error'},
    ];
    menuIcons.forEach(({label, icon}) => {
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
    const iconByScreen = {
      'maintenance-history': 'maintenance',
      'supplies-management': 'supplies',
      'service-errors': 'error',
    };
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

  function applyServiceErrors(content) {
    [...content.querySelectorAll('.section-top__text')]
      .filter(title => ['\uc7a5\ube44\uc810\uac80\ubaa9\ub85d', '\uc18c\ubaa8\ud488\ub3c4\ub798']
        .some(label => title.textContent.replace(/\s/g, '').includes(label)))
      .forEach(title => title.remove());
    configurePeriodFilter(content);
    const {errorSummary} = configureServiceSummary();
    const table = content.querySelector('table');
    if (!table) return;
    table.dataset.reviewServiceApplied = 'true';
    const headers = [...table.querySelectorAll('thead th')];
    const headerIndex = patterns => {
      const values = Array.isArray(patterns) ? patterns : [patterns];
      return headers.findIndex(cell => values.some(pattern => cell.textContent.trim().includes(pattern)));
    };
    const stateIndex = headerIndex(['현재/과거', '상태']);
    const codeIndex = headerIndex(['에러코드', '코드']);
    const contentIndex = headerIndex(['내용']);
    const severityIndex = headerIndex(['중요도', '구분']);
    const occurredIndex = headerIndex(['발생일시']);
    const completedIndex = headerIndex(['완료일시']);
    const actionIndex = headerIndex(['조치방법']);
    if (severityIndex >= 0) headers[severityIndex].textContent = '구분';
    const wrapIndexes = [codeIndex, contentIndex, occurredIndex, completedIndex].filter(index => index >= 0);
    wrapIndexes.forEach(index => headers[index]?.setAttribute('data-review-wrap', 'true'));
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
      wrapIndexes.forEach(columnIndex => cells[columnIndex]?.setAttribute('data-review-wrap', 'true'));
      const setCellText = (cell, value) => { if (cell && cell.textContent !== value) cell.textContent = value; };
      if (index === 0) setCellText(cells[codeIndex], 'BMS-0193');
      if (index === 0) setCellText(cells[contentIndex], '배터리 통신 오류');
      if (index === 1) setCellText(cells[codeIndex], 'J1939 DM1 · SPN 523614 / FMI 2');
      if (index === 1) setCellText(cells[contentIndex], '엔진 오류 (J1939 DM1)');
      const errorCode = cells[codeIndex]?.textContent.trim() || '';
      const errorDescription = cells[contentIndex]?.textContent.trim() || '';
      if (cells[severityIndex]) {
        const category = /BMS|배터리/i.test(`${errorCode} ${errorDescription}`) ? '배터리' : '차량';
        setCellText(cells[severityIndex], category);
        cells[severityIndex].dataset.reviewCategory = category === '배터리' ? 'battery' : 'vehicle';
      }
      if (cells[completedIndex] && !cells[completedIndex].textContent.trim()) setCellText(cells[completedIndex], '-');
      if (cells[actionIndex]) {
        if (index === 0) {
          if (!cells[actionIndex].querySelector('.linq-review-pdf-icon')) {
            cells[actionIndex].replaceChildren();
            const pdfButton = document.createElement('button');
            pdfButton.type = 'button';
            pdfButton.className = 'linq-review-pdf-icon';
            pdfButton.title = 'PDF 열기';
            pdfButton.setAttribute('aria-label', 'PDF 열기');
            pdfButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 2.5h7l4 4v15h-11z"/><path d="M13.5 2.5v4h4"/><path d="M8.5 15.8c2.4-.7 4.8-2.5 5.8-5.6-.2 3.5-1.4 6.4-3.2 7.4-1.1.6-2.4.1-2.6-.5-.2-.7.8-1.3 2-1.2 1.8.2 3.4 1.1 4.6 2"/></svg>';
            pdfButton.addEventListener('click', event => {
              event.preventDefault();
              event.stopImmediatePropagation();
            }, true);
            cells[actionIndex].append(pdfButton);
          }
        }
      }
    });
    markReview(errorSummary || headers[contentIndex] || table, 'R-SVC-006');
    if (severityIndex >= 0) markReview(headers[severityIndex], 'R-SVC-009');
    if (actionIndex >= 0) markReview(headers[actionIndex], 'R-SVC-008');
  }

  function applyMaintenance(content) {
    [...content.querySelectorAll('.section-top__text')]
      .filter(title => title.textContent.trim().startsWith('장비점검 목록'))
      .forEach(title => title.remove());
    const table = content.querySelector('table');
    if (!table) return;
    table.dataset.reviewMaintenanceApplied = 'true';
    table.dataset.reviewMaintenanceTable = 'true';
    [...content.querySelectorAll('button')].filter(button => ['등록', '수정', '삭제'].includes(button.textContent.trim())).forEach(button => button.remove());
    insertColumn(table, 'claim', 'Claim 번호', 2, () => '수리 ID 확인 필요', ['R-MNT-001']);
    const headerRow = table.querySelector('thead tr');
    let headers = [...headerRow.cells];
    const removeIndexes = headers
      .map((cell, index) => ({index, label:cell.textContent.trim()}))
      .filter(item => item.label.includes('상세내용') || /수정|삭제/.test(item.label))
      .map(item => item.index)
      .sort((a, b) => b - a);
    removeIndexes.forEach(index => {
      headerRow.cells[index]?.remove();
      [...table.querySelectorAll('tbody tr')].forEach(row => row.cells[index]?.remove());
    });
    const phenomenonIndex = [...headerRow.cells].findIndex(cell => cell.textContent.trim() === '현상');
    [...table.querySelectorAll('tbody tr')].forEach(row => {
      const expected = headerRow.cells.length;
      while (row.cells.length > expected) {
        const last = row.cells[row.cells.length - 1];
        if (last.querySelector('button, svg, [class*="edit"], [class*="delete"]') || /수정|삭제/.test(last.textContent)) row.deleteCell(row.cells.length - 1);
        else break;
      }
      if (row.cells.length > expected && phenomenonIndex >= 0) {
        const possibleDetail = row.cells[phenomenonIndex + 1];
        const following = row.cells[phenomenonIndex + 2];
        const isDate = value => /\d{4}\s*[-.]\s*\d{2}\s*[-.]\s*\d{2}/.test(value || '');
        if (possibleDetail && following && !isDate(possibleDetail.textContent) && isDate(following.textContent)) row.deleteCell(phenomenonIndex + 1);
      }
      while (row.cells.length > expected) row.deleteCell(row.cells.length - 1);
    });
    headers = [...headerRow.cells];
    const claimHeader = headers.find(cell => cell.textContent.trim() === 'Claim 번호');
    if (claimHeader) markReview(claimHeader, 'R-MNT-001');
    const phenomenonHeader = headers.find(cell => cell.textContent.trim() === '현상');
    if (phenomenonHeader) markReview(phenomenonHeader, 'R-MNT-002');
    const receivedHeader = headers.find(cell => ['접수일시', '정비 일시', '정비일시'].includes(cell.textContent.trim()));
    if (receivedHeader) {
      receivedHeader.textContent = '정비 일시';
      receivedHeader.dataset.reviewColumn = 'maintenance-at';
      markReview(receivedHeader, 'R-MNT-003');
    }
    const completedHeader = headers.find(cell => ['완료일시', '완료 여부'].includes(cell.textContent.trim()));
    if (completedHeader) {
      const completedIndex = [...headerRow.cells].indexOf(completedHeader);
      completedHeader.textContent = '완료 여부';
      completedHeader.dataset.reviewColumn = 'completed';
      markReview(completedHeader, 'R-MNT-004');
      [...table.querySelectorAll('tbody tr')].forEach(row => {
        const cell = row.cells[completedIndex];
        if (!cell) return;
        const value = cell.textContent.trim();
        cell.textContent = value && value !== '-' && value.toUpperCase() !== 'X' ? 'O' : 'X';
      });
    }
    const groupHeader = headers.find(cell => cell.textContent.trim().includes('그룹')) || headers[0];
    if (groupHeader) {
      groupHeader.dataset.reviewColumn = 'sort-base';
      markReview(groupHeader, 'R-MNT-007');
    }
    applyColumnWidths(table, {
      '그룹':10, '차량':14, 'Claim':16, '모델명':12, '고장부위':10,
      '현상':12, '상세내용':20, '정비일시':13, '완료여부':8, '수정':6,
    });
    markReview(table, 'R-MNT-005', 'R-MNT-006');
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

  // Captured from the existing local Fleet operating graph response for group 1948, 2026-08.
  const operationEfficiencyRows = [
    ['20260801',0,3,5,0.2,36.4,63.3],['20260802',0,0,6,1.0,0.1,98.7],['20260803',0,0,0,0,0,0],
    ['20260804',1,0,5,17.9,2.4,79.5],['20260805',4,0,1,63.5,7.9,28.5],['20260806',1,0,5,17.7,4.9,77.3],
    ['20260807',1,0,5,15.2,2.9,81.7],['20260808',0,0,5,9.3,6.4,84.1],['20260809',0,0,6,12.6,0.8,86.4],
    ['20260810',3,2,2,43.1,27.6,29.2],['20260811',3,1,2,43.1,25.2,31.5],['20260812',2,1,2,40.0,24.4,35.4],
    ...Array.from({length:19}, (_value, index) => [`202608${String(index + 13).padStart(2,'0')}`,0,0,0,0,0,0])
  ].map(([key, workingTime, idleTime, offTime, workingRate, idleRate, offRate]) => ({key, workingTime, idleTime, offTime, workingRate, idleRate, offRate}));

  function operationRowsForPeriod(period) {
    if (period === 'daily') return operationEfficiencyRows.slice(11, 12);
    if (period === 'weekly') return operationEfficiencyRows.slice(5, 12);
    return operationEfficiencyRows;
  }

  function formatOperationHours(hours) {
    const totalMinutes = Math.round(Number(hours || 0) * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}시간${m ? ` ${m}분` : ''}`;
  }

  function operationPeriodLabel(period, rows) {
    const label = key => `${key.slice(0,4)}.${key.slice(4,6)}.${key.slice(6,8)}`;
    if (rows.length === 1) return label(rows[0].key);
    return `${label(rows[0].key)} ~ ${label(rows.at(-1).key)}`;
  }

  function renderOperationEfficiency(content, requestedPeriod) {
    const chartSection = [...content.querySelectorAll('.content-section')].find(section => section.querySelector('.section-top__text')?.textContent.includes('운영효율')) || [...content.querySelectorAll('.content-section')].at(-1);
    const host = chartSection?.querySelector('.content-section__body');
    if (!chartSection || !host) return;
    const period = ['daily','weekly','monthly'].includes(requestedPeriod) ? requestedPeriod : 'monthly';
    const rows = operationRowsForPeriod(period);
    const existingChart = host.querySelector(`.linq-review-efficiency-chart[data-period="${period}"]`);
    if (existingChart && existingChart.querySelectorAll('.linq-review-efficiency-row').length === rows.length && existingChart.getBoundingClientRect().height > 0) return;
    const activeRows = rows.filter(row => row.workingTime + row.idleTime + row.offTime > 0);
    const efficiency = period === 'monthly'
      ? 23.5
      : activeRows.length
        ? activeRows.reduce((sum, row) => sum + row.workingRate, 0) / activeRows.length
        : 0;
    const actualWorkTime = rows.reduce((sum, row) => sum + row.workingTime, 0);
    const periodNames = {daily:'일',weekly:'주',monthly:'월'};
    const bars = rows.map(row => {
      const date = `${Number(row.key.slice(4,6))}월 ${Number(row.key.slice(6,8))}일`;
      const tooltip = `${date} · 운영효율 ${row.workingRate.toFixed(1)}% · 실제 작업시간 ${formatOperationHours(row.workingTime)} · 대기 ${formatOperationHours(row.idleTime)} · 미사용 ${formatOperationHours(row.offTime)}`;
      return `<div class="linq-review-efficiency-row"><span class="linq-review-efficiency-date">${Number(row.key.slice(6,8))}일</span><button type="button" class="linq-review-efficiency-bar" data-tooltip="${tooltip}" aria-label="${tooltip}"><span class="work" style="width:${row.workingRate}%"></span><span class="idle" style="width:${row.idleRate}%"></span><span class="off" style="width:${row.offRate}%"></span></button><span class="linq-review-efficiency-values"><i class="work">작업 <b>${row.workingRate.toFixed(1)}%</b></i><i class="idle">대기 <b>${row.idleRate.toFixed(1)}%</b></i><i class="off">미사용 <b>${row.offRate.toFixed(1)}%</b></i></span><strong class="linq-review-efficiency-time">${formatOperationHours(row.workingTime)}</strong></div>`;
    }).join('');
    chartSection.classList.add('linq-review-efficiency-section');
    host.replaceChildren();
    host.insertAdjacentHTML('afterbegin', `
      <div class="linq-review-period-metrics" data-period="${period}">
        <div><small>선택 기간</small><strong>${operationPeriodLabel(period, rows)}</strong></div>
        <div><small>${periodNames[period]} 기준 평균 운영효율</small><strong>${efficiency.toFixed(1)}%</strong></div>
        <div><small>${periodNames[period]} 기준 실제 작업시간</small><strong>${formatOperationHours(actualWorkTime)}</strong></div>
      </div>
      <div class="linq-review-efficiency-chart period-${period}" data-period="${period}" style="--point-count:${rows.length}">
        <div class="linq-review-efficiency-scale"><span>일자</span><div><i>0</i><i>25</i><i>50</i><i>75</i><i>100%</i></div><span>작업 · 대기 · 미사용</span><span>실제 작업시간</span></div>
        <div class="linq-review-efficiency-list">${bars}</div>
      </div>`);
    markReview(host.querySelector('.linq-review-efficiency-chart'), 'R-OPS-002');
    markReview(host.querySelector('.linq-review-period-metrics'), 'R-OPS-003');
    markReview(host.querySelector('.linq-review-efficiency-list'), 'R-OPS-004');
  }

  function applyOperationEfficiency(content) {
    // 상단 운영효율 영역은 운영 화면의 단일 100% 가로 막대와 Top5 구성을 유지한다.
    // 하단 요구사항 검토안(실제 작업시간·31일 무스크롤 비교)은 별도 영역으로 유지한다.
    const title = document.querySelector('.content-head');
    const titleMain = title?.querySelector('.content-head__main');
    const summary = document.querySelector('.content-summary');
    const workTime = [...(summary?.querySelectorAll('.summary-title') || [])]
      .find(node => node.textContent.replace(/\s+/g, ' ').includes('근로시간:'));
    if (titleMain && workTime && !titleMain.querySelector('.linq-review-title-inline-note')) {
      const note = document.createElement('span');
      note.className = 'linq-review-title-inline-note';
      note.textContent = workTime.textContent.replace(/\s+/g, ' ').trim();
      titleMain.append(note);
      workTime.remove();
    }
    const filter = summary?.querySelector('.filter-form');
    if (title && filter) {
      title.classList.add('linq-review-title-filter-row');
      title.append(filter);
    }
    if (summary && !summary.textContent.trim() && !summary.querySelector('*')) summary.remove();

    const workRanking = content.querySelector('.operate-top-group .top-list');
    const sourceWorkTop5 = ['FBA34_224250211', 'FBA32_224250076', 'FBA32_224030259', 'FBA32_224250094', 'FBA34_224250279'];
    workRanking?.querySelectorAll('.top-list__text').forEach((node, index) => {
      if (sourceWorkTop5[index]) node.textContent = sourceWorkTop5[index];
    });
    const lowerChart = content.querySelector('.linq-review-efficiency-chart');
    const metrics = content.querySelector('.linq-review-period-metrics');
    const list = content.querySelector('.linq-review-efficiency-list');
    content.querySelectorAll('[data-review-id~="R-OPS-002"]').forEach(node => {
      const ids = (node.getAttribute('data-review-id') || '').split(/\s+/).filter(id => id && id !== 'R-OPS-002');
      if (ids.length) node.setAttribute('data-review-id', ids.join(' '));
      else node.removeAttribute('data-review-id');
    });
    markReview(lowerChart, 'R-OPS-002');
    markReview(metrics, 'R-OPS-003');
    markReview(list, 'R-OPS-004');
  }

  function replaceExactText(root, from, to) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) if (walker.currentNode.nodeValue.trim() === from) nodes.push(walker.currentNode);
    nodes.forEach(node => { node.nodeValue = node.nodeValue.replace(from, to); });
  }

  function mountEngineFuelFallback(content) {
    const section = [...content.querySelectorAll('.content-section')].find(item => item.querySelector('.section-top__text')?.textContent.includes('연비 현황'));
    const host = section?.querySelector('.content-section__body');
    if (!section || !host) return null;
    const existing = host.querySelector('.linq-review-fuel-fallback');
    if (existing) return existing;

    const numericValues = [...host.querySelectorAll('[role="tooltip"]')]
      .map(item => item.textContent.match(/:\s*(-?\d+(?:\.\d+)?)/)?.[1])
      .filter(value => value !== undefined)
      .map(Number);
    if (numericValues.some(value => Number.isFinite(value) && value !== 0)) return null;

    const values = Array.from({length:31}, () => 0);
    values[15] = 4;
    const maxValue = 4;
    const points = values.map((value, index) => {
      const x = (index / (values.length - 1)) * 1000;
      const y = 10 + (1 - value / maxValue) * 280;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');
    const pointButtons = values.map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = (value / maxValue) * 100;
      const detail = `${index + 1}일 · 연비 ${value.toFixed(1)}L/H`;
      return `<button type="button" class="linq-review-fuel-fallback__point" style="left:${x.toFixed(3)}%;bottom:${y.toFixed(3)}%" data-tooltip="${detail}" aria-label="${detail}"></button>`;
    }).join('');
    const dates = values.map((_value, index) => `<span>${index + 1}일</span>`).join('');
    const fallback = document.createElement('div');
    fallback.className = 'linq-review-fuel-fallback';
    fallback.setAttribute('role', 'img');
    fallback.setAttribute('aria-label', '1일부터 31일까지의 연비 현황. 16일 4.0L/H, 나머지 일자는 0.0L/H');
    fallback.innerHTML = `
      <span class="linq-review-fuel-fallback__unit">L/H</span>
      <div class="linq-review-fuel-fallback__y"><span>4</span><span>3</span><span>2</span><span>1</span><span>0</span></div>
      <div class="linq-review-fuel-fallback__plot">
        <svg viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true"><polyline points="${points}"></polyline></svg>
        ${pointButtons}
      </div>
      <div class="linq-review-fuel-fallback__dates">${dates}</div>`;
    [...host.children].forEach(child => { child.style.display = 'none'; });
    host.append(fallback);
    return fallback;
  }

  function mountEngineSummaryFallbacks(content) {
    const configs = [
      {match:'평균 연비', target:'2.0(L/H)', current:'2.2', previous:'1.8', label:'평균 연비 목표 2.0L/H, 금월 2.2, 전월 1.8'},
      {match:'누적 연료 소비량', target:'2.0(L)', current:'2.2', previous:'1.8', label:'누적 연료 소비량 목표 2.0L, 금월 2.2, 전월 1.8'},
    ];
    return configs.map(config => {
      const section = [...content.querySelectorAll('.content-section')].find(item => item.querySelector('.section-top__text')?.textContent.includes(config.match));
      const host = section?.querySelector('.content-section__body');
      if (!host) return null;
      const heading = section.querySelector('.section-top__text');
      if (heading) {
        heading.textContent = heading.textContent
          .replace(/0(?:\.0)?\s*\(L\/H\)/, config.target)
          .replace(/0(?:\.0)?\s*\(L\)/, config.target);
      }
      const existing = host.querySelector('.linq-review-fuel-summary-fallback');
      if (existing) return existing;
      [...host.children].forEach(child => { child.style.display = 'none'; });
      const graph = document.createElement('div');
      graph.className = 'linq-review-fuel-summary-fallback';
      graph.setAttribute('role', 'img');
      graph.setAttribute('aria-label', config.label);
      graph.innerHTML = `<div class="linq-review-fuel-summary-fallback__plot">
        <span class="linq-review-fuel-summary-fallback__marker" style="left:66.667%"></span>
        <span class="linq-review-fuel-summary-fallback__bar is-current" style="width:73.333%"><b>${config.current}</b></span>
        <span class="linq-review-fuel-summary-fallback__bar is-previous" style="width:60%"><b>${config.previous}</b></span>
      </div>`;
      host.append(graph);
      return graph;
    }).filter(Boolean);
  }

  function applyEngineEfficiency(content) {
    replaceExactText(document.querySelector('.content-head, #content') || content, '엔진', '엔진 연비');
    replaceExactText(document.querySelector('.content-path') || content, '엔진', '엔진 연비');
    const title = document.querySelector('.content-head');
    markReview(title, 'R-OPS-006');
    const titleMain = title?.querySelector('.content-head__main');
    const summary = document.querySelector('.content-summary');
    const notice = [...(summary?.querySelectorAll('.summary-title') || [])]
      .find(node => node.textContent.replace(/\s+/g, ' ').includes('사용 환경에 따라 일부 오차가 발생할 수 있습니다.'));
    if (titleMain && !titleMain.querySelector('.linq-review-title-info-button')) {
      const info = document.createElement('button');
      info.type = 'button';
      info.className = 'linq-review-title-info-button';
      info.setAttribute('aria-label', '사용 환경에 따른 오차 안내');
      info.innerHTML = '<span aria-hidden="true">i</span><span class="linq-review-title-info-tooltip" role="tooltip">사용 환경에 따라 일부 오차가 발생할 수 있습니다.</span>';
      titleMain.append(info);
    }
    notice?.remove();
    const filter = summary?.querySelector('.filter-form');
    if (title && filter) {
      title.classList.add('linq-review-title-filter-row');
      title.append(filter);
    }
    if (summary && !summary.textContent.trim() && !summary.querySelector('*')) summary.remove();
    if (content.dataset.reviewEngineApplied) return;
    content.dataset.reviewEngineApplied = 'true';
    [...content.querySelectorAll('input[type="radio"][name="dataPeriod"]')].forEach(input => {
      input.checked = input.value === 'monthly';
    });
    const canvas = [...content.querySelectorAll('canvas')].at(-1);
    mountEngineSummaryFallbacks(content);
    const fallback = mountEngineFuelFallback(content);
    markReview(fallback || canvas?.parentElement || canvas || content, 'R-OPS-007', 'Q-OPS-001', 'R-OPS-008');
  }

  function sourceBatteryRangeChartMarkup(records, type) {
    const minimum = type === 'battery' ? 82 : 22;
    const maximum = type === 'battery' ? 94 : 27;
    const unit = type === 'battery' ? '%' : '℃';
    const ticks = type === 'battery' ? ['94%','92%','90%','88%','86%','84%','82%'] : ['27℃','26℃','25℃','24℃','23℃','22℃'];
    const recordByDay = new Map(records.map(record => [record.day, record]));
    const columns = Array.from({length:31}, (_value, index) => {
      const day = index + 1;
      const record = recordByDay.get(day);
      if (!record) return '<span class="linq-review-battery-range-day is-empty"></span>';
      const bottom = ((record.low - minimum) / (maximum - minimum)) * 100;
      const height = Math.max(((record.high - record.low) / (maximum - minimum)) * 100, 1.2);
      return `<button type="button" class="linq-review-battery-range-day ${record.tone ? `is-${record.tone}` : ''}" data-day="${day}" data-tooltip="8월 ${day}일 · 최저 ${record.low}${unit} · 최고 ${record.high}${unit}"><i style="bottom:${bottom}%;height:${height}%"></i><b style="bottom:${Math.min(bottom + height + 1, 95)}%">${record.high}${unit}</b></button>`;
    }).join('');
    const dates = Array.from({length:31}, (_value, index) => `<small>${index + 1}일</small>`).join('');
    return `<div class="linq-review-battery-production-chart is-source" data-chart-type="${type}"><div class="linq-review-battery-production-chart__axis">${ticks.map(tick => `<span>${tick}</span>`).join('')}</div><div class="linq-review-battery-production-chart__body"><div class="linq-review-battery-production-chart__plot">${columns}</div><div class="linq-review-battery-production-chart__dates">${dates}</div></div></div>`;
  }

  function applyLithiumBattery(content) {
    if (!content.classList.contains('content-body')) {
      if (!window.__linqBatteryRetryScheduled) {
        window.__linqBatteryRetryScheduled = true;
        window.setTimeout(() => {
          const mountedContent = document.querySelector('.content-body');
          if (mountedContent) applyLithiumBattery(mountedContent);
          window.__linqBatteryRetryScheduled = false;
        }, 450);
      }
      return;
    }
    [...content.querySelectorAll('.content-section, section')]
      .filter(section => /^(에러|오류)\s*정보/.test(section.textContent.trim()))
      .forEach(section => section.remove());
    markReview(content, 'R-BAT-001');

    const compare = new URLSearchParams(location.search).get('batteryCompare') === '1';
    window.__linqBatteryFunctionVersion = 'restore-original-v3';
    window.__linqBatteryCompareValue = compare;
    if (!compare) {
      const requestedRoute = new URLSearchParams(location.search).get('route') || location.pathname;
      const routeVehicleMatch = requestedRoute.match(/\/detail\/equip\/[^/]+\/[^/]+\/([^/?#]+)/i);
      const routeVehicleId = routeVehicleMatch ? decodeURIComponent(routeVehicleMatch[1]) : 'FBA32_224250383';
      const detailVehicleSelector = [...document.querySelectorAll('.content-head__suffix')]
        .find(node => node.textContent.replace(/\s+/g, ' ').includes('차량별'));
      detailVehicleSelector?.remove();

      const globalVehicleSelect = [...document.querySelectorAll('select[data-vehicle], select[aria-label="차량 선택"]')]
        .find(select => !content.contains(select) && [...select.options].some(option => option.textContent.includes(routeVehicleId)));
      const globalVehicleOption = globalVehicleSelect
        ? [...globalVehicleSelect.options].find(option => option.textContent.includes(routeVehicleId))
        : null;
      if (globalVehicleSelect && globalVehicleOption) {
        globalVehicleSelect.value = globalVehicleOption.value;
        [...globalVehicleSelect.options].forEach(option => { option.selected = option === globalVehicleOption; });
      }
      const currentSelection = [...document.querySelectorAll('body *')]
        .find(node => !content.contains(node) && node.children.length === 0 && node.textContent.trim().startsWith('현재 조회'));
      if (currentSelection) currentSelection.textContent = `현재 조회 · 차량 ${routeVehicleId}`;

      content.querySelectorAll('.linq-review-battery-compare').forEach(node => node.remove());
      content.querySelectorAll('.linq-review-battery-production-chart').forEach(node => node.remove());
      [...content.querySelectorAll(':scope > .content-section')]
        .filter(section => /배터리\s*충전.*방전량|온도\s*정보/.test(section.textContent.replace(/\s+/g, ' ')))
        .forEach(section => {
          section.style.display = '';
          const host = section.querySelector('.content-section__body');
          if (host) [...host.children].forEach(child => { child.style.display = ''; });
        });

      const summaryText = content.querySelector('.battery-graph.mode-detail .battery-graph__text');
      if (summaryText) summaryText.textContent = '84%';
      const summaryBar = content.querySelector('.battery-graph.mode-detail .battery-graph__bar');
      if (summaryBar) {
        summaryBar.style.width = '84%';
        summaryBar.classList.add('charge-active');
      }
      [...content.querySelectorAll('.battery-status__value')].slice(0, 3).forEach(value => { value.textContent = '정상'; });
      const infoValues = ['7시간 6분', '3.692kWh', '0.064kWh', '96시간 0분', '0.052kWh'];
      [...content.querySelectorAll('.battery-info__info em')].slice(0, infoValues.length).forEach((value, index) => {
        value.textContent = infoValues[index];
      });
      const healthBar = content.querySelector('.battery-graph.mode-soh .battery-graph__bar');
      if (healthBar) {
        healthBar.style.height = '100%';
        healthBar.classList.add('charge-active');
        const value = healthBar.querySelector('span');
        if (value) value.textContent = '100%';
      }

      const sourceBatteryRanges = [
        {day:9,low:93,high:93,tone:'charge'}, {day:10,low:93,high:93,tone:'charge'}, {day:11,low:93,high:93,tone:'charge'},
        {day:12,low:88,high:93}, {day:13,low:86,high:88}, {day:14,low:86,high:86,tone:'charge'},
        {day:26,low:84,high:87}, {day:27,low:84,high:86}, {day:28,low:84,high:84,tone:'charge'},
      ];
      const sourceTemperatureRanges = [
        {day:9,low:23,high:25,tone:'hot'}, {day:10,low:25,high:26,tone:'hot'}, {day:11,low:23,high:24,tone:'hot'},
        {day:12,low:25,high:26,tone:'hot'}, {day:26,low:23,high:25,tone:'hot'}, {day:27,low:25,high:26,tone:'hot'},
        {day:28,low:26,high:26,tone:'hot'},
      ];
      const sourceSections = [...content.querySelectorAll(':scope > .content-section')];
      const sourceChargeSection = sourceSections.find(section => /배터리\s*충전.*방전량/.test(section.textContent.replace(/\s+/g, ' ')));
      const sourceTemperatureSection = sourceSections.find(section => /온도\s*정보/.test(section.textContent.replace(/\s+/g, ' ')));
      [[sourceChargeSection, sourceBatteryRanges, 'battery'], [sourceTemperatureSection, sourceTemperatureRanges, 'temperature']].forEach(([section, records, type]) => {
        const host = section?.querySelector('.content-section__body');
        if (!host) return;
        [...host.children].forEach(child => { child.style.display = 'none'; });
        host.insertAdjacentHTML('beforeend', sourceBatteryRangeChartMarkup(records, type));
        section.querySelectorAll('input').forEach((input, index) => { input.value = index === 0 ? '2026-08-01' : '2026-08-28'; });
        if (type === 'temperature') {
          const values = section.querySelectorAll('.section-top em');
          if (values[0]) values[0].textContent = '23℃';
          if (values[1]) values[1].textContent = '26℃';
        }
      });
      return;
    }

    const batteryRanges = [
      {day:6,low:100,high:100,value:100,tone:'charge'}, {day:7,low:100,high:100,value:100,tone:'charge'},
      {day:8,low:100,high:100,value:100,tone:'charge'}, {day:10,low:61,high:98,value:61},
      {day:11,low:60,high:100,value:60}, {day:12,low:71,high:100,value:71},
      {day:13,low:53,high:100,value:53}, {day:14,low:54,high:100,value:54},
      {day:15,low:60,high:100,value:60}, {day:16,low:100,high:100,value:100,tone:'charge'},
      {day:17,low:100,high:100,value:100,tone:'charge'}, {day:18,low:53,high:100,value:53},
      {day:19,low:34,high:100,value:34}, {day:20,low:46,high:81,value:46},
      {day:21,low:42,high:100,value:42}, {day:22,low:62,high:100,value:100,tone:'charge'},
    ];
    const temperatureRanges = [
      {day:6,low:28,high:30,value:30,tone:'hot'}, {day:7,low:29,high:30,value:29},
      {day:8,low:29,high:29,value:29,tone:'hot'}, {day:10,low:28,high:36,value:36,tone:'hot'},
      {day:11,low:30,high:38,value:38,tone:'hot'}, {day:12,low:35,high:40,value:37},
      {day:13,low:35,high:38,value:38,tone:'hot'}, {day:14,low:36,high:41,value:37},
      {day:15,low:38,high:42,value:38}, {day:16,low:31,high:41,value:31},
      {day:17,low:29,high:30,value:29}, {day:18,low:29,high:35,value:35,tone:'hot'},
      {day:19,low:35,high:41,value:35}, {day:20,low:38,high:43,value:38},
      {day:21,low:35,high:42,value:37}, {day:22,low:37,high:44,value:40},
    ];

    const summaryText = content.querySelector('.battery-graph.mode-detail .battery-graph__text');
    if (summaryText) summaryText.textContent = '100%';
    const summaryBar = content.querySelector('.battery-graph.mode-detail .battery-graph__bar');
    if (summaryBar) {
      summaryBar.style.width = '100%';
      summaryBar.classList.add('charge-active');
    }
    [...content.querySelectorAll('.battery-status__value')].slice(0, 3).forEach(value => { value.textContent = '정상'; });
    const infoValues = ['3시간 48분', '8.374kWh', '0kWh', '0시간 0분', '0.053kWh'];
    [...content.querySelectorAll('.battery-info__info em')].slice(0, infoValues.length).forEach((value, index) => { value.textContent = infoValues[index]; });
    const healthBar = content.querySelector('.battery-graph.mode-soh .battery-graph__bar');
    if (healthBar) {
      healthBar.style.height = '98%';
      healthBar.classList.add('charge-active');
      const value = healthBar.querySelector('span');
      if (value) value.textContent = '98%';
    }

    function rangeChartMarkup(records, type, compact = false) {
      const minimum = type === 'battery' ? 20 : 25;
      const maximum = type === 'battery' ? 120 : 50;
      const unit = type === 'battery' ? '%' : '℃';
      const recordByDay = new Map(records.map(record => [record.day, record]));
      const columns = Array.from({length:31}, (_value, index) => {
        const day = index + 1;
        const record = recordByDay.get(day);
        if (!record) return `<span class="linq-review-battery-range-day is-empty"></span>`;
        const bottom = ((record.low - minimum) / (maximum - minimum)) * 100;
        const height = Math.max(((record.high - record.low) / (maximum - minimum)) * 100, 1.2);
        return `<button type="button" class="linq-review-battery-range-day ${record.tone ? `is-${record.tone}` : ''}" data-day="${day}" data-tooltip="8월 ${day}일 · 최저 ${record.low}${unit} · 최고 ${record.high}${unit} · 기준값 ${record.value}${unit}"><i style="bottom:${bottom}%;height:${height}%"></i><b style="bottom:${Math.min(bottom + height + 1, 95)}%">${record.value}${unit}</b></button>`;
      }).join('');
      const dates = Array.from({length:31}, (_value, index) => `<small>${index + 1}일</small>`).join('');
      const ticks = type === 'battery' ? ['120%','100%','80%','60%','40%','20%'] : ['50℃','45℃','40℃','35℃','30℃','25℃'];
      return `<div class="linq-review-battery-production-chart ${compact ? 'is-compact' : ''}" data-chart-type="${type}"><div class="linq-review-battery-production-chart__axis">${ticks.map(tick => `<span>${tick}</span>`).join('')}</div><div class="linq-review-battery-production-chart__body"><div class="linq-review-battery-production-chart__plot">${columns}</div><div class="linq-review-battery-production-chart__dates">${dates}</div></div></div>`;
    }

    const nativeSections = [...content.querySelectorAll(':scope > .content-section')];
    const chargeSection = nativeSections.find(section => /배터리\s*충전.*방전량/.test(section.textContent.replace(/\s+/g, ' ')));
    const temperatureSection = nativeSections.find(section => /온도\s*정보/.test(section.textContent.replace(/\s+/g, ' ')));
    if (!chargeSection || !temperatureSection) {
      const attempts = Number(content.dataset.reviewBatteryChartAttempts || 0);
      if (attempts < 20) {
        content.dataset.reviewBatteryChartAttempts = String(attempts + 1);
        window.setTimeout(() => applyLithiumBattery(content), 250);
      }
      return;
    }
    [[chargeSection, batteryRanges, 'battery'], [temperatureSection, temperatureRanges, 'temperature']].forEach(([section, records, type]) => {
      if (!section) return;
      section.querySelectorAll('input').forEach((input, index) => { input.value = index === 0 ? '2026-08-01' : '2026-08-22'; });
      if (type === 'temperature') {
        const values = section.querySelectorAll('.section-top em');
        if (values[0]) values[0].textContent = '28℃';
        if (values[1]) values[1].textContent = '44℃';
      }
      const host = section.querySelector('.content-section__body');
      if (!host || host.querySelector('.linq-review-battery-production-chart')) return;
      [...host.children].forEach(child => { child.style.display = 'none'; });
      host.insertAdjacentHTML('beforeend', rangeChartMarkup(records, type));
    });

    if (!compare || content.querySelector('.linq-review-battery-compare')) return;

    [...content.querySelectorAll('.content-section, section')]
      .filter(section => /배터리\s*충전.*방전량|온도\s*정보/.test(section.textContent.replace(/\s+/g, ' ')))
      .forEach(section => { section.style.display = 'none'; });

    const comparison = document.createElement('section');
    comparison.className = 'linq-review-battery-compare';
    comparison.innerHTML = `
      <div class="linq-review-battery-compare__head">
        <div><h3>배터리 충·방전량 / 온도 비교</h3><p>동일 조회기간을 공유하며 날짜에 마우스를 올리면 양쪽 그래프가 함께 강조됩니다.</p></div>
        <div class="linq-review-battery-period"><button type="button">일</button><button type="button">주</button><button type="button" class="is-active">월</button><span>2026. 08. 01.</span><em>~</em><span>2026. 08. 22.</span><button type="button" class="is-search">조회</button></div>
      </div>
      <div class="linq-review-battery-live"><strong>FBA34_224030249</strong><div><span>잔여 배터리</span><b>100%</b></div><div><span>배터리 온도</span><b>정상</b></div><div><span>충전 상태</span><b>정상</b></div><div><span>배터리 상태</span><b>정상</b></div><div><span>시간당 전력 사용량</span><b>8.374 kWh</b></div><div><span>충전 이후 사용량</span><b>0 kWh</b></div></div>
      <div class="linq-review-battery-compare__charts">
        <article class="linq-review-battery-chart-card">
          <header><div><h4>배터리 충전·방전량</h4><p>일별 SOC 범위 (%)</p></div><div class="linq-review-battery-legend"><span><i class="is-charge"></i>충전</span><span><i class="is-discharge"></i>방전</span></div></header>
          ${rangeChartMarkup(batteryRanges, 'battery', true)}
        </article>
        <article class="linq-review-battery-chart-card">
          <header><div><h4>배터리 온도</h4><p>일별 최저·최고 온도 (℃)</p></div><span class="linq-review-battery-normal">운영 최고 44℃</span></header>
          ${rangeChartMarkup(temperatureRanges, 'temperature', true)}
        </article>
      </div>
      <p class="linq-review-battery-source">운영 화면 FBA34_224030249 조회 상태를 기준으로 구성한 비교안입니다. 두 그래프는 단위가 달라 중첩하지 않았습니다.</p>`;
    content.append(comparison);
    markReview(comparison, 'R-BAT-002');

    comparison.querySelectorAll('[data-day]').forEach(point => {
      point.addEventListener('mouseenter', () => comparison.querySelectorAll(`[data-day="${point.dataset.day}"]`).forEach(match => match.classList.add('is-active')));
      point.addEventListener('mouseleave', () => comparison.querySelectorAll(`[data-day="${point.dataset.day}"]`).forEach(match => match.classList.remove('is-active')));
      point.addEventListener('focus', () => comparison.querySelectorAll(`[data-day="${point.dataset.day}"]`).forEach(match => match.classList.add('is-active')));
      point.addEventListener('blur', () => comparison.querySelectorAll(`[data-day="${point.dataset.day}"]`).forEach(match => match.classList.remove('is-active')));
    });
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
    table.dataset.reviewSuppliesTable = 'true';
    const headerRow = table.querySelector('thead tr');
    const initialHeaders = [...(headerRow?.cells || [])];
    if (initialHeaders.length >= 2
      && initialHeaders[0].textContent.replace(/\s/g, '') === '\uadf8\ub8f9'
      && initialHeaders[1].textContent.replace(/\s/g, '') === '\uadf8\ub8f9') {
      initialHeaders[1].remove();
      [...table.querySelectorAll('tbody tr')].forEach(row => row.cells[1]?.remove());
    }
    let colgroup = table.querySelector('colgroup');
    if (!colgroup) {
      colgroup = document.createElement('colgroup');
      table.prepend(colgroup);
    }
    colgroup.replaceChildren(...['10%', '16%', '22%', '22%', '24%', '6%'].map(width => {
      const col = document.createElement('col');
      col.style.width = width;
      return col;
    }));
    table.style.width = '100%';
    table.style.minWidth = '100%';
    table.style.tableLayout = 'fixed';
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

  function applyShockHorizontal(content) {
    if (screen !== 'shock-horizontal' || content.querySelector('.requirements-horizontal-chart')) return;
    const table = [...content.querySelectorAll('table')].find(candidate => {
      const labels = [...candidate.querySelectorAll('thead th')].map(cell => cell.textContent.replace(/\s/g, ''));
      return ['일자', '민감', '주의', '경고', '합계'].every(label => labels.includes(label));
    });
    if (!table) return;
    const rows = [...table.querySelectorAll('tbody tr')].map(row => {
      const cells = [...row.cells].map(cell => Number(cell.textContent.trim()) || 0);
      return {day:cells[0], sensitive:cells[1], caution:cells[2], warning:cells[3], total:cells[4]};
    }).filter(row => row.day >= 1 && row.day <= 31);
    if (!rows.length) return;
    const max = Math.max(5, ...rows.map(row => row.total));
    const ticks = Array.from({length:max + 1}, (_, index) => `<span>${index}</span>`).join('');
    const chartRows = rows.map(row => {
      const segment = (value, type) => value > 0
        ? `<i class="is-${type}" style="width:${(value / max) * 100}%"></i>`
        : '';
      const detail = `${row.day}일 · 민감 ${row.sensitive}회 · 주의 ${row.caution}회 · 경고 ${row.warning}회 · 합계 ${row.total}회`;
      return `<div class="requirements-horizontal-chart__row" tabindex="0" aria-label="${detail}" data-tooltip="${detail}"><strong>${row.day}일</strong><span>${segment(row.sensitive, 'sensitive')}${segment(row.caution, 'caution')}${segment(row.warning, 'warning')}</span><em>${row.total}</em></div>`;
    }).join('');
    const chart = document.createElement('section');
    chart.className = 'requirements-horizontal-chart';
    chart.innerHTML = `<div class="requirements-horizontal-chart__head"><div><h4>일별 충격 횟수 · 축 전환 비교안</h4><p>세로축은 날짜, 가로축은 충격 횟수입니다.</p></div><div class="requirements-horizontal-chart__legend"><span class="is-sensitive">민감</span><span class="is-caution">주의</span><span class="is-warning">경고</span></div></div><div class="requirements-horizontal-chart__axis"><span>날짜</span><div>${ticks}</div><span>합계</span></div><div class="requirements-horizontal-chart__rows">${chartRows}</div>`;
    const host = table.closest('.content-section__body, .content-section') || table.parentElement;
    host.insertBefore(chart, host.firstChild);
  }

  function serializedEfficiencyChart() {
    return `<div class="linq-static-chart-fallback linq-static-efficiency-fallback is-source-horizontal" role="img" aria-label="작업 2.1시간 28.5%, 대기 1.5시간 20.5%, 미사용 3.7시간 50.9%">
      <div class="linq-static-efficiency-fallback__bar">
        <span class="is-work" style="width:28.5%"><b>2.1hr / 28.5%</b></span>
        <span class="is-idle" style="width:20.5%"><b>1.5hr / 20.5%</b></span>
        <span class="is-off" style="width:50.9%"><b>3.7hr / 50.9%</b></span>
      </div>
      <div class="linq-static-efficiency-fallback__axis"><span>0%</span><span>20%</span><span>40%</span><span>60%</span><span>80%</span><span>100%</span></div>
    </div>`;
  }

  function serializedShockChart() {
    const values = Array.from({length:31}, (_value, index) => index === 7 ? 1 : index === 11 ? 2 : 0);
    const columns = values.map((value, index) => {
      const x = 54 + index * 29.6;
      const height = value * 64;
      const day = index + 1;
      return `<g tabindex="0" role="img" aria-label="8월 ${day}일 민감 충격 ${value}회">
        <title>8월 ${day}일 · 민감 ${value}회 · 주의 0회 · 경고 0회</title>
        <rect x="${x}" y="${300 - height}" width="18" height="${height}" rx="2" fill="#43a36b"/>
        <text x="${x + 9}" y="324" text-anchor="middle">${day}</text>
        ${value ? `<text x="${x + 9}" y="${290 - height}" text-anchor="middle" class="value">${value}</text>` : ''}
      </g>`;
    }).join('');
    return `<div class="linq-static-chart-fallback linq-static-shock-fallback" role="img" aria-label="1일부터 31일까지 일별 충격 횟수 차트">
      <svg viewBox="0 0 1000 350" preserveAspectRatio="none" aria-hidden="true">
        <g class="grid"><line x1="44" y1="44" x2="982" y2="44"/><line x1="44" y1="108" x2="982" y2="108"/><line x1="44" y1="172" x2="982" y2="172"/><line x1="44" y1="236" x2="982" y2="236"/><line x1="44" y1="300" x2="982" y2="300"/></g>
        <g class="axis"><text x="20" y="48">4</text><text x="20" y="112">3</text><text x="20" y="176">2</text><text x="20" y="240">1</text><text x="20" y="304">0</text></g>
        ${columns}
      </svg>
    </div>`;
  }

  function serializedDashboardChart() {
    return `<div class="linq-static-chart-fallback linq-static-dashboard-fallback" role="img" aria-label="보유 장비 동력 유형 분포. 엔진 42대, 납축 22대, 리튬 38대, 수소 1대">
      <div class="linq-static-dashboard-fallback__ring"><strong>103</strong><span>전체 차량</span></div>
      <ul><li><i class="engine"></i><span>엔진</span><b>42</b></li><li><i class="lead"></i><span>납축</span><b>22</b></li><li><i class="lithium"></i><span>리튬</span><b>38</b></li><li><i class="hydrogen"></i><span>수소</span><b>1</b></li></ul>
    </div>`;
  }

  function mountSerializedCanvasFallbacks(content) {
    if (!/\/requirements-mvp\/static\//.test(location.pathname)) return;
    if (screen === 'operation-efficiency') {
      const host = content.querySelector('.operate-top-group .content-section .content-section__body > div[style*="height: 200px"]');
      if (host && !host.querySelector('.linq-static-chart-fallback')) {
        host.classList.add('linq-static-chart-host');
        host.insertAdjacentHTML('beforeend', serializedEfficiencyChart());
      }
    }
    if (screen === 'operation-shock') {
      const host = [...content.querySelectorAll('.content-section__body > div[style*="height: 500px"]')].find(node => node.querySelector('canvas'));
      if (host && !host.querySelector('.linq-static-chart-fallback')) {
        host.classList.add('linq-static-chart-host');
        host.insertAdjacentHTML('beforeend', serializedShockChart());
      }
    }
    if (screen === 'dashboard') {
      const host = content.querySelector('.main-info__status > div[style*="width: 300px"][style*="height: 200px"]');
      if (host && !host.querySelector('.linq-static-chart-fallback')) {
        host.classList.add('linq-static-chart-host');
        host.insertAdjacentHTML('beforeend', serializedDashboardChart());
      }
    }
    if (screen === 'shock-horizontal') {
      const chart = content.querySelector('.requirements-horizontal-chart');
      const original = chart?.nextElementSibling;
      if (original?.querySelector('canvas')) original.hidden = true;
    }
  }

  function ensureDashboardControls() {
    if (screen !== 'dashboard') return;
    if (document.querySelector('.linq-review-fullscreen-button')) return;

    const mapContainers = [...document.querySelectorAll('.map-container, #map')]
      .map(node => node.matches('.map-container') ? node : (node.closest('.map-container') || node))
      .filter((node, index, nodes) => nodes.indexOf(node) === index)
      .filter(node => {
        const rect = node.getBoundingClientRect();
        return rect.width > 240 && rect.height > 220;
      })
      .sort((left, right) => {
        const leftRect = left.getBoundingClientRect();
        const rightRect = right.getBoundingClientRect();
        return (rightRect.width * rightRect.height) - (leftRect.width * leftRect.height);
      });
    const mapContainer = mapContainers[0];
    const mapCard = mapContainer?.closest('.vue-grid-item') || mapContainer;
    if (!mapCard) return;

    const icon = active => active
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
    const setMapFullscreen = active => {
      document.body.classList.toggle('linq-review-map-fullscreen', active);
      mapCard.classList.toggle('linq-review-map-widget-fullscreen', active);
      button.innerHTML = icon(active);
      button.setAttribute('aria-label', active ? '지도 전체화면 종료' : '지도 전체화면 보기');
      button.setAttribute('title', active ? '지도 전체화면 종료' : '지도 전체화면 보기');
      button.setAttribute('aria-pressed', String(active));
      window.setTimeout(() => window.dispatchEvent(new Event('resize')), 30);
    };

    mapCard.classList.add('linq-review-map-card');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'linq-review-fullscreen-button';
    button.innerHTML = icon(false);
    button.setAttribute('aria-label', '지도 전체화면 보기');
    button.setAttribute('title', '지도 전체화면 보기');
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      setMapFullscreen(!mapCard.classList.contains('linq-review-map-widget-fullscreen'));
    });
    markReview(button, 'R-DSH-002');
    mapCard.append(button);

    if (!window.__linqMapFullscreenEscapeBound) {
      window.__linqMapFullscreenEscapeBound = true;
      window.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        const activeButton = document.querySelector('.linq-review-fullscreen-button');
        const activeCard = document.querySelector('.linq-review-map-widget-fullscreen');
        if (!activeButton || !activeCard) return;
        document.body.classList.remove('linq-review-map-fullscreen');
        activeCard.classList.remove('linq-review-map-widget-fullscreen');
        activeButton.innerHTML = icon(false);
        activeButton.setAttribute('aria-label', '지도 전체화면 보기');
        activeButton.setAttribute('title', '지도 전체화면 보기');
        activeButton.setAttribute('aria-pressed', 'false');
        window.setTimeout(() => window.dispatchEvent(new Event('resize')), 30);
      });
    }
  }

  function applyRequirementContent() {
    removeHeaderCompanySearch();
    document.querySelectorAll('.linq-review-fallback').forEach(node => node.remove());
    document.querySelectorAll('.linq-review-original-hidden').forEach(node => node.classList.remove('linq-review-original-hidden'));
    const content = contentBody();
    ensureDashboardControls();
    markPrototypeSide();
    configureServiceSummary();
    if (!content) return;
    if (['service-errors', 'maintenance-history', 'supplies-management'].includes(screen)) configurePeriodFilter(content);
    if (screen === 'service-errors') applyServiceErrors(content);
    if (screen === 'maintenance-history') applyMaintenance(content);
    if (screen === 'operation-efficiency') applyOperationEfficiency(content);
    if (screen === 'engine-efficiency') applyEngineEfficiency(content);
    if (screen === 'lithium-battery') applyLithiumBattery(content);
    if (screen === 'home-vehicles') applyHomeVehicles(content);
    if (screen === 'supplies-management') applySupplies(content);
    if (screen === 'shock-horizontal') applyShockHorizontal(content);
    mountSerializedCanvasFallbacks(content);
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
  if (location.pathname.includes('/srvc/') && !window.__linqServiceSummaryObserver) {
    window.__linqServiceSummaryObserver = new MutationObserver(() => configureServiceSummary());
    const serviceObserverRoot = document.body || document.documentElement;
    try { if (serviceObserverRoot) window.__linqServiceSummaryObserver.observe(serviceObserverRoot, {childList: true, subtree: true}); } catch (_error) {}
  }
  if (screen === 'lithium-battery' && !window.__linqLithiumBatteryGuard) {
    let attempts = 0;
    window.__linqLithiumBatteryGuard = window.setInterval(() => {
      attempts += 1;
      const content = contentBody();
      if (content) applyLithiumBattery(content);
      const compare = new URLSearchParams(location.search).get('batteryCompare') === '1';
      const hasErrorSection = [...(content?.querySelectorAll('.content-section, section') || [])]
        .some(section => /^(에러|오류)\s*정보/.test(section.textContent.trim()));
      const ready = compare
        ? content?.querySelectorAll('.linq-review-battery-production-chart').length >= 2
        : Boolean(content && !hasErrorSection && !content.querySelector('.linq-review-battery-compare'));
      if (ready || attempts >= 24) {
        window.clearInterval(window.__linqLithiumBatteryGuard);
        window.__linqLithiumBatteryGuard = null;
      }
    }, 250);
  }
})();
