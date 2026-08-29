(() => {
  const body = document.body;
  const query = new URLSearchParams(location.search);
  const requestedRoute = query.get('route') || body.dataset.route || '';
  const status = document.querySelector('.review-shell__status');
  const frame = document.querySelector('.review-shell__frame');
  let recoveringSession = false;

  function isStaticPreviewHost() {
    const isLocalReviewHost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    return query.get('static') === '1' || isLocalReviewHost || location.hostname.endsWith('github.io') || location.protocol === 'file:';
  }

  function reviewScreenForRoute(value) {
    const target = new URL(value, location.origin);
    if (target.searchParams.get('chart') === 'horizontal') return 'shock-horizontal';
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
      if (target.origin !== location.origin || !target.pathname.startsWith('/dealer/')) return null;
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
    sessionStorage.setItem('userId', 'Test_Dealer2_Admin');
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
    doc.defaultView.LINQ_REVIEW_SERVICE = 'dealer';
    if (!doc.querySelector('link[data-requirements-prototype-shell]')) {
      const style = doc.createElement('link');
      style.rel = 'stylesheet';
      style.href = new URL('./assets/requirements-prototype-shell.css?v=20260829-3', location.href).href;
      style.dataset.requirementsPrototypeShell = '';
      doc.head.append(style);
    }
    if (!doc.querySelector('script[data-requirements-prototype-shell]')) {
      const script = doc.createElement('script');
      script.src = new URL('./assets/requirements-prototype-shell.js?v=20260822-22', location.href).href;
      script.async = false;
      script.dataset.requirementsPrototypeShell = '';
      doc.head.append(script);
    }
    const reviewStyle = doc.querySelector('link[data-requirements-review]');
    if (reviewStyle) {
      reviewStyle.href = new URL('./assets/actual-review-overlay.css?v=20260829-4', location.href).href;
    } else {
      const style = doc.createElement('link');
      style.rel = 'stylesheet';
      style.href = new URL('./assets/actual-review-overlay.css?v=20260829-4', location.href).href;
      style.dataset.requirementsReview = '';
      doc.head.append(style);
    }
    if (!doc.querySelector('script[data-requirements-review]')) {
      const script = doc.createElement('script');
      script.src = new URL('./assets/actual-review-overlay.js?v=20260829-4', location.href).href;
      script.async = false;
      script.dataset.requirementsReview = '';
      doc.head.append(script);
    }
  }

  function revealWhenReady() {
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      try {
        const doc = frame.contentDocument;
        addReviewAssets(doc);
        if (doc.querySelector('.top-selection.requirements-prototype-selector') && doc.querySelector('.linq-review-guide')) {
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
      setStatus('공개용 딜러 검토 화면을 불러오고 있습니다.');
      frame.addEventListener('load', () => {
        status.hidden = true;
        frame.classList.add('is-ready');
      }, {once:true});
      const previewVersion = query.get('v') || '20260828-4';
      frame.src = `./static/${reviewScreen}.html?service=dealer&screen=${encodeURIComponent(reviewScreen)}&v=${encodeURIComponent(previewVersion)}`;
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
