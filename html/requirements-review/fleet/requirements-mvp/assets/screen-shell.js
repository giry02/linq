(() => {
  const body = document.body;
  const query = new URLSearchParams(location.search);
  const requestedRoute = query.get('route') || body.dataset.route || '';
  const status = document.querySelector('.review-shell__status');
  const frame = document.querySelector('.review-shell__frame');
  let recoveringSession = false;

  function isStaticPreviewHost() {
    return query.get('static') === '1' || location.hostname.endsWith('github.io') || location.protocol === 'file:';
  }

  function reviewScreenForRoute(value) {
    const target = new URL(value, location.origin);
    if (target.searchParams.get('chart') === 'horizontal') return 'shock-horizontal';
    if (/\/srvc\/list\//.test(target.pathname)) return 'service-overview';
    if (/\/srvc\/equipError\//.test(target.pathname)) return 'service-errors';
    if (/\/srvc\/maintenance\//.test(target.pathname)) return 'maintenance-history';
    if (/\/anlz\/shock\//.test(target.pathname)) return 'operation-shock';
    if (/\/anlz\/operate\//.test(target.pathname)) return 'operation-efficiency';
    if (/\/anlz\/fuel\//.test(target.pathname)) return 'engine-efficiency';
    if (/\/anlz\/battery\/li\//.test(target.pathname)) return 'lithium-battery';
    if (/\/equip\/list\//.test(target.pathname)) return 'home-vehicles';
    if (/\/srvc\/supplies\//.test(target.pathname)) return 'supplies-management';
    if (/\/dashboard\/widget/.test(target.pathname)) return 'dashboard';
    if (/\/anlz\/summary\//.test(target.pathname)) return /^\/fleet\/en\//.test(target.pathname) ? 'option3-summary-en' : 'option3-summary';
    return '';
  }

  function setStatus(message, isError = false) {
    status.hidden = false;
    status.textContent = message;
    status.classList.toggle('is-error', isError);
  }

  function normalizeRoute(value) {
    try {
      const target = new URL(value, location.origin);
      if (target.origin !== location.origin || !target.pathname.startsWith('/fleet/')) return null;
      if (/\/login(?:\/|$)/.test(target.pathname)) return null;
      target.searchParams.set('layout', 'prototype3');
      return `${target.pathname}${target.search}${target.hash}`;
    } catch (_error) {
      return null;
    }
  }

  async function createPreviewSession() {
    const response = await fetch('/api/common/auth/fleet/authenticate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'offline', password: 'offline-preview' }),
    });
    if (!response.ok) throw new Error('로컬 미리보기 데이터를 불러오지 못했습니다.');
    const payload = await response.json();
    const result = payload?.result;
    if (payload?.code !== '00' || !result?.access_token || !result?.refresh_token) {
      throw new Error('로컬 미리보기 세션을 만들지 못했습니다.');
    }
    sessionStorage.setItem('accessToken', JSON.stringify({ value: result.access_token, expires: '3600s' }));
    sessionStorage.setItem('refreshToken', JSON.stringify({ value: result.refresh_token, expires: '3600s' }));
    sessionStorage.setItem('userId', 'Test_Fleet2_Admin');
  }

  async function recoverPreviewSession() {
    if (recoveringSession) return;
    recoveringSession = true;
    frame.classList.remove('is-ready');
    setStatus('미리보기 화면을 다시 준비하고 있습니다.');
    try {
      await createPreviewSession();
      frame.src = normalizeRoute(requestedRoute);
      revealWhenReady();
    } catch (error) {
      setStatus(error.message, true);
    } finally {
      recoveringSession = false;
    }
  }

  function addReviewAssets(doc) {
    let currentRoute = requestedRoute;
    try { currentRoute = doc.defaultView.location.href; } catch (_error) {}
    const previewRoute = normalizeRoute(currentRoute) || normalizeRoute(requestedRoute);
    doc.defaultView.LINQ_REQUIREMENT_REVIEW = window.LINQ_REQUIREMENT_REVIEW;
    doc.defaultView.LINQ_REVIEW_SCREEN = reviewScreenForRoute(previewRoute);
    if (!doc.querySelector('link[data-requirements-prototype-shell]')) {
      const style = doc.createElement('link');
      style.rel = 'stylesheet';
    style.href = '/requirements-mvp/assets/requirements-prototype-shell.css?v=20260822-44';
      style.dataset.requirementsPrototypeShell = '';
      doc.head.append(style);
    }
    if (!doc.querySelector('script[data-requirements-prototype-shell]')) {
      const script = doc.createElement('script');
    script.src = '/requirements-mvp/assets/requirements-prototype-shell.js?v=20260822-44';
      script.async = false;
      script.dataset.requirementsPrototypeShell = '';
      doc.head.append(script);
    }
    if (!doc.querySelector('link[data-requirements-review]')) {
      const style = doc.createElement('link');
      style.rel = 'stylesheet';
    style.href = '/requirements-mvp/assets/actual-review-overlay.css?v=20260822-44';
      style.dataset.requirementsReview = '';
      doc.head.append(style);
    }
    if (!doc.querySelector('script[data-requirements-review]')) {
      const script = doc.createElement('script');
    script.src = '/requirements-mvp/assets/actual-review-overlay.js?v=20260822-44';
      script.async = false;
      script.dataset.requirementsReview = '';
      doc.head.append(script);
    }
  }

  function applyStaticServiceCounts(doc) {
    const serviceSide = doc.querySelector('.requirements-prototype-side .analysis-menu-list');
    if (!serviceSide) return;

    const serviceSummary = doc.querySelector('.srvc-tab');
    const countByIcon = {};
    serviceSummary?.querySelectorAll('.srvc-tab__item[data-icon]').forEach(item => {
      const value = Number(item.querySelector('.srvc-tab__count')?.textContent.replace(/[^0-9]/g, '')) || 0;
      countByIcon[item.dataset.icon] = value;
    });
    serviceSummary?.remove();

    const fallbackCounts = {maintenance: 2, supplies: 25, error: 9};
    [
      {label: '정비이력', icon: 'maintenance'},
      {label: '소모품관리', icon: 'supplies'},
      {label: '차량에러', icon: 'error'},
    ].forEach(({label, icon}) => {
      const item = [...serviceSide.querySelectorAll('.side-item')]
        .find(button => button.textContent.replace(/\s/g, '').includes(label));
      const text = item?.querySelector('em');
      if (!text) return;
      let badge = text.querySelector('.linq-review-side-count');
      if (!badge) {
        badge = doc.createElement('span');
        badge.className = 'linq-review-side-count';
        text.append(badge);
      }
      badge.textContent = String(countByIcon[icon] || fallbackCounts[icon]);
      badge.setAttribute('aria-label', `${label} ${badge.textContent}건`);
    });

    if (!doc.querySelector('style[data-static-service-counts]')) {
      const style = doc.createElement('style');
      style.dataset.staticServiceCounts = '';
      style.textContent = `
        .requirements-prototype-side .side-item em {
          display:flex !important;
          align-items:center !important;
          justify-content:space-between !important;
          gap:10rem !important;
          width:100% !important;
        }
        .requirements-prototype-side .linq-review-side-count {
          display:inline-flex !important;
          align-items:center !important;
          justify-content:center !important;
          min-width:24rem !important;
          height:24rem !important;
          padding:0 6rem !important;
          color:#ff3600 !important;
          border-radius:12rem !important;
          background:#fff1ed !important;
          font-size:13rem !important;
          font-weight:800 !important;
          line-height:1 !important;
          box-sizing:border-box !important;
        }
        .requirements-prototype-side .side-item.active .linq-review-side-count {
          color:#ff3600 !important;
          background:#fff !important;
        }
      `;
      doc.head.append(style);
    }
  }

  function applyStaticRequirementChrome(doc) {
    const companySearch = doc.querySelector('input[placeholder="Find Company"]');
    if (companySearch) {
      const dropdown = companySearch.closest('.dropdown');
      const wrapper = dropdown?.parentElement;
      if (wrapper && wrapper.children.length === 1) wrapper.remove();
      else dropdown?.remove();
    }

    const contentHead = doc.querySelector('.content-head');
    const dateForm = doc.querySelector('.content-body .section-top .filter-form')
      || doc.querySelector('.content-head .filter-form');
    if (contentHead && dateForm) {
      contentHead.classList.add('linq-static-title-filter-row');
      if (dateForm.parentElement !== contentHead) contentHead.append(dateForm);

      const custom = [...dateForm.querySelectorAll('label, button')]
        .find(node => node.textContent.replace(/\s/g, '') === '사용자설정');
      if (custom) {
        let info = dateForm.querySelector('.linq-static-period-info');
        if (!info) {
          info = doc.createElement('button');
          info.type = 'button';
          info.className = 'linq-static-period-info';
          info.textContent = 'i';
          custom.parentElement.insertBefore(info, custom);
        }
        const helpText = '사용자설정 조회 가능 기간은 서버 기준 확인이 필요합니다.';
        info.title = helpText;
        info.setAttribute('aria-label', helpText);
      }
    }
    doc.querySelectorAll('.linq-review-period-help').forEach(node => node.remove());

    if (!doc.querySelector('style[data-static-requirement-chrome]')) {
      const style = doc.createElement('style');
      style.dataset.staticRequirementChrome = '';
      style.textContent = `
        .page-head__account input[placeholder="Find Company"],
        .page-head__account input[placeholder="Find Company"] + .dropdown-list,
        .page-head__account input[placeholder="Find Company"] ~ .search-input__button { display:none !important; }
        .linq-static-title-filter-row {
          display:flex !important;
          width:100% !important;
          min-height:72rem !important;
          align-items:center !important;
          justify-content:space-between !important;
          gap:24rem !important;
        }
        .linq-static-title-filter-row > .content-head__main { flex:0 0 auto !important; min-width:0 !important; }
        .linq-static-title-filter-row > .filter-form { flex:0 0 auto !important; margin:0 0 0 auto !important; }
        .linq-static-title-filter-row .filter-form__body { display:flex !important; align-items:center !important; justify-content:flex-end !important; gap:0 !important; }
        .linq-static-period-info {
          display:inline-grid !important;
          flex:0 0 22rem !important;
          width:22rem !important;
          height:22rem !important;
          margin:0 6rem 0 0 !important;
          padding:0 !important;
          place-items:center !important;
          color:#666 !important;
          border:1px solid #999 !important;
          border-radius:50% !important;
          background:#fff !important;
          font:700 12rem/1 Arial,sans-serif !important;
          cursor:help !important;
          pointer-events:auto !important;
        }
      `;
      doc.head.append(style);
    }
  }

  function applyStaticDashboardLayout(doc) {
    const layout = doc.querySelector('.vue-grid-layout');
    if (!layout) return;
    const items = [...layout.querySelectorAll(':scope > .vue-grid-item:not(.vue-grid-placeholder)')];
    if (!items.length) return;
    const nominalWidth = 1115;
    const availableWidth = Math.max(nominalWidth, layout.clientWidth || layout.getBoundingClientRect().width || nominalWidth);
    const ratio = availableWidth / nominalWidth;
    items.forEach(item => {
      const transform = item.style.transform.match(/translate3d\(([\d.]+)px,\s*([\d.]+)px/i);
      const width = Number.parseFloat(item.style.width);
      if (!transform || !Number.isFinite(width)) return;
      item.style.transform = `translate3d(${(Number(transform[1]) * ratio).toFixed(2)}px, ${transform[2]}px, 0px)`;
      item.style.width = `${(width * ratio).toFixed(2)}px`;
    });
    layout.style.width = '100%';
    layout.style.maxWidth = 'none';
  }

  function applyStaticOperationEfficiency(doc) {
    const customChart = doc.querySelector('.linq-review-efficiency-chart');
    if (!customChart) return;
    doc.querySelectorAll('.linq-review-period-metrics').forEach(node => node.remove());

    const rows = [
      [0.2,36.4,63.3],[1.0,0.1,98.7],[0,0,0],[17.9,2.4,79.5],[63.5,7.9,28.5],[17.7,4.9,77.3],
      [15.2,2.9,81.7],[9.3,6.4,84.1],[12.6,0.8,86.4],[43.1,27.6,29.2],[43.1,25.2,31.5],[40.0,24.4,35.4],
      ...Array.from({length:19}, () => [0,0,0]),
    ];
    const bars = rows.map((values, index) => {
      const [workRate, idleRate, offRate] = values;
      const x = 58 + index * 29.5;
      const usableHeight = 164;
      const work = usableHeight * workRate / 100;
      const idle = usableHeight * idleRate / 100;
      const off = usableHeight * offRate / 100;
      const bottom = 204;
      const workY = bottom - work;
      const idleY = workY - idle;
      const offY = idleY - off;
      const day = index + 1;
      return `<g tabindex="0" role="img" aria-label="8월 ${day}일 작업 ${workRate}%, 대기 ${idleRate}%, 미사용 ${offRate}%">
        <title>8월 ${day}일 · 작업 ${workRate}% · 대기 ${idleRate}% · 미사용 ${offRate}%</title>
        <rect x="${x}" y="${workY}" width="18" height="${work}" fill="#8aabbd"/>
        <rect x="${x}" y="${idleY}" width="18" height="${idle}" fill="#d4dfe5"/>
        <rect x="${x}" y="${offY}" width="18" height="${off}" fill="#c9c9c9"/>
        <text x="${x + 9}" y="226" text-anchor="middle">${day}</text>
      </g>`;
    }).join('');
    const restored = doc.createElement('div');
    restored.className = 'linq-static-efficiency-restored';
    restored.setAttribute('role', 'img');
    restored.setAttribute('aria-label', '1일부터 31일까지 작업시간, 대기시간, 미사용시간을 표시한 운영효율 차트');
    restored.innerHTML = `<svg viewBox="0 0 1000 245" preserveAspectRatio="none" aria-hidden="true">
      <g class="grid"><line x1="48" y1="40" x2="982" y2="40"/><line x1="48" y1="81" x2="982" y2="81"/><line x1="48" y1="122" x2="982" y2="122"/><line x1="48" y1="163" x2="982" y2="163"/><line x1="48" y1="204" x2="982" y2="204"/></g>
      <g class="axis"><text x="8" y="44">100</text><text x="18" y="85">75</text><text x="18" y="126">50</text><text x="18" y="167">25</text><text x="26" y="208">0</text></g>
      ${bars}
    </svg>`;
    customChart.replaceWith(restored);

    if (!doc.querySelector('style[data-static-operation-efficiency]')) {
      const style = doc.createElement('style');
      style.dataset.staticOperationEfficiency = '';
      style.textContent = `
        .linq-static-efficiency-restored { width:100%; height:280rem; padding:10rem 24rem 0; box-sizing:border-box; }
        .linq-static-efficiency-restored svg { display:block; width:100%; height:100%; overflow:visible; }
        .linq-static-efficiency-restored .grid line { stroke:#e1e4e7; stroke-width:1; }
        .linq-static-efficiency-restored text { fill:#5e646a; font-family:inherit; font-size:11px; }
      `;
      doc.head.append(style);
    }
  }

  function applyStaticBatteryLayout(doc, route) {
    let compare = false;
    try {
      compare = new URL(route, location.origin).searchParams.get('batteryCompare') === '1';
    } catch (_error) {}

    const comparison = doc.querySelector('.linq-review-battery-compare');
    const nativeChartSections = [...doc.querySelectorAll('.content-body > .content-section')]
      .filter(section => section.querySelector('.linq-review-battery-production-chart'));

    if (compare) {
      nativeChartSections.forEach(section => { section.style.display = 'none'; });
      if (comparison) comparison.style.display = '';
    } else {
      comparison?.remove();
      nativeChartSections.forEach(section => {
        section.style.display = 'block';
        section.style.width = '100%';
        section.style.maxWidth = 'none';
      });
    }
  }

  function revealWhenReady() {
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      try {
        const doc = frame.contentDocument;
        addReviewAssets(doc);
        const reviewScreen = reviewScreenForRoute(normalizeRoute(requestedRoute));
        const navigationReady = reviewScreen === 'dashboard'
          ? doc.querySelector('.requirements-prototype-dashboard-tabs')
          : doc.querySelector('.top-selection.requirements-prototype-selector');
        if (navigationReady && (reviewScreen === 'service-overview' || doc.querySelector('.linq-review-guide'))) {
          window.clearInterval(timer);
          status.hidden = true;
          frame.classList.add('is-ready');
          return;
        }
        if (/\/login(?:\/|$)/.test(frame.contentWindow.location.pathname)) {
          window.clearInterval(timer);
          recoverPreviewSession();
          return;
        }
      } catch (_error) {
        // Same-origin iframe initialization can briefly be unavailable while loading.
      }
      if (attempts >= 200) {
        window.clearInterval(timer);
        setStatus('화면을 불러오는 시간이 길어지고 있습니다. 로컬 서버 상태를 확인해 주세요.', true);
      }
    }, 50);
  }

  async function start() {
    const route = normalizeRoute(requestedRoute);
    if (!route) {
      setStatus('열 수 없는 검토 화면 경로입니다.', true);
      return;
    }

    if (isStaticPreviewHost()) {
      const reviewScreen = reviewScreenForRoute(route);
      if (!reviewScreen) {
        setStatus('공개용 검토 화면을 찾지 못했습니다.', true);
        return;
      }
      setStatus('공개용 검토 화면을 불러오고 있습니다.');
      frame.addEventListener('load', () => {
        try { applyStaticRequirementChrome(frame.contentDocument); } catch (_error) {}
        try { applyStaticServiceCounts(frame.contentDocument); } catch (_error) {}
        if (reviewScreen === 'dashboard') {
          try { applyStaticDashboardLayout(frame.contentDocument); } catch (_error) {}
        }
        if (reviewScreen === 'operation-efficiency') {
          try { applyStaticOperationEfficiency(frame.contentDocument); } catch (_error) {}
        }
        if (reviewScreen === 'lithium-battery') {
          try { applyStaticBatteryLayout(frame.contentDocument, route); } catch (_error) {}
        }
        status.hidden = true;
        frame.classList.add('is-ready');
      }, {once:true});
      frame.src = `./static/${reviewScreen}.html${location.search}`;
      return;
    }
    try {
      await createPreviewSession();
      frame.addEventListener('load', () => {
        try {
          if (/\/login(?:\/|$)/.test(frame.contentWindow.location.pathname)) {
            recoverPreviewSession();
            return;
          }
          addReviewAssets(frame.contentDocument);
        } catch (_error) {}
      });
      frame.src = route;
      revealWhenReady();
      window.setInterval(() => {
        try {
          if (/\/login(?:\/|$)/.test(frame.contentWindow.location.pathname)) recoverPreviewSession();
        } catch (_error) {}
      }, 500);
    } catch (error) {
      setStatus(error.message, true);
    }
  }

  start();
})();

