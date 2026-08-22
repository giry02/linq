(() => {
  const data = window.LINQ_DEALER_MOBILE_DATA;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const toast = $('.toast');
  let toastTimer;
  let vehicleFilter = 'all';
  let serviceTab = 'error';
  let previousView = 'home';
  let selectedServiceItem = null;

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 1800);
  }

  function priorityMarkup(item) {
    const isSupply = item.type === 'supply';
    const detail = isSupply ? item.usage : `${item.model} · 에러코드 ${item.code}`;
    const time = isSupply ? item.percent : item.datetime.slice(5);
    return `<button type="button" class="dashboard-alert ${isSupply ? 'is-supply' : ''}" data-type="${item.type}" data-equipment="${item.equipmentNumber}" data-search="${[item.equipmentNumber,item.model,item.company,item.title].join(' ').toLowerCase()}">
      <i data-lucide="${isSupply ? 'refresh-cw' : 'triangle-alert'}" aria-hidden="true"></i>
      <span><strong>${item.equipmentNumber} · ${item.title}</strong><small>${item.company}<br>${detail}</small></span><time>${time}</time>
    </button>`;
  }

  function renderPriority(items = data.priority) {
    $('#priority-list').innerHTML = items.map(priorityMarkup).join('');
    $('#priority-count').textContent = `${items.length}건`;
    $('#empty-state').hidden = items.length > 0;
    window.lucide?.createIcons({attrs:{'stroke-width':2}});
    $$('.dashboard-alert').forEach(button => button.addEventListener('click', () => {
      const item = (data.service[button.dataset.type] || []).find(row => row.equipmentNumber === button.dataset.equipment);
      if (item) openServiceDetail(item, button.dataset.type, 'home');
    }));
  }

  function renderNotifications() {
    $('#notification-list').innerHTML = data.notifications.map(item => `<article class="notification-item"><div><strong>${item.title}</strong><time>${item.time}</time></div><p>${item.detail}</p></article>`).join('');
    $('#notification-count').textContent = data.notifications.length;
  }

  function vehicleMarkup(item) {
    const attention = item.status === 'attention';
    return `<button type="button" class="vehicle-mobile-row" data-equipment="${item.equipmentNumber}" data-search="${[item.equipmentNumber,item.model,item.company,item.power].join(' ').toLowerCase()}">
      <div class="vehicle-mobile-row__head"><div><strong>${item.equipmentNumber}</strong><small>${item.model} · ${item.company}</small></div><span class="status-pill ${attention ? 'is-danger' : ''}">${item.issue}</span></div>
      <div class="vehicle-mobile-row__meta"><span>동력<b>${item.power}</b></span><span>연결<b>${item.connection}</b></span><span>상태<b>${attention ? '확인 필요' : '정상'}</b></span></div>
    </button>`;
  }

  function renderVehicles() {
    const query = $('#vehicle-list-search').value.trim().toLowerCase();
    const rows = data.vehicles.filter(item => {
      const matchFilter = vehicleFilter === 'all' || item.status === vehicleFilter;
      const matchSearch = !query || [item.equipmentNumber,item.model,item.company,item.power].join(' ').toLowerCase().includes(query);
      return matchFilter && matchSearch;
    });
    $('#vehicle-mobile-list').innerHTML = rows.map(vehicleMarkup).join('');
    $('#vehicle-total').textContent = `전체 ${data.vehicles.length}대`;
    $('#vehicle-empty').hidden = rows.length > 0;
    $$('.vehicle-mobile-row').forEach(button => button.addEventListener('click', () => {
      const item = data.vehicles.find(row => row.equipmentNumber === button.dataset.equipment);
      if (item) openVehicleDetail(item, 'vehicles');
    }));
  }

  function serviceMarkup(item, type) {
    return `<button type="button" class="service-mobile-row is-${type}" data-equipment="${item.equipmentNumber}"><div class="service-mobile-row__head"><div><strong>${item.equipmentNumber}</strong><small>${item.model} · ${item.company}</small></div><span class="status-pill ${type === 'error' ? 'is-danger' : ''}">${item.status}</span></div><p>${item.title}</p><div class="service-mobile-row__meta"><span>${item.detail}</span><b>${item.datetime}</b></div></button>`;
  }

  function renderService(type = serviceTab) {
    serviceTab = type;
    $('#service-mobile-list').innerHTML = (data.service[type] || []).map(item => serviceMarkup(item, type)).join('');
    $$('[data-service-type]').forEach(button => {
      const selected = button.dataset.serviceType === type;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-selected', String(selected));
    });
    $$('.service-mobile-row').forEach(button => button.addEventListener('click', () => {
      const item = (data.service[type] || []).find(row => row.equipmentNumber === button.dataset.equipment);
      if (item) openServiceDetail(item, type, 'service');
    }));
  }

  function showView(name, origin) {
    const current = $('[data-view-panel].is-active')?.dataset.viewPanel || 'home';
    if (origin) previousView = origin;
    else if (name !== current && !['home','vehicles','service','settings'].includes(name)) previousView = current;
    $$('[data-view-panel]').forEach(panel => panel.classList.toggle('is-active', panel.dataset.viewPanel === name));
    $$('.bottom-nav [data-nav]').forEach(button => button.classList.toggle('is-active', button.dataset.nav === name));
    const home = name === 'home';
    $('[data-header-brand]').hidden = !home;
    $('[data-header-title]').hidden = home;
    $('.header-back').hidden = home;
    $('[data-header-title]').textContent = name === 'vehicles' ? '차량' : name === 'vehicle-detail' ? '차량 상세' : name === 'service' ? '서비스' : name === 'service-detail' ? '서비스 상세' : name === 'settings' ? '설정' : '';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function serviceRecordsFor(equipmentNumber) {
    return Object.entries(data.service).flatMap(([type, items]) => items.filter(item => item.equipmentNumber === equipmentNumber).map(item => ({...item, type})));
  }

  function openVehicleDetail(item, origin = 'vehicles') {
    const attention = item.status === 'attention';
    const records = serviceRecordsFor(item.equipmentNumber);
    $('#vehicle-detail-model').textContent = item.model;
    $('#vehicle-detail-title').textContent = item.equipmentNumber;
    $('#vehicle-detail-company').textContent = item.company;
    $('#vehicle-detail-status').textContent = attention ? '확인 필요' : '정상';
    $('#vehicle-detail-status').classList.toggle('is-danger', attention);
    $('#vehicle-detail-info').innerHTML = `<div><dt>동력 유형</dt><dd>${item.power}</dd></div><div><dt>연결 상태</dt><dd>${item.connection}</dd></div><div><dt>현재 상태</dt><dd>${item.issue}</dd></div><div><dt>고객사</dt><dd>${item.company}</dd></div>`;
    $('#vehicle-service-total').textContent = `${records.length}건`;
    $('#vehicle-service-empty').hidden = records.length > 0;
    $('#vehicle-service-list').innerHTML = records.map(record => `<button type="button" data-vehicle-service="${record.type}" data-equipment="${record.equipmentNumber}"><span><strong>${record.type === 'error' ? '차량 에러' : record.type === 'supply' ? '소모품' : '정비 이력'}</strong><small>${record.title}</small></span><i data-lucide="chevron-right"></i></button>`).join('');
    $$('[data-vehicle-service]').forEach(button => button.addEventListener('click', () => {
      const record = (data.service[button.dataset.vehicleService] || []).find(row => row.equipmentNumber === button.dataset.equipment);
      if (record) openServiceDetail(record, button.dataset.vehicleService, 'vehicle-detail');
    }));
    window.lucide?.createIcons({attrs:{'stroke-width':2}});
    showView('vehicle-detail', origin);
  }

  function openServiceDetail(item, type, origin = 'service') {
    selectedServiceItem = {item, type};
    const typeName = type === 'error' ? '차량 에러' : type === 'supply' ? '소모품 도래' : '정비 이력';
    const iconName = type === 'error' ? 'triangle-alert' : type === 'supply' ? 'refresh-cw' : 'clipboard-check';
    $('#service-detail-icon').className = `detail-icon is-${type}`;
    $('#service-detail-icon').innerHTML = `<i data-lucide="${iconName}"></i>`;
    $('#service-detail-type').textContent = typeName;
    $('#service-detail-title').textContent = item.title;
    $('#service-detail-equipment').textContent = `${item.equipmentNumber} · ${item.model}`;
    $('#service-detail-status').textContent = item.status;
    $('#service-detail-status').classList.toggle('is-danger', type === 'error');
    $('#service-detail-info').innerHTML = `<div><dt>호기</dt><dd>${item.equipmentNumber}</dd></div><div><dt>기종</dt><dd>${item.model}</dd></div><div><dt>고객사</dt><dd>${item.company}</dd></div><div><dt>구분</dt><dd>${typeName}</dd></div><div><dt>상태</dt><dd>${item.status}</dd></div><div><dt>발생·등록 정보</dt><dd>${item.datetime}</dd></div><div class="is-wide"><dt>상세 내용</dt><dd>${item.detail}</dd></div>`;
    window.lucide?.createIcons({attrs:{'stroke-width':2}});
    showView('service-detail', origin);
  }

  function openNotifications() {
    $('.sheet-backdrop').hidden = false;
    $('.notification-sheet').hidden = false;
  }
  function closeNotifications() {
    $('.sheet-backdrop').hidden = true;
    $('.notification-sheet').hidden = true;
  }

  $('#period-label').textContent = `조회기간 ${data.sourcePeriod}`;
  $('#error-total').textContent = data.counts.vehicleError + data.counts.batteryError;
  $('#schedule-total').textContent = data.counts.suppliesDue;
  $('#maintenance-total').textContent = data.counts.maintenance;
  $('#service-total').textContent = `총 ${data.counts.totalService}건`;
  $('#service-donut-total').textContent = data.counts.totalService;
  $('#legend-error-total').textContent = data.counts.vehicleError + data.counts.batteryError;
  $('#legend-supply-total').textContent = data.counts.suppliesDue;
  $('#service-donut').style.setProperty('--error-share', `${((data.counts.vehicleError + data.counts.batteryError) / data.counts.totalService) * 100}%`);
  $('#account-id').textContent = data.account.id;
  $('#service-error-count').textContent = data.service.error.length;
  $('#service-supply-count').textContent = data.service.supply.length;
  $('#service-maintenance-count').textContent = data.service.maintenance.length;
  renderPriority();
  renderNotifications();
  renderVehicles();
  renderService();

  $('#vehicle-search').addEventListener('input', event => {
    const query = event.target.value.trim().toLowerCase();
    renderPriority(query ? data.priority.filter(item => [item.equipmentNumber,item.model,item.company,item.title].join(' ').toLowerCase().includes(query)) : data.priority);
  });
  $$('[data-filter]').forEach(button => button.addEventListener('click', () => {
    showView('service');
    renderService(button.dataset.filter);
  }));
  $('#vehicle-list-search').addEventListener('input', renderVehicles);
  $$('[data-vehicle-filter]').forEach(button => button.addEventListener('click', () => {
    vehicleFilter = button.dataset.vehicleFilter;
    $$('[data-vehicle-filter]').forEach(item => item.classList.toggle('is-active', item === button));
    renderVehicles();
  }));
  $$('[data-service-type]').forEach(button => button.addEventListener('click', () => renderService(button.dataset.serviceType)));
  $$('[data-nav]').forEach(button => button.addEventListener('click', () => showView(button.dataset.nav)));
  $('[data-back]').addEventListener('click', () => showView(previousView));
  $('#service-detail-vehicle').addEventListener('click', () => {
    if (!selectedServiceItem) return;
    const vehicle = data.vehicles.find(item => item.equipmentNumber === selectedServiceItem.item.equipmentNumber);
    if (vehicle) openVehicleDetail(vehicle, 'service-detail');
    else showToast('차량 목록에 등록된 호기가 아닙니다.');
  });
  $('[data-open-notifications]').addEventListener('click', openNotifications);
  $$('[data-close-sheet]').forEach(button => button.addEventListener('click', closeNotifications));

  const savedSettings = JSON.parse(localStorage.getItem('linqDealerMobileSettings') || '{}');
  $$('[data-setting]').forEach(input => {
    if (Object.hasOwn(savedSettings, input.dataset.setting)) input.checked = savedSettings[input.dataset.setting];
    input.addEventListener('change', () => {
      const settings = {};
      $$('[data-setting]').forEach(item => { settings[item.dataset.setting] = item.checked; });
      localStorage.setItem('linqDealerMobileSettings', JSON.stringify(settings));
      showToast('알림 설정을 저장했습니다.');
    });
  });
  $('#language').addEventListener('change', event => showToast(event.target.value === 'ko' ? '한국어로 설정했습니다.' : 'English 화면은 다국어 연결 시 적용됩니다.'));
  $('#logout').addEventListener('click', () => showToast('로컬 검토 화면에서는 로그아웃 동작만 확인합니다.'));
  window.lucide?.createIcons({attrs:{'stroke-width':2}});
})();
