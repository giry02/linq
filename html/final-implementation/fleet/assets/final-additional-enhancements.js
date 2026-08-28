(() => {
  if (window.__linqFinalAdditionalMounted) return;
  window.__linqFinalAdditionalMounted = true;

  const classifyRoute = () => {
    const path = location.pathname;
    document.body.classList.add('linq-final-implementation');
    const classes = {
      'linq-final-vehicle-page': path.includes('/equip/'),
      'linq-final-vehicle-list-page': path.includes('/equip/list/'),
      'linq-final-vehicle-detail-page': path.includes('/equip/detail/'),
      'linq-final-dashboard-page': path.includes('/dashboard/'),
      'linq-final-map-page': path.includes('/maps/'),
      'linq-final-report-page': path.includes('/rpt/'),
      'linq-final-management-page': path.includes('/mgmt/'),
      'linq-final-auth-page': path.includes('/login') || path.includes('/auth/'),
    };
    Object.entries(classes).forEach(([name, active]) => document.body.classList.toggle(name, active));
  };

  const normalizeUnavailableText = () => {
    document.querySelectorAll('.content-body, .local-body, .page-management').forEach(scope => {
      [...scope.querySelectorAll('p, strong, span')].forEach(node => {
        if (node.children.length || node.closest('.linq-final-state')) return;
        const value = node.textContent.trim();
        if (!['undefined', 'null', 'NaN', 'Loading...', 'Loading....'].includes(value)) return;
        node.textContent = '-';
        node.setAttribute('aria-label', '표시 가능한 데이터 없음');
      });
    });
  };

  const keepFooterAfterContent = () => {
    const page = document.querySelector('#page');
    const footer = document.querySelector('.page-foot, .footer, footer');
    if (!page || !footer) return;
    const body = page.querySelector('.page-body, .page-management');
    if (!body) return;
    const bodyBottom = body.getBoundingClientRect().bottom;
    const footerTop = footer.getBoundingClientRect().top;
    if (footerTop < bodyBottom - 2) footer.style.marginTop = `${Math.ceil(bodyBottom - footerTop)}px`;
  };

  const mergeDashboardErrors = () => {
    if (!location.pathname.includes('/dashboard/')) return;
    const scopes = document.querySelectorAll('.page-management, .content-body, .dashboard-content');
    for (const scope of scopes) {
      const candidates = [...scope.querySelectorAll('button, a, .dashboard-card, .widget-item, li')]
        .filter(node => !node.closest('.requirements-prototype-dashboard-tabs, .requirements-prototype-selector, .requirements-prototype-side'));
      const vehicle = candidates.find(node => /\ucc28\ub7c9\s*\uc5d0\ub7ec/.test(node.textContent));
      const battery = candidates.find(node => /\ubc30\ud130\ub9ac\s*\uc5d0\ub7ec/.test(node.textContent));
      if (!vehicle || !battery || vehicle === battery || battery.dataset.linqMerged === 'true') continue;
      const vehicleCount = [...vehicle.querySelectorAll('em, strong, b, span')]
        .find(node => /^\s*\d+\s*$/.test(node.textContent));
      const batteryCount = [...battery.querySelectorAll('em, strong, b, span')]
        .find(node => /^\s*\d+\s*$/.test(node.textContent));
      if (vehicleCount && batteryCount) {
        vehicleCount.textContent = String((Number(vehicleCount.textContent) || 0) + (Number(batteryCount.textContent) || 0));
      }
      battery.dataset.linqMerged = 'true';
      battery.remove();
      vehicle.setAttribute('aria-label', '\ucc28\ub7c9 \ubc0f \ubc30\ud130\ub9ac \uc5d0\ub7ec');
      break;
    }
  };

  let queued = false;
  const refresh = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      classifyRoute();
      normalizeUnavailableText();
      mergeDashboardErrors();
      keepFooterAfterContent();
    });
  };

  const push = history.pushState.bind(history);
  const replace = history.replaceState.bind(history);
  history.pushState = (...args) => { const result = push(...args); refresh(); return result; };
  history.replaceState = (...args) => { const result = replace(...args); refresh(); return result; };
  addEventListener('popstate', refresh);
  addEventListener('resize', refresh, { passive: true });
  new MutationObserver(refresh).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refresh, { once: true });
  else refresh();
})();
