(() => {
  const data = window.LINQ_DEALER_MOBILE_DATA;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const toast = $('.toast');
  let toastTimer;

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 1700);
  }

  function fillData() {
    $$('[data-error-count]').forEach(el => { el.textContent = data.counts.vehicleError + data.counts.batteryError; });
    $$('[data-supply-count]').forEach(el => { el.textContent = data.counts.suppliesDue; });
    $$('[data-service-count]').forEach(el => { el.textContent = data.counts.totalService; });
    $$('[data-period]').forEach(el => { el.textContent = `조회기간 ${data.sourcePeriod}`; });
  }

  function filterRows(query) {
    const normalized = query.trim().toLowerCase();
    $$('[data-priority-row]').forEach(row => {
      row.hidden = normalized && !row.dataset.search.includes(normalized);
    });
  }

  fillData();
  if (window.lucide) window.lucide.createIcons();
  const search = $('[data-search]');
  if (search) search.addEventListener('input', event => filterRows(event.target.value));
  $$('[data-action]').forEach(button => button.addEventListener('click', () => showToast(button.dataset.action)));
})();
