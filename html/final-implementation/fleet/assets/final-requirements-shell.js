(() => {
  const initialUrl = new URL(location.href);
  const service = location.pathname.includes('/dealer/') ? 'dealer' : 'fleet';
  if (initialUrl.searchParams.get('layout') !== 'prototype3' && window.LINQ_FINAL_IMPLEMENTATION !== true) return;
  // The reviewed service-count LNB is the final Fleet navigation, not a URL-only variant.
  const serviceLnbCountVariant = service === 'fleet';
  const serviceMenuCounts = { maintenance: null, supplies: null, error: null };

  let refreshQueued = false;
  let equipmentRecords = [];
  let equipmentPromise = null;
  const text = node => node?.textContent?.trim() || '';
  const normalizeVehicleId = value => String(value || '').toLowerCase().replace(/[-_\s]/g, '');
  const companyRecords = [
    {id:'all', name:'전체차량'},
    {id:'1933', name:'(주)세종물류중부지점'},
    {id:'20119', name:'김현종'},
    {id:'167', name:'두산물류 주식회사'},
    {id:'34317', name:'두산밥캣코리아 주식회사'},
    {id:'15857', name:'두산지게차 경남중부영업소'},
    {id:'33767', name:'두산지게차 경남중부판매 주식회사'},
    {id:'11214', name:'두산지게차 마창영업소'},
    {id:'6057', name:'에스엔케이중공업'},
    {id:'364', name:'온양지게차(호성건설중기)'},
    {id:'12894', name:'중원건기'},
    {id:'20289', name:'창녕지게차'},
    {id:'20106', name:'창원중기'},
    {id:'20120', name:'최재민'},
    {id:'3703', name:'태형금속공업(주)'},
    {id:'7690', name:'팔팔지게차서비스'},
    {id:'8246', name:'한일중기(주)'},
  ];
  const modelForVehicle = value => {
    const id = String(value || '').toUpperCase();
    if (id.startsWith('FBA32')) return 'B30S-7';
    if (id.startsWith('FBA34')) return 'B35S-7';
    if (id.startsWith('FHA30')) return 'B30X-7 H2';
    if (id.startsWith('FDB19')) return 'D50S-9';
    if (id.startsWith('FDB21')) return 'D70S-9';
    return '';
  };

  const decorateUrl = value => {
    if (!value) return value;
    try {
      const next = new URL(value, location.href);
      if (next.origin !== location.origin || !next.pathname.startsWith(`/${service}/`)) return value;
      if (window.LINQ_FINAL_IMPLEMENTATION === true) next.searchParams.delete('layout');
      else next.searchParams.set('layout', 'prototype3');
      return `${next.pathname}${next.search}${next.hash}`;
    } catch (_error) {
      return value;
    }
  };

  const pushState = history.pushState.bind(history);
  const replaceState = history.replaceState.bind(history);
  history.pushState = (state, title, url) => pushState(state, title, decorateUrl(url));
  history.replaceState = (state, title, url) => replaceState(state, title, decorateUrl(url));

  function queueRefresh() {
    if (refreshQueued) return;
    refreshQueued = true;
    requestAnimationFrame(() => {
      refreshQueued = false;
      refreshShell();
    });
  }

  function sourceSide() {
    return [...document.querySelectorAll('.page-body .local > .local-side')]
      .find(node => !node.classList.contains('requirements-prototype-side')) || null;
  }

  function sourceSideSection(side, label) {
    return [...(side?.querySelectorAll('.side-wrap') || [])]
      .find(section => text(section.querySelector('.side-wrap__title')).replace(/\s/g, '') === label.replace(/\s/g, '')) || null;
  }

  function sourceVehicles(side) {
    const section = sourceSideSection(side, '\ucc28\ub7c9');
    return [...(section?.querySelectorAll('.side-item') || [])].map(button => {
      const label = text(button.querySelector('em'));
      const id = label.replace(/^\([^)]*\)\s*/, '');
      return { id, label, button, active: button.classList.contains('active') };
    }).filter(item => item.id && !/^equipments?$/i.test(item.id));
  }

  function currentCompanyName(side) {
    return text(side?.querySelector('.page-side__title')) || '(\uc8fc)\uc138\uc885\ubb3c\ub958\uc911\ubd80\uc9c0\uc810';
  }

  async function loadEquipment() {
    if (equipmentRecords.length) return equipmentRecords;
    if (!equipmentPromise) {
      equipmentPromise = fetch('/api/fleet/admin/all-equipments')
        .then(response => response.ok ? response.json() : [])
        .then(payload => {
          const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.result) ? payload.result : [];
          equipmentRecords = rows.map(item => ({
            id: item.equipmentId || item.equipmentNumber || '',
            equipmentNumber: item.equipmentNumber || '',
            model: item.modelName || item.model || modelForVehicle(item.equipmentId || item.equipmentNumber),
            power: item.fuelTypeName || item.fuelType || '',
            companyId: String(item.companyId || '1933'),
            company: item.companyName || item.groupName || '(주)세종물류중부지점',
          })).filter(item => item.id);
          return equipmentRecords;
        }).catch(() => []);
    }
    return equipmentPromise;
  }

  function setSelectOptions(select, rows, placeholder) {
    const previous = select.value;
    select.replaceChildren();
    if (placeholder) select.add(new Option(placeholder, ''));
    rows.forEach(row => select.add(new Option(row.label, row.value, false, row.selected)));
    if (previous && [...select.options].some(option => option.value === previous)) select.value = previous;
  }

  function currentEquipmentId() {
    const parts = location.pathname.split('/').filter(Boolean);
    const equipIndex = parts.lastIndexOf('equip');
    if (equipIndex < 0 || parts.length - equipIndex < 4) return '';
    // `/page/equip/list/...` and `/page/equip/detail/...` also contain the
    // top-level menu segment `equip`. Only the scope segment followed by
    // company/group/equipment ids represents a selected vehicle.
    if (['list', 'detail'].includes(parts[equipIndex + 1])) return '';
    return decodeURIComponent(parts.at(-1));
  }

  function removeDuplicateVehicleCards() {
    const routeVehicleId = currentEquipmentId();
    if (!routeVehicleId) return;
    const seen = new Set();
    document.querySelectorAll('.goods-summary').forEach(card => {
      const title = text(card.querySelector('.goods-summary__simple em')) || text(card).split('\n')[0];
      const key = normalizeVehicleId(title || routeVehicleId);
      if (!seen.has(key)) {
        seen.add(key);
        return;
      }
      card.closest('.content-section')?.remove();
    });
  }

  function option3FuelMeta(value) {
    const label = String(value || '').trim();
    const common = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
    if (label.includes('\ub9ac\ud2ac')) return {key:'lithium', label:'\ub9ac\ud2ac', icon:`<svg ${common}><rect x="4" y="6" width="15" height="12" rx="2"/><path d="M19 10h2v4h-2M11 8.5 8.5 13H12l-1 3 4-5h-3z"/></svg>`};
    if (label.includes('\ub0a9\ucd95')) return {key:'lead', label:'\ub0a9\ucd95', icon:`<svg ${common}><path d="M6 6V4h3v2m6 0V4h3v2"/><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M6 10h4m-2-2v4m7-2h3m-12 5c2-1 4 1 6 0s4 1 6 0"/></svg>`};
    if (label.includes('\uc218\uc18c')) return {key:'hydrogen', label:'\uc218\uc18c', icon:`<svg ${common}><path d="M8 4h8v2h2v13H6V6h2z"/><path d="M10 4V2h4v2m-5 7h6m-6 4h6"/><circle cx="10" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="14" cy="15" r="1" fill="currentColor" stroke="none"/></svg>`};
    return {key:'engine', label:label || '\uc5d4\uc9c4', icon:`<svg ${common}><path d="M5 9h2l2-3h6l2 3h2v8H5z"/><path d="M3 11h2m14 1h2m-14 5v2m10-2v2M10 9h4m-5 4h6"/></svg>`};
  }

  function option3PeriodBasis() {
    const selected = document.querySelector('input[name="dataPeriod"]:checked, input[type="radio"]:checked');
    const value = selected?.value || '';
    if (value === 'daily') return '일 기준';
    if (value === 'weekly') return '주 기준';
    if (value === 'custom') return '설정 기간 기준';
    return '월 기준';
  }

  function configureCompactPeriodHelp() {
    const customInput = document.querySelector('input[name="dataPeriod"][value="custom"]');
    const customControl = customInput?.closest('label, button');
    if (!customControl) return;
    const helpText = '시작일과 종료일을 직접 선택합니다. 서버에서 허용하는 최대 조회 범위는 확인이 필요합니다.';
    customControl.classList.add('linq-review-period-info');
    customControl.setAttribute('title', helpText);
    customControl.setAttribute('aria-description', helpText);
    document.querySelectorAll('.linq-review-period-help').forEach(node => node.remove());
  }

  function compactOperationSummaryCards() {
    if (!location.pathname.includes('/anlz/summary/')) return;
    const cards = [...document.querySelectorAll('.content-body > .content-section .goods-summary')];
    if (!cards.length) return;
    document.body.classList.add('requirements-prototype-option3-summary');
    const fuelTypes = new Map();
    const periodBasis = option3PeriodBasis();
    cards.forEach(card => {
      const details = [...card.querySelectorAll('.goods-summary__detail-item')];
      const detailValue = label => text(details.find(item => text(item.querySelector('span')).replace(/\s/g, '') === label.replace(/\s/g, ''))?.querySelector('em'));
      const category = detailValue('\ubd84\ub958');
      const fuel = option3FuelMeta(category);
      fuelTypes.set(fuel.key, fuel);
      card.classList.add('requirements-option3-actual-card', `is-${fuel.key}`);
      card.closest('.content-section')?.classList.add('requirements-option3-actual-section');
      card.querySelectorAll('.requirements-option3-period-basis').forEach(node => { node.textContent = periodBasis; });
      if (card.dataset.option3Applied === 'true') return;
      card.dataset.option3Applied = 'true';

      const simple = card.querySelector('.goods-summary__simple');
      const title = simple?.querySelector('em');
      const rawTitle = text(title);
      const titleMatch = rawTitle.match(/^(.+?)\s*\(([^)]+)\)$/);
      const model = titleMatch?.[1]?.trim() || detailValue('\ubaa8\ub378\uba85');
      const equipmentId = titleMatch?.[2]?.trim() || rawTitle;
      if (simple && title) {
        title.textContent = equipmentId;
        const identity = document.createElement('div');
        identity.className = 'requirements-option3-card-identity';
        const modelNode = document.createElement('span');
        modelNode.textContent = model;
        const badge = document.createElement('b');
        badge.className = `requirements-option3-fuel-badge is-${fuel.key}`;
        badge.innerHTML = `${fuel.icon}<span>${fuel.label}</span>`;
        identity.append(title, modelNode, badge);
        simple.replaceChildren(identity);
        const locationAction = card.querySelector('.goods-summary__location');
        if (locationAction) simple.append(locationAction);
      }

      const icon = document.createElement('div');
      icon.className = `requirements-option3-card-icon is-${fuel.key}`;
      icon.innerHTML = fuel.icon;
      card.insertBefore(icon, card.querySelector('.goods-summary__data'));
      details.forEach(item => {
        const label = text(item.querySelector('span')).replace(/\s/g, '');
        if (!['\uc6b4\uc601\ub960', '\uc6b4\uc601\ud6a8\uc728', '\ucda9\uaca9\ud69f\uc218', '\uac70\ub9ac', '\uc2dc\uac04', '\ud3c9\uade0\uc5f0\ub8cc\uc18c\ube44\ub7c9', '\ud3c9\uade0\ubc30\ud130\ub9ac\uc18c\ube44\ub7c9'].includes(label)) return;
        const labelNode = item.querySelector('span');
        if (!labelNode || labelNode.querySelector('.requirements-option3-period-basis')) return;
        const basis = document.createElement('small');
        basis.className = 'requirements-option3-period-basis';
        basis.textContent = periodBasis;
        labelNode.append(basis);
      });
    });

    document.querySelectorAll('input[name="dataPeriod"], input[type="radio"][value="daily"], input[type="radio"][value="weekly"], input[type="radio"][value="monthly"], input[type="radio"][value="custom"]').forEach(input => {
      if (input.dataset.option3PeriodBound === 'true') return;
      input.dataset.option3PeriodBound = 'true';
      input.addEventListener('change', queueRefresh);
    });

    const content = cards[0].closest('.content-body');
    const firstSection = cards[0].closest('.content-section');
    if (!content || !firstSection) return;
    let listHead = content.querySelector('.requirements-option3-list-head');
    if (!listHead) {
      listHead = document.createElement('div');
      listHead.className = 'requirements-option3-list-head';
      firstSection.insertAdjacentElement('beforebegin', listHead);
    }
    listHead.innerHTML = `<strong>\ucc28\ub7c9 \uc0c1\uc138 ${cards.length}\ub300</strong><div class="requirements-option3-fuel-legend" aria-label="\ub3d9\ub825 \uc720\ud615"></div>`;
    const legend = listHead.querySelector('.requirements-option3-fuel-legend');
    const allFuelTypes = {
      engine: option3FuelMeta('\uc5d4\uc9c4'),
      lithium: option3FuelMeta('\ub9ac\ud2ac'),
      lead: option3FuelMeta('\ub0a9\ucd95'),
      hydrogen: option3FuelMeta('\uc218\uc18c')
    };
    ['engine', 'lithium', 'lead', 'hydrogen'].forEach(key => {
      const fuel = fuelTypes.get(key) || allFuelTypes[key];
      const item = document.createElement('span');
      item.innerHTML = `<i class="is-${fuel.key}">${fuel.icon}</i>${fuel.label}`;
      legend.append(item);
    });
  }

  function currentScopeParts() {
    const parts = location.pathname.split('/').filter(Boolean);
    for (const type of ['equip', 'group', 'company']) {
      const index = parts.lastIndexOf(type);
      if (index < 0) continue;
      if (type === 'equip' && ['list', 'detail'].includes(parts[index + 1])) continue;
      const values = parts.slice(index + 1);
      if (type === 'equip' && values.length >= 3) return { type, values: values.slice(0, 3) };
      if (type === 'group' && values.length >= 2) return { type, values: values.slice(0, 2) };
      if (type === 'company' && values.length >= 1) return { type, values: values.slice(0, 1) };
    }
    return service === 'dealer'
      ? { type: 'company', values: ['151'] }
      : { type: 'group', values: ['1933', '1948'] };
  }

  function vehicleUrl(vehicleId) {
    const next = new URL(location.href);
    const parts = next.pathname.split('/').filter(Boolean);
    const encodedId = encodeURIComponent(vehicleId);
    const lastEquipIndex = parts.lastIndexOf('equip');

    if (
      lastEquipIndex >= 0
      && parts.length - lastEquipIndex >= 4
      && !['list', 'detail'].includes(parts[lastEquipIndex + 1])
    ) {
      parts[parts.length - 1] = encodedId;
      next.pathname = `/${parts.join('/')}`;
      return `${next.pathname}${next.search}`;
    }

    const scope = currentScopeParts();
    if (location.pathname.includes('/page/equip/list/')) {
      next.pathname = `/${service}/${location.pathname.match(/^\/(?:fleet|dealer)\/(ko|en)\//)?.[1] || 'ko'}/page/equip/detail/equip/${scope.values.join('/')}/${encodedId}`;
      return `${next.pathname}${next.search}`;
    }

    const scopeIndex = Math.max(parts.lastIndexOf('group'), parts.lastIndexOf('company'));
    if (scopeIndex >= 0) {
      const prefix = parts.slice(0, scopeIndex);
      const companyAndGroup = scope.type === 'group' ? scope.values : [scope.values[0]];
      const vehiclePrefix = location.pathname.includes('/anlz/battery/li/') ? [...prefix, 'detail'] : prefix;
      next.pathname = `/${[...vehiclePrefix, 'equip', ...companyAndGroup, encodedId].join('/')}`;
      return `${next.pathname}${next.search}`;
    }
    return `${next.pathname}${next.search}`;
  }

  function chooseVehicle(vehicleId) {
    if (!vehicleId) return false;
    const next = vehicleUrl(vehicleId);
    if (!next || next === `${location.pathname}${location.search}`) return false;
    location.assign(next);
    return true;
  }

  function chooseCompanyScope() {
    const side = sourceSide();
    const groupSection = sourceSideSection(side, '\uadf8\ub8f9\ubcc4');
    const groupButton = groupSection?.querySelector('.side-item.active') || groupSection?.querySelector('.side-item');
    if (!groupButton) return false;
    groupButton.click();
    return true;
  }

  function createSelector() {
    const section = document.createElement('section');
    section.className = 'top-selection collapsed requirements-prototype-selector';
    section.id = 'requirements-selector-dock';
    section.setAttribute('aria-label', '\uc5c5\uccb4 \ubc0f \ucc28\ub7c9 \uc120\ud0dd');
    section.innerHTML = `
      <div class="top-selection__inner">
        <strong>\uc870\ud68c \ub300\uc0c1</strong>
        <label><span>\uc5c5\uccb4</span><select data-company aria-label="\uc5c5\uccb4 \uc120\ud0dd"></select></label>
        <label><span>\ucc28\ub7c9</span><select data-vehicle aria-label="\ucc28\ub7c9 \uc120\ud0dd"></select></label>
        <span class="selection-context" data-context></span>
        <button class="line-button" data-toggle type="button" aria-expanded="false"><svg class="line-button__icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"></circle><path d="m15.5 15.5 5 5"></path></svg><span>\ucc28\ub7c9 \uc0c1\uc138\uac80\uc0c9</span></button>
      </div>
      <div class="top-selection__detail">
        <div class="detail-search-field">
          <span>\uc804\uccb4 \uc5c5\uccb4 \ucc28\ub7c9\ubc88\ud638 \uac80\uc0c9</span>
          <div class="detail-search-control"><input data-search type="search" placeholder="\ucc28\ub7c9\ubc88\ud638 5\uc790 \uc774\uc0c1 \uc785\ub825 (\uc608: FBA32)"><button data-submit type="button">\uc870\ud68c</button></div>
          <small>\uc5c5\uccb4 \uc120\ud0dd\uacfc \uad00\uacc4\uc5c6\uc774 \uc804\uccb4 \ucc28\ub7c9\uc5d0\uc11c \ucc28\ub7c9\ubc88\ud638\uac00 \uc77c\ubd80 \uc77c\uce58\ud558\ub294 \ucc28\ub7c9\uc744 \uc870\ud68c\ud569\ub2c8\ub2e4. 5\uc790 \uc774\uc0c1 \uc785\ub825\ud574 \uc8fc\uc138\uc694.</small>
        </div>
        <div class="detail-result-area">
          <div class="detail-result-head"><strong data-result-count>\uac80\uc0c9 \uacb0\uacfc</strong><span>\ucc28\ub7c9\ubc88\ud638 \u00b7 \uc18c\uc18d \uc5c5\uccb4 \u00b7 \ubaa8\ub378 \u00b7 \ub3d9\ub825 \uc720\ud615</span></div>
          <div class="vehicle-result" data-results><p class="detail-result-guide">\ucc28\ub7c9\ubc88\ud638\ub97c \uc785\ub825\ud558\uace0 \uc870\ud68c\ud574 \uc8fc\uc138\uc694.</p></div>
        </div>
      </div>`;

    const toggle = section.querySelector('[data-toggle]');
    toggle.addEventListener('click', () => {
      const collapsed = section.classList.toggle('collapsed');
      toggle.setAttribute('aria-expanded', String(!collapsed));
      toggle.querySelector('span').textContent = collapsed ? '\ucc28\ub7c9 \uc0c1\uc138\uac80\uc0c9' : '\uc0c1\uc138\uac80\uc0c9 \ub2eb\uae30';
      if (!collapsed) section.querySelector('[data-search]')?.focus();
    });
    section.querySelector('[data-submit]').addEventListener('click', () => renderSearch(section));
    section.querySelector('[data-search]').addEventListener('keydown', event => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      renderSearch(section);
    });
    return section;
  }

  async function renderSearch(section) {
    const query = section.querySelector('[data-search]').value.trim();
    const keyword = normalizeVehicleId(query);
    const list = section.querySelector('[data-results]');
    const count = section.querySelector('[data-result-count]');
    list.replaceChildren();
    if (keyword.length < 5) {
      count.textContent = '\uac80\uc0c9 \uacb0\uacfc';
      const guide = document.createElement('p');
      guide.className = 'detail-result-guide';
      guide.textContent = '\ucc28\ub7c9\ubc88\ud638\ub97c 5\uc790 \uc774\uc0c1 \uc785\ub825\ud574 \uc8fc\uc138\uc694.';
      list.append(guide);
      return;
    }
    const local = sourceVehicles(sourceSide()).map(item => ({ id: item.id, company: currentCompanyName(sourceSide()) }));
    const remote = await loadEquipment();
    const merged = [...remote, ...local].filter((item, index, array) => item.id && array.findIndex(other => normalizeVehicleId(other.id) === normalizeVehicleId(item.id)) === index);
    const matches = merged.filter(item => normalizeVehicleId(item.id).includes(keyword));
    count.textContent = `\uac80\uc0c9 \uacb0\uacfc ${matches.length}\ub300`;
    if (!matches.length) {
      const guide = document.createElement('p');
      guide.className = 'detail-result-guide';
      guide.textContent = '\uc77c\uce58\ud558\ub294 \ucc28\ub7c9\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.';
      list.append(guide);
      return;
    }
    matches.forEach(item => {
      const button = document.createElement('button');
      button.type = 'button';
      button.innerHTML = `<strong></strong><span></span>`;
      button.querySelector('strong').textContent = item.id;
      button.querySelector('span').textContent = [item.company || currentCompanyName(sourceSide()), item.model, item.power].filter(Boolean).join(' \u00b7 ');
      button.addEventListener('click', () => chooseVehicle(item.id));
      list.append(button);
    });
  }

  async function refreshSelector(section) {
    const side = sourceSide();
    const vehicles = sourceVehicles(side);
    const companyName = currentCompanyName(side);
    const company = section.querySelector('[data-company]');
    const vehicle = section.querySelector('[data-vehicle]');
    const context = section.querySelector('[data-context]');
    const remoteVehicles = await loadEquipment();
    const routeVehicleId = currentEquipmentId();
    const signature = JSON.stringify([location.pathname, companyName, vehicles.map(item => [item.id, item.active]), remoteVehicles.map(item => [item.id, item.model])]);
    if (section.dataset.signature === signature) return;
    section.dataset.signature = signature;
    const currentCompany = companyRecords.find(item => item.name === companyName) || companyRecords[1];
    const selectedCompanyId = section.dataset.selectedCompany || currentCompany.id;
    setSelectOptions(company, companyRecords.map(item => ({ value: item.id, label: item.name, selected: item.id === selectedCompanyId })));
    company.value = selectedCompanyId;
    const mergedVehicles = [...remoteVehicles, ...vehicles.map(item => ({id:item.id, model:modelForVehicle(item.id), companyId:currentCompany.id, company:companyName}))]
      .filter((item, index, array) => item.id && array.findIndex(other => normalizeVehicleId(other.id) === normalizeVehicleId(item.id)) === index);
    const populateVehicles = companyId => {
      const rows = mergedVehicles.filter(item => companyId === 'all' || item.companyId === companyId);
      setSelectOptions(vehicle, rows.map(item => ({
        value: item.id,
        label: [item.id, item.model].filter(Boolean).join(' \u00b7 '),
        selected: routeVehicleId
          ? normalizeVehicleId(routeVehicleId) === normalizeVehicleId(item.id)
          : vehicles.some(source => source.active && normalizeVehicleId(source.id) === normalizeVehicleId(item.id)),
      })), routeVehicleId ? '' : '\ucc28\ub7c9\uc744 \uc120\ud0dd\ud558\uc138\uc694');
      if (routeVehicleId) {
        const matchingOption = [...vehicle.options].find(option => normalizeVehicleId(option.value) === normalizeVehicleId(routeVehicleId));
        if (matchingOption) vehicle.value = matchingOption.value;
      }
    };
    populateVehicles(selectedCompanyId);
    const active = routeVehicleId ? { id: routeVehicleId } : vehicles.find(item => item.active);
    context.textContent = active ? `\ud604\uc7ac \uc870\ud68c \u00b7 \ucc28\ub7c9 ${active.id}` : `\ud604\uc7ac \uc870\ud68c \u00b7 ${companyName}`;
    company.onchange = () => {
      section.dataset.selectedCompany = company.value;
      populateVehicles(company.value);
      const selectedName = company.selectedOptions[0]?.textContent || companyName;
      context.textContent = company.value === 'all' ? '\ud604\uc7ac \uc870\ud68c \u00b7 \uc804\uccb4\ucc28\ub7c9' : `\ud604\uc7ac \uc870\ud68c \u00b7 \uc5c5\uccb4 ${selectedName}`;
      if (company.value === currentCompany.id) chooseCompanyScope();
    };
    vehicle.onchange = () => {
      if (!vehicle.value) {
        const selectedName = company.selectedOptions[0]?.textContent || companyName;
        context.textContent = company.value === 'all' ? '\ud604\uc7ac \uc870\ud68c \u00b7 \uc804\uccb4\ucc28\ub7c9' : `\ud604\uc7ac \uc870\ud68c \u00b7 \uc5c5\uccb4 ${selectedName}`;
        return;
      }
      chooseVehicle(vehicle.value);
    };
  }

  const menuConfigs = [
    {match:'/dashboard/', title:'\ub300\uc2dc\ubcf4\ub4dc', items:[['\uadf8\ub8f9\ubcc4 \ub300\uc2dc\ubcf4\ub4dc',service === 'dealer' ? '/dashboard/company' : '/dashboard/equip'],['\uadf8\ub8f9\ubcc4 \uc704\uc82f \ub300\uc2dc\ubcf4\ub4dc',service === 'dealer' ? '/dashboard/widget-company' : '/dashboard/widget']]},
    {match:'/equip/', title:'\ucc28\ub7c9\uad00\ub9ac', items:[['\ucc28\ub7c9\uc815\ubcf4','/equip/list']]},
    {match:'/anlz/', title:'\uc6b4\ud589\uc774\ub825', items:[['\uc694\uc57d\uc815\ubcf4','/anlz/summary/'],['\uc0ac\uc6a9\uc2dc\uac04','/anlz/calendar/'],['\uc6b4\uc601\ud6a8\uc728','/anlz/operate/'],['\ucda9\uaca9','/anlz/shock/'],['\uc5d4\uc9c4','/anlz/fuel/'],['\ub9ac\ud2ac\ubc30\ud130\ub9ac','/anlz/battery/li/'],['\uc218\uc18c\ubc30\ud130\ub9ac','/anlz/battery/h2/']]},
    {match:'/srvc/', title:'\uc11c\ube44\uc2a4', items:[['\uc804\uccb4','/srvc/list/'],['\uc815\ube44\uc774\ub825','/srvc/maintenance/'],['\uc18c\ubaa8\ud488\uad00\ub9ac','/srvc/supplies/'],['\ucc28\ub7c9 \uc5d0\ub7ec','/srvc/equipError/']]},
    {match:'/rpt/', title:'\ub9ac\ud3ec\ud2b8', items:[['\uadf8\ub8f9\ubcc4\ud604\ud669','/rpt/company/status'],['\uadf8\ub8f9\ubcc4\ube44\uad50','/rpt/company/comparison'],['\uadf8\ub8f9\ubcc4\ud788\ud2b8\ub9f5','/rpt/company/hitmap']]},
    {match:'/maps/', title:'\uc9c0\ub3c4', items:[['\uc9c0','/maps/roadmap/'],['\uc704\uc131','/maps/satellite/']]},
    {match:'/mgmt/', title:'\uad00\ub9ac\uae30\ub2a5', items:[['\uc0ac\uc6a9\uc790','/mgmt/user'],['\uc5c5\uccb4','/mgmt/company'],['\uadf8\ub8f9','/mgmt/group'],['Geofence','/mgmt/geofence'],['\ucc28\ub7c9','/mgmt/equip'],['\uacc4\uc815\uc2e0\uccad\uad00\ub9ac','/mgmt/request/account'],['\ucc28\ub7c9\uc2e0\uccad\uad00\ub9ac','/mgmt/request/equip']]},
  ];

  function currentMenuConfig() {
    if (location.pathname.includes('/srvc/')) return menuConfigs.find(config => config.match === '/srvc/');
    if (location.pathname.includes('/anlz/')) return menuConfigs.find(config => config.match === '/anlz/');
    return menuConfigs.find(config => location.pathname.includes(config.match)) || menuConfigs[2];
  }

  function currentSubMenus() {
    const config = currentMenuConfig();
    return config.items
      .filter(([label]) => !(config.title === '\uc6b4\ud589\uc774\ub825' && label === '\uc218\uc18c\ubc30\ud130\ub9ac'))
      .map(([sourceLabel, route]) => {
        const label = config.title === '\uc6b4\ud589\uc774\ub825' && sourceLabel === '\uc5d4\uc9c4' ? '\uc5d4\uc9c4 \uc5f0\ube44' : sourceLabel;
        const active = config.title === '\ucc28\ub7c9\uad00\ub9ac' && route === '/equip/list'
          ? location.pathname.includes('/equip/')
          : location.pathname.includes(route);
        return {label, route, active};
      });
  }

  function routeScope() {
    const scope = currentScopeParts();
    return `${scope.type}/${scope.values.join('/')}`;
  }

  function menuUrl(route) {
    const language = location.pathname.match(/^\/(?:fleet|dealer)\/(ko|en)\//)?.[1] || 'ko';
    const prefix = `/${service}/${language}/page`;
    let pathname;
    if (route === '/equip/list') {
      const scope = currentScopeParts();
      // The vehicle-management GNB/LNB always opens the complete list.
      // A selected vehicle is carried only when the user explicitly opens
      // its detail screen from the list or selector.
      pathname = service === 'dealer'
        ? `${prefix}/equip/list/company/${scope.values[0] || '151'}`
        : `${prefix}/equip/list/group/${scope.values[0] || '1933'}/${scope.values[1] || '1948'}`;
    }
    else if (route.startsWith('/dashboard/')) pathname = `${prefix}${route}`;
    else if (route.startsWith('/rpt/')) pathname = `${prefix}${route}`;
    else if (route.startsWith('/mgmt/')) pathname = `${prefix}${route}`;
    else if (route === '/anlz/battery/li/' && currentScopeParts().type === 'equip') {
      pathname = `${prefix}${route.replace(/\/$/, '')}/detail/${routeScope()}`;
    }
    else pathname = `${prefix}${route.replace(/\/$/, '')}/${routeScope()}`;
    const next = new URL(pathname, location.origin);
    return `${next.pathname}${next.search}`;
  }

  function createSide() {
    const aside = document.createElement('aside');
    aside.className = 'local-side analysis-side requirements-prototype-side';
    aside.innerHTML = '<div class="local-side__inner"><div class="page-side"><div class="page-side__title"></div><div class="page-side__content"><nav class="analysis-menu-list" aria-label="\ud604\uc7ac \uba54\ub274 \ud558\uc704 \uba54\ub274"></nav></div></div></div>';
    return aside;
  }

  function ensureDashboardTabs(page, anchor) {
    let nav = page.querySelector('.requirements-prototype-dashboard-tabs');
    if (!nav) {
      nav = document.createElement('nav');
      nav.className = 'requirements-prototype-dashboard-tabs';
      nav.setAttribute('aria-label', '대시보드 화면 구분');
      const standardRoute = service === 'dealer' ? '/dashboard/company' : '/dashboard/equip';
      const widgetRoute = service === 'dealer' ? '/dashboard/widget-company' : '/dashboard/widget';
      nav.innerHTML = `<strong>대시보드</strong><div><button type="button" data-route="${standardRoute}">그룹별 대시보드</button><button type="button" data-route="${widgetRoute}">그룹별 위젯 대시보드</button></div>`;
      anchor.insertAdjacentElement('afterend', nav);
    }
    nav.querySelectorAll('button').forEach(button => {
      button.classList.toggle('active', location.pathname.includes(button.dataset.route));
      button.tabIndex = 0;
      button.removeAttribute('aria-disabled');
      button.onclick = () => { location.href = menuUrl(button.dataset.route); };
    });
    return nav;
  }

  function refreshSide(aside) {
    const config = currentMenuConfig();
    const menus = currentSubMenus();
    const countSignature = serviceLnbCountVariant && config.title === '\uc11c\ube44\uc2a4'
      ? `|${serviceMenuCounts.maintenance}:${serviceMenuCounts.supplies}:${serviceMenuCounts.error}`
      : '';
    const signature = `${config.title}|${menus.map(item => `${item.label}:${item.active}`).join('|')}${countSignature}`;
    if (aside.dataset.signature === signature) return;
    aside.dataset.signature = signature;
    aside.querySelector('.page-side__title').textContent = config.title;
    const nav = aside.querySelector('.analysis-menu-list');
    nav.replaceChildren();
    menus.forEach(item => {
      if (!item.label) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'side-item type2';
      button.tabIndex = 0;
      button.removeAttribute('aria-disabled');
      button.onclick = () => { location.href = menuUrl(item.route); };
      if (item.active) button.classList.add('active');
      const em = document.createElement('em');
      em.textContent = item.label;
      if (serviceLnbCountVariant && config.title === '\uc11c\ube44\uc2a4' && item.label !== '\uc804\uccb4') {
        const keyByLabel = {
          '\uc815\ube44\uc774\ub825': 'maintenance',
          '\uc18c\ubaa8\ud488\uad00\ub9ac': 'supplies',
          '\ucc28\ub7c9 \uc5d0\ub7ec': 'error',
        };
        const iconByKey = {
          maintenance: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.2 4.2a5.2 5.2 0 0 0-6.5 6.6L2.6 15l3.4 3.4 4.1-4.1a5.2 5.2 0 0 0 6.6-6.5l-3 3-3.4-.8-.8-3.4 3.7-2.4Z"/></svg>',
          supplies: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v10H4V8Zm4 4h8m-4-4v8"/></svg>',
          error: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2.8 20h18.4L12 3Zm0 5.5v5m0 3v.5"/></svg>',
        };
        const key = keyByLabel[item.label];
        button.dataset.serviceCountKey = key;
        const icon = document.createElement('span');
        icon.className = 'requirements-service-side-icon';
        icon.innerHTML = iconByKey[key];
        const count = document.createElement('strong');
        count.className = 'requirements-service-side-count';
        count.textContent = String(serviceMenuCounts[key] ?? 0);
        button.append(icon);
        em.className = 'requirements-service-side-label';
        button.append(em, count);
      } else {
        button.append(em);
      }
      nav.append(button);
    });
  }

  function bindGlobalNavigation() {
    const defaultRoutes = {
      '\ub300\uc2dc\ubcf4\ub4dc':service === 'dealer' ? '/dashboard/widget-company' : '/dashboard/widget',
      '\ucc28\ub7c9\uad00\ub9ac':'/equip/list',
      '\uc6b4\ud589\uc774\ub825':'/anlz/summary/',
      '\uc11c\ube44\uc2a4':'/srvc/equipError/',
      '\ub9ac\ud3ec\ud2b8':'/rpt/company/status',
      '\uc9c0\ub3c4':'/maps/roadmap/',
      '\uad00\ub9ac\uae30\ub2a5':'/mgmt/user',
    };
    document.querySelectorAll('.gnb-text').forEach(button => {
      if (button.dataset.prototypeBound) return;
      const label = text(button).replace(/\s/g, '');
      if (!defaultRoutes[label]) return;
      button.dataset.prototypeBound = 'true';
      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        location.href = menuUrl(defaultRoutes[label]);
      }, true);
    });
  }

  function bindSideToggle(local) {
    const toggle = local.querySelector(':scope > .local-side-func');
    if (!toggle || toggle.dataset.prototypeBound) return;
    toggle.dataset.prototypeBound = 'true';
    toggle.setAttribute('aria-expanded', 'true');
    toggle.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const collapsed = document.body.classList.toggle('requirements-prototype-side-collapsed');
      toggle.setAttribute('aria-expanded', String(!collapsed));
    }, true);
  }

  function compactServiceSummary() {
    if (!location.pathname.includes('/srvc/')) return;
    const serviceTabs = document.querySelector('.srvc-tab');
    if (!serviceTabs) return;
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
      serviceTabs.setAttribute('aria-label', '\uc11c\ube44\uc2a4 \ud604\ud669 \uc694\uc57d');
    }
    const content = serviceTabs.closest('.content-body');
    const sectionTop = content ? [...content.children].find(node => node.classList?.contains('section-top')) : null;
    if (serviceLnbCountVariant) {
      document.body.classList.add('requirements-prototype-service-lnb-counts');
      const countFor = key => Number(serviceTabs.querySelector(`.srvc-tab__item[data-icon="${key}"] .srvc-tab__count`)?.textContent.replace(/[^0-9]/g, '')) || 0;
      ['maintenance', 'supplies', 'error'].forEach(key => {
        const current = countFor(key);
        if (current > 0 || serviceMenuCounts[key] === null) serviceMenuCounts[key] = current;
      });
      if (location.pathname.includes('/srvc/supplies/')) document.body.classList.add('requirements-prototype-service-lnb-counts-supplies');
      return;
    }
    if (sectionTop && !serviceTabs.closest('.linq-review-service-toolbar-row')) {
      const toolbarRow = document.createElement('div');
      toolbarRow.className = 'linq-review-service-toolbar-row';
      content.insertBefore(toolbarRow, serviceTabs);
      toolbarRow.append(serviceTabs, sectionTop);
    }
  }

  function refreshShell() {
    const page = document.querySelector('#page');
    const head = page?.querySelector('.page-head');
    const local = page?.querySelector('.page-body .local');
    const management = page?.querySelector('.page-management');
    if (!page || !head || (!local && !management)) return;
    document.body.classList.add('requirements-prototype-shell');
    configureCompactPeriodHelp();
    compactServiceSummary();
    removeDuplicateVehicleCards();
    compactOperationSummaryCards();

    let selector = page.querySelector('.requirements-prototype-selector');
    if (location.pathname.includes('/dashboard/')) {
      document.body.classList.add('requirements-prototype-dashboard-topnav');
      selector?.remove();
      page.querySelectorAll('.requirements-prototype-side').forEach(side => side.remove());
      ensureDashboardTabs(page, head);
      const originalSide = sourceSide();
      if (originalSide) originalSide.classList.add('requirements-prototype-source-side');
      if (management) {
        const layout = management.closest('.requirements-prototype-dashboard-layout');
        if (layout) layout.classList.add('is-full-width');
      }
      bindGlobalNavigation();
      if (!equipmentRecords.length) loadEquipment().then(queueRefresh).catch(() => {});
      return;
    }
    document.body.classList.remove('requirements-prototype-dashboard-topnav');
    page.querySelector('.requirements-prototype-dashboard-tabs')?.remove();
    if (!selector) {
      selector = createSelector();
      head.insertAdjacentElement('afterend', selector);
    }
    refreshSelector(selector);

    let sideHost = local;
    if (!sideHost && management) {
      sideHost = management.closest('.requirements-prototype-dashboard-layout');
      if (!sideHost) {
        sideHost = document.createElement('div');
        sideHost.className = 'requirements-prototype-dashboard-layout';
        management.insertAdjacentElement('beforebegin', sideHost);
        sideHost.append(management);
      }
    }
    if (!sideHost) return;
    const originalSide = sourceSide();
    if (originalSide) originalSide.classList.add('requirements-prototype-source-side');
    let side = sideHost.querySelector(':scope > .requirements-prototype-side');
    if (!side) {
      side = createSide();
      sideHost.insertBefore(side, originalSide || sideHost.firstChild);
    }
    refreshSide(side);
    bindGlobalNavigation();
    if (local) bindSideToggle(local);
    if (!equipmentRecords.length) loadEquipment().then(queueRefresh).catch(() => {});
  }

  const observer = new MutationObserver(mutations => {
    const own = mutations.every(mutation => mutation.target instanceof Element && mutation.target.closest('.requirements-prototype-selector, .requirements-prototype-side'));
    if (!own) queueRefresh();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  addEventListener('popstate', queueRefresh);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', queueRefresh, { once: true });
  else queueRefresh();
})();
