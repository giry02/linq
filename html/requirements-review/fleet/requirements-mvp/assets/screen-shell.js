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
    const normalizedCurrentRoute = normalizeRoute(currentRoute);
    const previewRoute = /\/requirements-mvp\/static\//.test(normalizedCurrentRoute)
      ? normalizeRoute(requestedRoute)
      : normalizedCurrentRoute || normalizeRoute(requestedRoute);
    const reviewScreen = reviewScreenForRoute(previewRoute);
    doc.defaultView.LINQ_REQUIREMENT_REVIEW = window.LINQ_REQUIREMENT_REVIEW;
    doc.defaultView.LINQ_REVIEW_SCREEN = reviewScreen;
    doc.documentElement.dataset.linqReviewScreen = reviewScreen;
    if (!doc.querySelector('link[data-requirements-prototype-shell]')) {
      const style = doc.createElement('link');
      style.rel = 'stylesheet';
    style.href = '/requirements-mvp/assets/requirements-prototype-shell.css?v=20260829-3';
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
    const reviewStyle = doc.querySelector('link[data-requirements-review]');
    if (reviewStyle) {
      reviewStyle.href = '/requirements-mvp/assets/actual-review-overlay.css?v=20260829-3';
    } else {
      const style = doc.createElement('link');
      style.rel = 'stylesheet';
      style.href = '/requirements-mvp/assets/actual-review-overlay.css?v=20260829-3';
      style.dataset.requirementsReview = '';
      doc.head.append(style);
    }
    const existingReviewScript = doc.querySelector('script[data-requirements-review], script[src*="actual-review-overlay.js"]');
    const currentReviewVersion = '20260829-3';
    const existingReviewIsCurrent = existingReviewScript?.src.includes(`v=${currentReviewVersion}`);
    if (doc.defaultView.__linqReviewOverlayMounted && existingReviewIsCurrent) {
      if (existingReviewScript) existingReviewScript.dataset.requirementsReview = '';
    } else {
      doc.defaultView.__linqReviewOverlayMounted = false;
      if (existingReviewScript) existingReviewScript.remove();
      const script = doc.createElement('script');
      script.src = `/requirements-mvp/assets/actual-review-overlay.js?v=${currentReviewVersion}`;
      script.async = false;
      script.dataset.requirementsReview = '';
      doc.head.append(script);
    }
  }

  function applyStaticServiceCounts(doc) {
    const serviceSide = doc.querySelector('.requirements-prototype-side .analysis-menu-list');
    if (!serviceSide) return;

    const serviceSummary = doc.querySelector('.srvc-tab');
    serviceSummary?.remove();

    const serviceCounts = {maintenance: 2, supplies: 25, error: 9};
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
      badge.textContent = String(serviceCounts[icon]);
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
    const dateForm = [...doc.querySelectorAll('.filter-form')]
      .find(form => form.querySelector('.date-inputs') && form.querySelector('label, button, input'));
    if (contentHead && dateForm) {
      [...contentHead.querySelectorAll(':scope > .filter-form')]
        .filter(form => form !== dateForm && !form.querySelector('label, button, input'))
        .forEach(form => form.remove());
      contentHead.classList.add('linq-static-title-filter-row');
      if (dateForm.parentElement !== contentHead) contentHead.append(dateForm);

      const custom = [...dateForm.querySelectorAll('label, button')]
        .find(node => node.textContent.replace(/\s/g, '') === '사용자설정');
      if (custom) {
        custom.parentElement.classList.add('linq-static-period-control-row');
        const existingInfo = [...dateForm.querySelectorAll('.linq-static-period-info, .linq-review-period-info-button')];
        let info = existingInfo.shift();
        existingInfo.forEach(node => node.remove());
        if (!info) {
          info = doc.createElement('button');
          info.type = 'button';
          info.textContent = 'i';
        }
        info.className = 'linq-static-period-info';
        custom.parentElement.insertBefore(info, custom.nextSibling);
        const helpText = '사용자설정 조회 가능 기간은 서버 기준 확인이 필요합니다.';
        info.title = helpText;
        info.setAttribute('aria-label', helpText);
        if (info.dataset.periodInfoBound !== 'true') {
          info.dataset.periodInfoBound = 'true';
          const popover = doc.createElement('div');
          popover.className = 'linq-static-period-popover';
          popover.textContent = helpText;
          popover.hidden = true;
          popover.setAttribute('role', 'tooltip');
          popover.setAttribute('aria-hidden', 'true');
          doc.body.append(popover);
          const closePopover = () => {
            info.classList.remove('is-open');
            info.setAttribute('aria-expanded', 'false');
            popover.hidden = true;
            popover.setAttribute('aria-hidden', 'true');
          };
          const positionPopover = () => {
            if (popover.hidden) return;
            const rect = info.getBoundingClientRect();
            const width = Math.min(360, Math.max(240, doc.defaultView.innerWidth - 32));
            const left = Math.min(doc.defaultView.innerWidth - width - 16, Math.max(16, rect.right - width));
            popover.style.width = `${width}px`;
            popover.style.left = `${left}px`;
            popover.style.top = `${rect.bottom + 8}px`;
          };
          info.setAttribute('aria-expanded', 'false');
          info.addEventListener('click', event => {
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
          });
          doc.addEventListener('click', event => {
            if (!info.contains(event.target) && !popover.contains(event.target)) closePopover();
          });
          doc.defaultView.addEventListener('resize', positionPopover);
          doc.defaultView.addEventListener('scroll', positionPopover, true);
        }
      }
    }
    doc.querySelectorAll('.linq-review-period-help').forEach(node => node.remove());

    const analysisSide = doc.querySelector('.requirements-prototype-side .analysis-menu-list');
    if (analysisSide) {
      [...analysisSide.querySelectorAll('.side-item')].forEach(item => {
        const label = item.querySelector('em') || item;
        const text = label.textContent.replace(/\s/g, '');
        if (text === '엔진') label.textContent = '엔진 연비';
        if (text === '리튬배터리') label.textContent = '배터리';
        if (text === '수소배터리') item.remove();
      });
    }

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
          min-height:48rem !important;
          margin-bottom:8rem !important;
          align-items:center !important;
          justify-content:space-between !important;
          gap:24rem !important;
        }
        .linq-static-title-filter-row > .content-head__main { flex:0 0 auto !important; min-width:0 !important; }
        .linq-static-title-filter-row > .filter-form { flex:0 0 auto !important; margin:0 0 0 auto !important; }
        .linq-static-title-filter-row .filter-form__body { display:flex !important; align-items:center !important; justify-content:flex-end !important; gap:0 !important; }
        .linq-static-period-control-row { display:inline-flex !important; flex-wrap:nowrap !important; align-items:center !important; }
        .linq-static-period-info {
          position:relative !important;
          z-index:2 !important;
          display:inline-grid !important;
          flex:0 0 22rem !important;
          width:22rem !important;
          height:22rem !important;
          margin:0 0 0 6rem !important;
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
        .linq-static-period-info.is-open::after { content:none !important; }
        .linq-static-period-popover {
          position:fixed;
          z-index:10040;
          box-sizing:border-box;
          padding:10px 12px;
          color:#333;
          border:1px solid #d8d8d8;
          border-radius:4px;
          background:#fff;
          box-shadow:0 4px 14px rgba(0,0,0,.14);
          font:400 13px/1.5 Arial,sans-serif;
          text-align:left;
          white-space:normal;
        }
        .linq-static-period-popover[hidden] { display:none !important; }
      `;
      doc.head.append(style);
    }
  }

  function applyStaticPageCleanup(doc) {
    const removableHeadings = new Set(['장비점검 목록', '소모품 도래']);
    [...doc.querySelectorAll('.section-top__text')].forEach(title => {
      if (!removableHeadings.has(title.textContent.trim())) return;
      const sectionTop = title.closest('.section-top');
      title.remove();
      if (sectionTop && !sectionTop.textContent.trim() && !sectionTop.querySelector('button, input, select, a')) {
        sectionTop.remove();
      }
    });
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
    doc.querySelector('.linq-static-efficiency-restored')?.remove();
    doc.querySelectorAll('style[data-static-operation-efficiency]').forEach(style => style.remove());
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
      const handleStaticLoad = () => {
        try {
          if (!/\/requirements-mvp\/static\//.test(frame.contentWindow.location.pathname)) return;
        } catch (_error) { return; }
        frame.removeEventListener('load', handleStaticLoad);
        try { addReviewAssets(frame.contentDocument); } catch (_error) {}
        try { applyStaticRequirementChrome(frame.contentDocument); } catch (_error) {}
        try { applyStaticServiceCounts(frame.contentDocument); } catch (_error) {}
        try { applyStaticPageCleanup(frame.contentDocument); } catch (_error) {}
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
      };
      frame.addEventListener('load', handleStaticLoad);
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

