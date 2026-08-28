(() => {
  const data = window.LINQ_DEALER_MOBILE_DATA;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const toast = $('.toast');
  let toastTimer;
  let vehicleFilter = 'all';
  let serviceTab = 'vehicleError';
  let selectedPeriod = 'month';
  let notificationState = 'unresolved';
  let previousView = 'home';
  let selectedServiceItem = null;
  let dashboardSummaryAnimationFrame = 0;

  const fuelName = { LI: '리튬', LA: '납축', LM: '엔진', HI: '수소' };

  function displayValue(value, fallback = '정보 없음') {
    return value == null || value === '' || value === 'undefined' ? fallback : value;
  }

  function supplyKey(item) {
    return String(item.serviceId || `${item.equipmentNumber}|${item.scheduleId || item.title}`);
  }

  function isSupplyActionable(item) {
    return !item.completed;
  }

  function manualPathForError(item) {
    if (item.manualUrl) return item.manualUrl;
    const code = String(item.errorCode || '').trim();
    if (item.errorKind === '차량 에러' && code === '51') return './manuals/error-code-51.pdf';
    if (item.errorKind === '배터리 에러' && code === '16') return './manuals/battery-error-code-16.pdf';
    return '';
  }

  function downloadErrorPdf(item) {
    const url = manualPathForError(item);
    if (!url) {
      showToast('이 에러코드에는 등록된 PDF가 없습니다.');
      return;
    }
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop() || `error-${item.errorCode || 'guide'}.pdf`;
    link.target = '_blank';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function bindPdfButtons(rows) {
    $$('[data-error-pdf]').forEach(button => button.addEventListener('click', event => {
      event.stopPropagation();
      const item = rows[Number(button.dataset.errorPdf)];
      if (item) downloadErrorPdf(item);
    }));
  }

  function applySupplyOverrides() {
    const overrides = JSON.parse(localStorage.getItem('linqDealerSupplyOverrides') || '{}');
    data.service.supply.forEach(item => Object.assign(item, overrides[supplyKey(item)] || {}));
  }

  function persistSupplyOverride(item) {
    const overrides = JSON.parse(localStorage.getItem('linqDealerSupplyOverrides') || '{}');
    overrides[supplyKey(item)] = {
      completed: Boolean(item.completed),
      exchangeDate: item.exchangeDate || '',
      actionNote: item.actionNote || '',
      usage: item.usage,
      percent: item.percent,
      status: item.status
    };
    localStorage.setItem('linqDealerSupplyOverrides', JSON.stringify(overrides));
  }

  function refreshSupplyDerivedState() {
    const activeSupplies = data.service.supply.filter(isSupplyActionable);
    const supplyCounts = new Map();
    activeSupplies.forEach(item => supplyCounts.set(item.equipmentNumber, (supplyCounts.get(item.equipmentNumber) || 0) + 1));
    data.vehicles.forEach(item => {
      item.supplyCount = supplyCounts.get(item.equipmentNumber) || 0;
      const issues = [];
      if (item.vehicleErrorCount) issues.push(`차량 에러 ${item.vehicleErrorCount}건`);
      if (item.batteryErrorCount) issues.push(`배터리 에러 ${item.batteryErrorCount}건`);
      if (item.supplyCount) issues.push(`소모품 ${item.supplyCount}건`);
      item.status = issues.length ? 'attention' : 'normal';
      item.issue = issues.join(' · ') || '정상';
    });
    data.priority = [
      ...data.service.error.filter(isCurrentError).map(item => ({ ...item, type: 'error', code: item.errorCode })),
      ...activeSupplies.map(item => ({ ...item, type: 'supply', usage: `${item.usage} / 기준 ${item.cycle}` }))
    ].sort((a, b) => String(b.datetime).localeCompare(String(a.datetime)));
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 1800);
  }

  async function loadCapturedSource(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`${response.status} ${path}`);
    const wrapper = await response.json();
    const binary = atob(wrapper.body);
    const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
    return JSON.parse(new TextDecoder('utf-8').decode(bytes));
  }

  function isCurrentError(item) {
    return item.resolveNm === '현재' || item.status === '현재';
  }

  function normalizeConnection(row) {
    if (!row) return '정보 없음';
    if (row.connectState === 1 || row.connectStateName === '연결') return '연결됨';
    if (row.connectState === 0 || row.connectStateName === '미연결') return '연결 끊김';
    return row.connectStateName || '정보 없음';
  }

  async function hydrateCapturedData() {
    if (!data.captureSources) return;
    try {
      const [menu, daily, vehicleErrors, batteryErrors, supplies] = await Promise.all([
        loadCapturedSource(data.captureSources.vehicleMenu),
        loadCapturedSource(data.captureSources.vehicleDaily),
        loadCapturedSource(data.captureSources.vehicleErrors),
        loadCapturedSource(data.captureSources.batteryErrors),
        loadCapturedSource(data.captureSources.supplies)
      ]);

      const menuVehicles = menu.result.flatMap(group => (group.vehicles || []).map(vehicle => ({
        ...vehicle,
        groupName: vehicle.groupName || group.groupName?.replace(/^.*? - /, '') || '기본그룹'
      })));
      const menuByEquipment = new Map(menuVehicles.map(vehicle => [vehicle.equipmentNumber, vehicle]));
      const dailyByEquipment = new Map((daily.result || []).map(vehicle => [vehicle.equipmentNumber, vehicle]));

      const mappedVehicleErrors = (vehicleErrors.result || []).map(item => ({
        seq: item.seq,
        equipmentNumber: item.equipmentNumber,
        model: item.equipmentName || menuByEquipment.get(item.equipmentNumber)?.equipmentName || '-',
        company: item.companyName || menuByEquipment.get(item.equipmentNumber)?.companyName || '-',
        groupName: item.groupName || menuByEquipment.get(item.equipmentNumber)?.groupName || '기본그룹',
        title: item.errorItem || '차량 에러',
        detail: `에러코드 ${item.errorCode || '-'}`,
        errorCode: item.errorCode || '-',
        errorKind: '차량 에러',
        errorSolution: item.errorSolution || '',
        resolveMethod: item.resolveMethod || '',
        manualUrl: item.manualUrl || item.pdfUrl || '',
        status: item.resolveNm || '과거',
        datetime: item.eventDatetimeTz || item.eventDatetime,
        resolvedAt: item.resolveDatetime || ''
      }));

      const mappedBatteryErrors = (batteryErrors.result || []).map(item => ({
        seq: item.equipmentErrorSeq,
        equipmentNumber: item.equipmentNumber,
        model: item.codeName || menuByEquipment.get(item.equipmentNumber)?.equipmentName || '-',
        company: item.companyName || menuByEquipment.get(item.equipmentNumber)?.companyName || '-',
        groupName: item.groupName || menuByEquipment.get(item.equipmentNumber)?.groupName || '기본그룹',
        title: item.errorItem || '배터리 에러',
        detail: `에러코드 ${item.errorCode || '-'}${item.errorLevelCodeName ? ` · 등급 ${item.errorLevelCodeName}` : ''}`,
        errorCode: item.errorCode || '-',
        errorKind: '배터리 에러',
        errorSolution: item.errorSolution || '',
        resolveMethod: item.resolveMethod || '',
        manualUrl: item.manualUrl || item.pdfUrl || '',
        status: item.resolveNm || (item.resolveYn === 'Y' ? '과거' : '현재'),
        datetime: item.eventDatetime,
        resolvedAt: item.resolveDatetime || ''
      }));

      const sampleVehicleErrors = mappedVehicleErrors.filter(isCurrentError).slice(0, 2);
      const sampleBatteryErrors = mappedBatteryErrors.filter(isCurrentError).slice(0, 1);
      data.service.error = [...sampleVehicleErrors, ...sampleBatteryErrors]
        .sort((a, b) => String(b.datetime).localeCompare(String(a.datetime)));
      data.service.supply = (supplies.result || []).slice(0, 3).map(item => ({
        serviceId: item.serviceId,
        scheduleId: item.scheduleId,
        equipmentNumber: item.equipmentNumber,
        model: item.equipmentName || menuByEquipment.get(item.equipmentNumber)?.equipmentName || '-',
        company: item.companyName || menuByEquipment.get(item.equipmentNumber)?.companyName || '-',
        groupName: item.groupName || menuByEquipment.get(item.equipmentNumber)?.groupName || '기본그룹',
        title: item.scheduleName,
        detail: `${item.exchangeUseHour}H 사용 · 교체 기준 ${item.exchangeCycleHour}H`,
        usage: `${item.exchangeUseHour}H`,
        cycle: `${item.exchangeCycleHour}H`,
        percent: `${Number(item.per).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}%`,
        status: Number(item.per) >= 100 ? '교체 초과' : '교체 권유',
        datetime: data.referenceDate,
        registeredAt: item.regDatetime || '',
        exchangeCycleHour: Number(item.exchangeCycleHour) || 0,
        exchangeUseHour: Number(item.exchangeUseHour) || 0,
        exchangeCumulativeTimeVal: Number(item.exchangeCumulativeTimeVal) || 0,
        cumulativeTimeVal: Number(item.cumulativeTimeVal) || 0
      }));

      const currentErrors = data.service.error.filter(isCurrentError);
      const errorCounts = new Map();
      currentErrors.forEach(item => {
        const count = errorCounts.get(item.equipmentNumber) || { vehicle: 0, battery: 0 };
        if (item.errorKind === '배터리 에러') count.battery += 1;
        else count.vehicle += 1;
        errorCounts.set(item.equipmentNumber, count);
      });
      const supplyCounts = new Map();
      data.service.supply.forEach(item => supplyCounts.set(item.equipmentNumber, (supplyCounts.get(item.equipmentNumber) || 0) + 1));

      data.vehicles = menuVehicles.map(vehicle => {
        const dailyRow = dailyByEquipment.get(vehicle.equipmentNumber);
        const errors = errorCounts.get(vehicle.equipmentNumber) || { vehicle: 0, battery: 0 };
        const supplyCount = supplyCounts.get(vehicle.equipmentNumber) || 0;
        const vehicleErrorCount = errors.vehicle;
        const batteryErrorCount = errors.battery;
        const issues = [];
        if (vehicleErrorCount) issues.push(`차량 에러 ${vehicleErrorCount}건`);
        if (batteryErrorCount) issues.push(`배터리 에러 ${batteryErrorCount}건`);
        if (supplyCount) issues.push(`소모품 ${supplyCount}건`);
        return {
          equipmentNumber: vehicle.equipmentNumber,
          model: vehicle.equipmentName || vehicle.codeName || '-',
          company: vehicle.companyName || '-',
          groupName: vehicle.groupName || '기본그룹',
          power: fuelName[vehicle.fuelTypeCode] || vehicle.fuelTypeCode || '-',
          connection: normalizeConnection(dailyRow),
          lastDatetime: dailyRow?.lastDatetime || dailyRow?.workingDatetime || '정보 없음',
          lastAddress: dailyRow?.lastAddress || '정보 없음',
          distance: dailyRow?.strDistance || (dailyRow?.distance != null ? `${dailyRow.distance}Km` : '정보 없음'),
          operatingTime: dailyRow?.strOperatingTime || '정보 없음',
          latitude: Number.isFinite(Number(dailyRow?.lastLatitude)) && Number(dailyRow?.lastLatitude) !== 0 ? Number(dailyRow.lastLatitude) : null,
          longitude: Number.isFinite(Number(dailyRow?.lastLongitude)) && Number(dailyRow?.lastLongitude) !== 0 ? Number(dailyRow.lastLongitude) : null,
          vehicleErrorCount,
          batteryErrorCount,
          supplyCount,
          status: issues.length ? 'attention' : 'normal',
          issue: issues.join(' · ') || '정상'
        };
      });

      data.priority = [
        ...currentErrors.map(item => ({ ...item, type: 'error', code: item.errorCode })),
        ...data.service.supply.map(item => ({ ...item, type: 'supply', usage: `${item.usage} / 기준 ${item.cycle}` }))
      ];
    } catch (error) {
      console.warn('캡처 차량 데이터를 불러오지 못해 기본 데이터를 표시합니다.', error);
      showToast('전체 차량 데이터 연결을 확인해 주세요.');
    }
  }

  function toDate(value) {
    if (!value) return null;
    const parsed = new Date(String(value).slice(0, 10) + 'T00:00:00');
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function periodStart() {
    const reference = toDate(data.referenceDate);
    const start = new Date(reference);
    if (selectedPeriod === 'day') return start;
    if (selectedPeriod === 'week') {
      start.setDate(start.getDate() - 6);
      return start;
    }
    start.setDate(1);
    return start;
  }

  function inSelectedPeriod(value) {
    const date = toDate(value);
    if (!date) return false;
    const reference = toDate(data.referenceDate);
    return date >= periodStart() && date <= reference;
  }

  function formatPeriodLabel() {
    const reference = toDate(data.referenceDate);
    const start = periodStart();
    const format = date => `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    return selectedPeriod === 'day' ? format(reference) : `${format(start)} ~ ${format(reference)}`;
  }

  function formatCompactDate(value) {
    if (!value) return '-';
    return String(value).replace(/^\d{4}-/, '').replace('-', '.');
  }

  function formatDateOnly(value) {
    if (!value) return '-';
    const datePart = String(value).trim().split(/[ T]/)[0];
    return datePart.replaceAll('-', '.');
  }

  function priorityMarkup(item) {
    const isSupply = item.type === 'supply';
    const detail = isSupply
      ? `권유 · ${item.usage || item.detail} · ${item.percent || ''}`
      : `긴급 · ${item.errorKind || '차량 에러'} · 에러코드 ${item.code || item.errorCode || '-'}`;
    return `<button type="button" class="dashboard-alert ${isSupply ? 'is-supply' : ''}" data-type="${item.type}" data-equipment="${item.equipmentNumber}" data-datetime="${item.datetime || ''}" data-search="${[item.equipmentNumber,item.model,item.company,item.title].join(' ').toLowerCase()}">
      <i data-lucide="${isSupply ? 'refresh-cw' : 'triangle-alert'}" aria-hidden="true"></i>
      <span><strong>${item.equipmentNumber} · ${item.title}</strong><small>${item.company}<br>${detail}</small></span><time>${formatCompactDate(item.datetime)}</time>
    </button>`;
  }

  function renderPriority() {
    const filtered = data.priority.filter(item => inSelectedPeriod(item.datetime));
    const visible = filtered.slice(0, 5);
    $('#priority-list').innerHTML = visible.map(priorityMarkup).join('');
    $('#priority-count').textContent = `${filtered.length}건`;
    $('#empty-state').hidden = visible.length > 0;
    window.lucide?.createIcons({attrs:{'stroke-width':2}});
    $$('.dashboard-alert').forEach(button => button.addEventListener('click', () => {
      const item = (data.service[button.dataset.type] || []).find(row => row.equipmentNumber === button.dataset.equipment && String(row.datetime) === button.dataset.datetime)
        || (data.service[button.dataset.type] || []).find(row => row.equipmentNumber === button.dataset.equipment);
      if (item) openServiceDetail(item, button.dataset.type, 'home');
    }));
  }

  function buildNotificationHistory() {
    const errors = data.service.error.map(item => ({
      ...item,
      type: 'error',
      state: isCurrentError(item) ? 'unresolved' : 'resolved',
      occurredAt: item.datetime
    }));
    const supplies = data.service.supply.map(item => ({ ...item, type: 'supply', state: item.completed ? 'resolved' : 'unresolved', occurredAt: item.exchangeDate || item.datetime }));
    const maintenance = data.service.maintenance.map(item => ({ ...item, type: 'maintenance', state: 'resolved', occurredAt: item.datetime }));
    return [...errors, ...supplies, ...maintenance].sort((a, b) => String(b.occurredAt).localeCompare(String(a.occurredAt)));
  }

  function renderNotificationHistory() {
    const rows = buildNotificationHistory().filter(item => inSelectedPeriod(item.occurredAt) && (notificationState === 'all' || item.state === notificationState));
    $('#notification-history-total').textContent = `${rows.length}건`;
    $('#notification-history-empty').hidden = rows.length > 0;
    $('#notification-history-list').innerHTML = rows.map((item, index) => {
      const resolved = item.state === 'resolved';
      const isSupply = item.type === 'supply';
      const icon = item.type === 'maintenance' ? 'clipboard-check' : isSupply ? 'refresh-cw' : 'triangle-alert';
      const kind = item.type === 'error' ? item.errorKind : isSupply ? '소모품' : '정비';
      return `<button type="button" class="notification-history-item ${isSupply ? 'is-supply' : ''} ${resolved ? 'is-resolved' : ''}" data-history-index="${index}">
        <i data-lucide="${icon}"></i><span class="notification-history-copy"><header><strong>${item.equipmentNumber} · ${item.title}</strong><em class="notification-history-state">${resolved ? '처리완료' : item.type === 'error' ? '긴급' : '권유'}</em></header><p>${item.company}<br>${item.detail}</p><footer><span>${kind}</span><b>${formatCompactDate(item.occurredAt)}</b></footer></span>
      </button>`;
    }).join('');
    window.lucide?.createIcons({attrs:{'stroke-width':2}});
    $$('.notification-history-item').forEach((button, index) => button.addEventListener('click', () => {
      const item = rows[index];
      if (item) openServiceDetail(item, item.type, 'notifications');
    }));
  }

  function vehicleMarkup(item) {
    const attention = item.status === 'attention';
    return `<button type="button" class="vehicle-mobile-row ${attention ? 'is-attention' : 'is-normal'}" data-equipment="${item.equipmentNumber}" data-search="${[item.equipmentNumber,item.model,item.company,item.groupName,item.power].join(' ').toLowerCase()}">
      <div class="vehicle-mobile-row__head"><div><strong>${item.equipmentNumber}</strong><small>${item.model} · ${item.company}</small></div><span class="status-pill ${attention ? 'is-danger' : ''}">${attention ? '확인 필요' : '정상'}</span></div>
      <div class="vehicle-mobile-row__meta"><span>동력<b>${item.power}</b></span><span>연결<b>${item.connection}</b></span><span>이슈<b>${item.issue}</b></span></div>
    </button>`;
  }

  function renderVehicles() {
    const query = $('#vehicle-list-search').value.trim().toLowerCase();
    const rows = data.vehicles.filter(item => {
      const matchFilter = vehicleFilter === 'all' || item.status === vehicleFilter;
      const matchSearch = !query || [item.equipmentNumber,item.model,item.company,item.groupName,item.power].join(' ').toLowerCase().includes(query);
      return matchFilter && matchSearch;
    });
    const attentionCount = data.vehicles.filter(item => item.status === 'attention').length;
    $('#vehicle-mobile-list').innerHTML = rows.map(vehicleMarkup).join('');
    $('#vehicle-total').textContent = `전체 ${data.vehicles.length}대`;
    $('#vehicle-filter-all-count').textContent = data.vehicles.length;
    $('#vehicle-filter-attention-count').textContent = attentionCount;
    $('#vehicle-filter-normal-count').textContent = data.vehicles.length - attentionCount;
    $('#vehicle-empty').hidden = rows.length > 0;
    $$('.vehicle-mobile-row').forEach(button => button.addEventListener('click', () => {
      const item = data.vehicles.find(row => row.equipmentNumber === button.dataset.equipment);
      if (item) openVehicleDetail(item, 'vehicles');
    }));
  }

  function serviceMarkup(item, type, index) {
    const kind = type === 'error' ? item.errorKind : type === 'supply' ? '소모품' : '정비';
    const kindClass = item.errorKind === '배터리 에러' ? 'is-battery' : type === 'supply' ? 'is-advisory' : '';
    const pdfButton = type === 'error' && manualPathForError(item)
      ? `<button class="inline-pdf-button" type="button" data-error-pdf="${index}" aria-label="에러코드 ${item.errorCode || '-'} PDF 내려받기"><i data-lucide="file-down"></i><span>PDF</span></button>`
      : '';
    const editLabel = type === 'supply' ? `<em class="service-mobile-row__edit"><i data-lucide="pen-line"></i>수정</em>` : '';
    const displayDate = type === 'supply' ? formatDateOnly(item.registeredAt) : formatCompactDate(item.datetime);
    return `<article class="service-mobile-row is-${type}" role="button" tabindex="0" data-open-service="${index}"><div class="service-mobile-row__head"><div><strong>${item.equipmentNumber}</strong><small>${item.model} · ${item.company}</small></div><div class="service-mobile-row__badges"><span class="service-kind-pill ${kindClass}">${kind}</span><span class="status-pill ${type === 'error' && isCurrentError(item) ? 'is-danger' : ''}">${item.status}</span></div></div><p>${item.title}</p><div class="service-mobile-row__meta"><span>${item.detail}${pdfButton}</span><span class="service-mobile-row__tail"><b>${displayDate}</b>${editLabel}</span></div></article>`;
  }

  function renderService(type = serviceTab) {
    serviceTab = ['vehicleError', 'batteryError', 'maintenance'].includes(type) ? type : 'vehicleError';
    const query = $('#maintenance-list-search').value.trim().toLowerCase();
    const sourceType = serviceTab === 'maintenance' ? 'maintenance' : 'error';
    const source = sourceType === 'maintenance'
      ? data.service.maintenance
      : data.service.error.filter(item => serviceTab === 'batteryError' ? item.errorKind === '배터리 에러' : item.errorKind !== '배터리 에러');
    const rows = source.filter(item => !query || [item.equipmentNumber,item.model,item.company,item.title,item.detail,item.errorKind].join(' ').toLowerCase().includes(query));
    $('#maintenance-mobile-list').innerHTML = rows.map((item, index) => serviceMarkup(item, sourceType, index)).join('');
    $('#maintenance-list-total').textContent = `표시 ${rows.length}건`;
    $('#maintenance-empty').hidden = rows.length > 0;
    $$('[data-service-type]').forEach(button => {
      const selected = button.dataset.serviceType === serviceTab;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-selected', String(selected));
    });
    $$('#maintenance-mobile-list [data-open-service]').forEach((button, index) => button.addEventListener('click', () => {
      const item = rows[index];
      if (item) openServiceDetail(item, sourceType, 'maintenance');
    }));
    bindPdfButtons(rows);
    window.lucide?.createIcons({attrs:{'stroke-width':2}});
  }

  function renderSupplies() {
    const query = $('#supply-list-search').value.trim().toLowerCase();
    const rows = data.service.supply.filter(item => isSupplyActionable(item) && (!query || [item.equipmentNumber,item.model,item.company,item.title,item.detail].join(' ').toLowerCase().includes(query)));
    $('#supply-mobile-list').innerHTML = rows.map((item, index) => serviceMarkup(item, 'supply', index)).join('');
    $('#supply-list-total').textContent = `표시 ${rows.length}건`;
    $('#supply-empty').hidden = rows.length > 0;
    $$('#supply-mobile-list [data-open-service]').forEach((button, index) => button.addEventListener('click', () => {
      const item = rows[index];
      if (item) openServiceDetail(item, 'supply', 'supplies');
    }));
    window.lucide?.createIcons({attrs:{'stroke-width':2}});
  }

  function showView(name, origin) {
    const current = $('[data-view-panel].is-active')?.dataset.viewPanel || 'home';
    if (origin) previousView = origin;
    else if (name !== current && !['home','vehicles','maintenance','supplies','settings'].includes(name)) previousView = current;
    $$('[data-view-panel]').forEach(panel => panel.classList.toggle('is-active', panel.dataset.viewPanel === name));
    $$('.bottom-nav [data-nav]').forEach(button => button.classList.toggle('is-active', button.dataset.nav === name));
    const home = name === 'home';
    $('[data-header-brand]').hidden = !home;
    $('[data-header-title]').hidden = home;
    $('.header-back').hidden = home;
    const titles = { vehicles:'차량', 'vehicle-detail':'차량 상세', maintenance:'에러', supplies:'소모품', 'service-detail':'상세 정보', notifications:'알림 내역', settings:'설정' };
    $('[data-header-title]').textContent = titles[name] || '';
    if (name === 'notifications') renderNotificationHistory();
    if (name === 'home') animateDashboardSummaryFromStoredValues();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function serviceRecordsFor(equipmentNumber) {
    return Object.entries(data.service).flatMap(([type, items]) => items.filter(item => item.equipmentNumber === equipmentNumber).map(item => ({...item, type})));
  }

  function openLocationDialog(item) {
    if (!Number.isFinite(item.latitude) || !Number.isFinite(item.longitude)) {
      showToast('저장된 위치 좌표가 없습니다.');
      return;
    }
    const latitude = item.latitude;
    const longitude = item.longitude;
    const bbox = [longitude - 0.006, latitude - 0.004, longitude + 0.006, latitude + 0.004].join(',');
    $('#location-dialog-title').textContent = item.equipmentNumber;
    $('#location-dialog-address').textContent = displayValue(item.lastAddress);
    $('#location-dialog-coordinate').textContent = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    $('#location-map').src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${latitude}%2C${longitude}`;
    $('#location-map-link').href = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
    $('#location-dialog').showModal();
  }

  function openVehicleDetail(item, origin = 'vehicles') {
    const attention = item.status === 'attention';
    const records = serviceRecordsFor(item.equipmentNumber);
    const vehicleErrorCount = item.vehicleErrorCount || 0;
    const batteryErrorCount = item.batteryErrorCount || 0;
    const maintenanceCount = records.filter(record => record.type === 'maintenance').length;
    const firstVehicleError = records.find(record => record.type === 'error' && record.errorKind !== '배터리 에러');
    const firstBatteryError = records.find(record => record.type === 'error' && record.errorKind === '배터리 에러');
    const firstSupply = records.find(record => record.type === 'supply');
    const firstMaintenance = records.find(record => record.type === 'maintenance');
    const categoryCount = [vehicleErrorCount, batteryErrorCount, item.supplyCount || 0, maintenanceCount].filter(Boolean).length;
    const hasLocation = Number.isFinite(item.latitude) && Number.isFinite(item.longitude);
    const locationMarkup = hasLocation
      ? `<dd><button class="vehicle-location-button" type="button"><span>${displayValue(item.lastAddress)}</span><i data-lucide="map-pin"></i></button></dd>`
      : `<dd>${displayValue(item.lastAddress)}</dd>`;
    $('#vehicle-detail-model').textContent = displayValue(item.model);
    $('#vehicle-detail-title').textContent = displayValue(item.equipmentNumber);
    $('#vehicle-detail-company').textContent = displayValue(item.company);
    $('#vehicle-detail-status').textContent = attention ? '확인 필요' : '정상';
    $('#vehicle-detail-status').classList.toggle('is-danger', attention);
    $('#vehicle-detail-info').innerHTML = `<div><dt>동력 유형</dt><dd>${displayValue(item.power)}</dd></div><div><dt>소속 그룹</dt><dd>${displayValue(item.groupName)}</dd></div><div><dt>연결 상태</dt><dd>${displayValue(item.connection)}</dd></div><div><dt>최종 통신일시</dt><dd>${displayValue(item.lastDatetime)}</dd></div><div><dt>기간 이동거리</dt><dd>${displayValue(item.distance)}</dd></div><div><dt>기간 가동시간</dt><dd>${displayValue(item.operatingTime)}</dd></div><div><dt>차량 에러</dt><dd>${item.vehicleErrorCount || 0}건</dd></div><div><dt>배터리 에러</dt><dd>${item.batteryErrorCount || 0}건</dd></div><div><dt>소모품</dt><dd>${item.supplyCount || 0}건</dd></div><div><dt>현재 상태</dt><dd>${displayValue(item.issue, '정상')}</dd></div><div class="is-wide"><dt>최종 위치</dt>${locationMarkup}</div>`;
    $('.vehicle-location-button')?.addEventListener('click', () => openLocationDialog(item));
    $('#vehicle-service-total').textContent = categoryCount ? `${categoryCount}개 항목` : '정상';
    $('#vehicle-service-empty').hidden = categoryCount > 0;
    const serviceLinks = [];
    if (vehicleErrorCount) serviceLinks.push(`<button type="button" data-vehicle-section="vehicleError"><span><strong>차량 에러 ${vehicleErrorCount}건</strong><small>${displayValue(firstVehicleError?.title, '현재 차량 에러 정보')}</small></span><i data-lucide="chevron-right"></i></button>`);
    if (batteryErrorCount) serviceLinks.push(`<button type="button" data-vehicle-section="batteryError"><span><strong>배터리 에러 ${batteryErrorCount}건</strong><small>${displayValue(firstBatteryError?.title, '현재 배터리 에러 정보')}</small></span><i data-lucide="chevron-right"></i></button>`);
    if (item.supplyCount) serviceLinks.push(`<button type="button" data-vehicle-section="supply"><span><strong>소모품 ${item.supplyCount}건</strong><small>${displayValue(firstSupply?.title, '교체 기준 도달·초과 항목')}</small></span><i data-lucide="chevron-right"></i></button>`);
    if (maintenanceCount) serviceLinks.push(`<button type="button" data-vehicle-section="maintenance"><span><strong>정비 이력 ${maintenanceCount}건</strong><small>${displayValue(firstMaintenance?.title, '접수·완료된 정비 내역')}</small></span><i data-lucide="chevron-right"></i></button>`);
    $('#vehicle-service-list').innerHTML = serviceLinks.join('');
    $$('[data-vehicle-section]').forEach(button => button.addEventListener('click', () => {
      const section = button.dataset.vehicleSection;
      if (section === 'supply') {
        $('#supply-list-search').value = item.equipmentNumber;
        showView('supplies');
        renderSupplies();
        return;
      }
      $('#maintenance-list-search').value = item.equipmentNumber;
      showView('maintenance');
      renderService(section);
    }));
    window.lucide?.createIcons({attrs:{'stroke-width':2}});
    showView('vehicle-detail', origin);
  }

  function openErrorGuide(item, origin = 'maintenance') {
    selectedServiceItem = {item, type: 'error', origin};
    const typeName = item.errorKind || '차량 에러';
    $('#error-guide-kind').textContent = `${typeName} · 에러코드 안내`;
    $('#error-guide-title').textContent = item.title;
    $('#error-guide-equipment').textContent = `${item.equipmentNumber} · ${item.model}`;
    $('#error-guide-company').textContent = item.company;
    $('#error-guide-info').innerHTML = `<div><dt>에러코드</dt><dd>${item.errorCode || '-'}</dd></div><div><dt>처리 상태</dt><dd>${item.status || '-'}</dd></div><div><dt>발생 일시</dt><dd>${item.datetime || '-'}</dd></div><div><dt>완료 일시</dt><dd>${item.resolvedAt || '-'}</dd></div>`;
    $('#error-guide-copy').textContent = item.errorSolution || item.resolveMethod || '등록된 별도 조치 안내가 없습니다. 에러코드와 현상을 확인한 뒤 공식 정비 절차에 따라 점검해 주세요.';
    const pdfLink = $('#error-guide-pdf');
    const manualUrl = manualPathForError(item);
    pdfLink.hidden = !manualUrl;
    pdfLink.href = manualUrl || '#';
    if (manualUrl) pdfLink.setAttribute('download', manualUrl.split('/').pop());
    window.lucide?.createIcons({attrs:{'stroke-width':2}});
    $('#error-guide-dialog').showModal();
  }

  function openSupplyEdit(item) {
    selectedServiceItem = {item, type: 'supply', origin: 'supplies'};
    $('#supply-edit-name').textContent = item.title;
    $('#supply-edit-equipment').textContent = `${item.equipmentNumber} · ${item.model} · ${item.usage || '-'} / 기준 ${item.cycle || '-'}`;
    $('#supply-edit-completed').checked = Boolean(item.completed);
    $('#supply-edit-date').value = item.exchangeDate || data.referenceDate;
    $('#supply-edit-note').value = item.actionNote || '';
    $('#supply-edit-dialog').showModal();
  }

  function openServiceDetail(item, type, origin = 'maintenance') {
    if (type === 'error') {
      openErrorGuide(item, origin);
      return;
    }
    if (type === 'supply') {
      openSupplyEdit(item);
      return;
    }
    selectedServiceItem = {item, type};
    const typeName = type === 'error' ? item.errorKind || '차량 에러' : type === 'supply' ? '소모품' : '정비 이력';
    const iconName = type === 'error' ? 'triangle-alert' : type === 'supply' ? 'refresh-cw' : 'clipboard-check';
    $('#service-detail-icon').className = `detail-icon is-${type}`;
    $('#service-detail-icon').innerHTML = `<i data-lucide="${iconName}"></i>`;
    $('#service-detail-type').textContent = typeName;
    $('#service-detail-title').textContent = item.title;
    $('#service-detail-equipment').textContent = `${item.equipmentNumber} · ${item.model}`;
    $('#service-detail-status').textContent = item.status;
    $('#service-detail-status').classList.toggle('is-danger', type === 'error' && isCurrentError(item));
    const common = `<div><dt>호기</dt><dd>${displayValue(item.equipmentNumber)}</dd></div><div><dt>기종</dt><dd>${displayValue(item.model)}</dd></div><div><dt>고객사</dt><dd>${displayValue(item.company)}</dd></div><div><dt>소속 그룹</dt><dd>${displayValue(item.groupName, '기본그룹')}</dd></div>`;
    let specific = '';
    if (type === 'error') {
      specific = `<div><dt>에러 구분</dt><dd>${typeName}</dd></div><div><dt>에러코드</dt><dd>${item.errorCode || '-'}</dd></div><div><dt>발생 일시</dt><dd>${item.datetime || '-'}</dd></div><div><dt>처리 상태</dt><dd>${item.status}</dd></div>`;
    } else if (type === 'supply') {
      specific = `<div><dt>현재 사용량</dt><dd>${item.usage || '-'}</dd></div><div><dt>교체 기준</dt><dd>${item.cycle || '-'}</dd></div><div><dt>기준 대비</dt><dd>${item.percent || '-'}</dd></div><div><dt>등록 일시</dt><dd>${item.registeredAt || '-'}</dd></div>`;
    } else {
      specific = `<div><dt>정비 일시</dt><dd>${item.datetime || '-'}</dd></div><div><dt>완료 상태</dt><dd>${item.status}</dd></div>`;
    }
    $('#service-detail-info').innerHTML = `${common}${specific}<div class="is-wide"><dt>상세 내용</dt><dd>${item.detail}</dd></div>`;
    window.lucide?.createIcons({attrs:{'stroke-width':2}});
    showView('service-detail', origin);
  }

  function updatePeriod() {
    $$('[data-period]').forEach(button => button.classList.toggle('is-active', button.dataset.period === selectedPeriod));
    $('#period-label').textContent = formatPeriodLabel();
    renderPriority();
    renderNotificationHistory();
  }

  function applyDashboardSummaryFrame(progress, values) {
    const eased = 1 - Math.pow(1 - progress, 3);
    const donut = $('#service-donut');
    donut.style.setProperty('--error-share', `${values.errorShare * eased}%`);
    donut.style.setProperty('--total-share', `${values.actionTotal ? 100 * eased : 0}%`);
    $('#service-donut-total').textContent = Math.round(values.actionTotal * eased);
    $('#legend-error-total').textContent = Math.round(values.errorTotal * eased);
    $('#legend-supply-total').textContent = Math.round(values.supplyTotal * eased);
  }

  function animateDashboardSummary(values) {
    cancelAnimationFrame(dashboardSummaryAnimationFrame);
    const donut = $('#service-donut');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    donut.classList.toggle('is-empty', values.actionTotal === 0);
    donut.classList.remove('is-animating');

    if (reduceMotion || values.actionTotal === 0) {
      applyDashboardSummaryFrame(1, values);
      return;
    }

    donut.classList.add('is-animating');
    applyDashboardSummaryFrame(0, values);
    const startedAt = performance.now();
    const duration = 800;

    const draw = now => {
      const progress = Math.min((now - startedAt) / duration, 1);
      applyDashboardSummaryFrame(progress, values);
      if (progress < 1) dashboardSummaryAnimationFrame = requestAnimationFrame(draw);
      else donut.classList.remove('is-animating');
    };
    dashboardSummaryAnimationFrame = requestAnimationFrame(draw);
  }

  function animateDashboardSummaryFromStoredValues() {
    const donut = $('#service-donut');
    if (!donut.dataset.actionTotal) return;
    animateDashboardSummary({
      actionTotal: Number(donut.dataset.actionTotal),
      errorTotal: Number(donut.dataset.errorTotal),
      supplyTotal: Number(donut.dataset.supplyTotal),
      errorShare: Number(donut.dataset.errorShare)
    });
  }

  function updateSummaryCounts() {
    const vehicleErrorTotal = data.service.error.filter(item => item.errorKind !== '배터리 에러').length;
    const batteryErrorTotal = data.service.error.filter(item => item.errorKind === '배터리 에러').length;
    const errorTotal = vehicleErrorTotal + batteryErrorTotal;
    const supplyTotal = data.service.supply.filter(isSupplyActionable).length;
    const maintenanceTotal = data.service.maintenance.length;
    const activeUrgent = data.service.error.filter(isCurrentError).length;
    const actionTotal = activeUrgent + supplyTotal;
    const vehicleTotal = data.vehicles.length;
    const attentionVehicleTotal = data.vehicles.filter(item => item.status === 'attention').length;
    $('#notification-count').textContent = activeUrgent;
    $('#error-total').textContent = errorTotal;
    $('#schedule-total').textContent = supplyTotal;
    $('#maintenance-total').textContent = maintenanceTotal;
    $('#service-total').textContent = `미처리 ${actionTotal}건`;
    const donut = $('#service-donut');
    const summaryValues = {
      actionTotal,
      errorTotal,
      supplyTotal,
      errorShare: actionTotal ? (activeUrgent / actionTotal) * 100 : 0
    };
    donut.dataset.actionTotal = actionTotal;
    donut.dataset.errorTotal = errorTotal;
    donut.dataset.supplyTotal = supplyTotal;
    donut.dataset.errorShare = summaryValues.errorShare;
    if ($('[data-view-panel="home"]').classList.contains('is-active')) animateDashboardSummary(summaryValues);
    else applyDashboardSummaryFrame(1, summaryValues);
    $('#home-vehicle-total').textContent = vehicleTotal;
    $('#home-vehicle-normal').textContent = vehicleTotal - attentionVehicleTotal;
    $('#home-vehicle-attention').textContent = attentionVehicleTotal;
    $('#service-vehicle-error-count').textContent = vehicleErrorTotal;
    $('#service-battery-error-count').textContent = batteryErrorTotal;
    $('#service-maintenance-count').textContent = maintenanceTotal;
  }

  async function init() {
    await hydrateCapturedData();
    applySupplyOverrides();
    refreshSupplyDerivedState();
    $('#account-id').textContent = data.account.id;
    updateSummaryCounts();
    renderVehicles();
    renderService();
    renderSupplies();
    updatePeriod();

    $$('[data-period]').forEach(button => button.addEventListener('click', () => {
      selectedPeriod = button.dataset.period;
      updatePeriod();
    }));
    $$('[data-notification-state]').forEach(button => button.addEventListener('click', () => {
      notificationState = button.dataset.notificationState;
      $$('[data-notification-state]').forEach(item => item.classList.toggle('is-active', item === button));
      renderNotificationHistory();
    }));
    $$('[data-filter]').forEach(button => button.addEventListener('click', () => {
      if (button.dataset.filter === 'supply') {
        showView('supplies');
        renderSupplies();
      } else {
        showView('maintenance');
        renderService(button.dataset.filter);
      }
    }));
    $('#vehicle-list-search').addEventListener('input', renderVehicles);
    $('#maintenance-list-search').addEventListener('input', () => renderService());
    $('#supply-list-search').addEventListener('input', renderSupplies);
    $$('[data-vehicle-filter]').forEach(button => button.addEventListener('click', () => {
      vehicleFilter = button.dataset.vehicleFilter;
      $$('[data-vehicle-filter]').forEach(item => item.classList.toggle('is-active', item === button));
      renderVehicles();
    }));
    $$('[data-service-type]').forEach(button => button.addEventListener('click', () => renderService(button.dataset.serviceType)));
    $$('[data-nav]').forEach(button => button.addEventListener('click', () => showView(button.dataset.nav)));
    $('[data-back]').addEventListener('click', () => showView(previousView));
    $('#service-detail-list').addEventListener('click', () => showView(previousView));
    $('#service-detail-vehicle').addEventListener('click', () => {
      if (!selectedServiceItem) return;
      const vehicle = data.vehicles.find(item => item.equipmentNumber === selectedServiceItem.item.equipmentNumber);
      if (vehicle) openVehicleDetail(vehicle, 'service-detail');
      else showToast('차량 목록에 등록된 호기가 아닙니다.');
    });
    $('#location-dialog-close').addEventListener('click', () => $('#location-dialog').close());
    $('#location-dialog').addEventListener('click', event => {
      if (event.target === $('#location-dialog')) $('#location-dialog').close();
    });
    $('#error-guide-close').addEventListener('click', () => $('#error-guide-dialog').close());
    $('#error-guide-list').addEventListener('click', () => $('#error-guide-dialog').close());
    $('#error-guide-vehicle').addEventListener('click', () => {
      if (!selectedServiceItem) return;
      const vehicle = data.vehicles.find(item => item.equipmentNumber === selectedServiceItem.item.equipmentNumber);
      $('#error-guide-dialog').close();
      if (vehicle) openVehicleDetail(vehicle, selectedServiceItem.origin || 'maintenance');
      else showToast('차량 목록에 등록된 호기가 아닙니다.');
    });
    $('#error-guide-dialog').addEventListener('click', event => {
      if (event.target === $('#error-guide-dialog')) $('#error-guide-dialog').close();
    });
    $('#supply-edit-close').addEventListener('click', () => $('#supply-edit-dialog').close());
    $('#supply-edit-cancel').addEventListener('click', () => $('#supply-edit-dialog').close());
    $('#supply-edit-dialog').addEventListener('click', event => {
      if (event.target === $('#supply-edit-dialog')) $('#supply-edit-dialog').close();
    });
    $('#supply-edit-form').addEventListener('submit', event => {
      event.preventDefault();
      if (!selectedServiceItem || selectedServiceItem.type !== 'supply') return;
      const item = selectedServiceItem.item;
      item.completed = $('#supply-edit-completed').checked;
      item.exchangeDate = $('#supply-edit-date').value;
      item.actionNote = $('#supply-edit-note').value.trim();
      if (item.completed) {
        item.usage = '0H';
        item.percent = '0%';
        item.status = '교체 완료';
      }
      persistSupplyOverride(item);
      refreshSupplyDerivedState();
      updateSummaryCounts();
      renderVehicles();
      renderSupplies();
      updatePeriod();
      $('#supply-edit-dialog').close();
      showToast(item.completed ? '교환 완료로 처리하고 사용량을 초기화했습니다.' : '소모품 수정 내용을 저장했습니다.');
    });
    $$('[data-open-notifications], [data-open-notifications-page]').forEach(button => button.addEventListener('click', () => showView('notifications', 'home')));
    $$('[data-open-vehicles]').forEach(button => button.addEventListener('click', () => showView('vehicles', 'home')));

    const savedSettings = JSON.parse(localStorage.getItem('linqDealerMobileSettings') || '{}');
    $$('[data-setting]').forEach(input => {
      if (Object.hasOwn(savedSettings, input.dataset.setting)) input.checked = savedSettings[input.dataset.setting];
      input.addEventListener('change', () => {
        const settings = {};
        $$('[data-setting]').forEach(item => { settings[item.dataset.setting] = item.checked; });
        localStorage.setItem('linqDealerMobileSettings', JSON.stringify(settings));
        showToast(input.dataset.setting === 'supplies' ? `소모품 푸시를 ${input.checked ? '받습니다.' : '받지 않습니다.'}` : '알림 설정을 저장했습니다.');
      });
    });
    $('#language').addEventListener('change', event => showToast(event.target.value === 'ko' ? '한국어로 설정했습니다.' : 'English 화면은 다국어 연결 시 적용됩니다.'));
    $('#logout').addEventListener('click', () => { window.location.href = './login.html'; });
    window.lucide?.createIcons({attrs:{'stroke-width':2}});
  }

  init();
})();
