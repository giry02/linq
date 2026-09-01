(() => {
  const initialUrl = new URL(location.href);
  const wrappedRoute = initialUrl.searchParams.get('route') || '';
  const wrappedUrl = new URL(wrappedRoute || location.href, location.origin);
  const staticRequirementPreview = location.pathname.includes('/requirements-mvp/static/');
  if (
    initialUrl.searchParams.get('layout') !== 'prototype3'
    && wrappedUrl.searchParams.get('layout') !== 'prototype3'
    && !staticRequirementPreview
  ) return;
  const reviewScreen = window.LINQ_REVIEW_SCREEN || '';

  let refreshQueued = false;
  let equipmentRecords = [];
  let equipmentPromise = null;
  const text = node => node?.textContent?.trim() || '';
  const normalizeVehicleId = value => String(value || '').toLowerCase().replace(/[-_\s]/g, '');
  const activeScreenPath = () => {
    const requestedRoute = new URL(location.href).searchParams.get('route');
    if (!requestedRoute) return location.pathname;
    try {
      return new URL(requestedRoute, location.origin).pathname;
    } catch (_error) {
      return location.pathname;
    }
  };
  const forcedVehicleDetail = () => {
    const match = activeScreenPath().match(/\/detail\/equip\/([^/]+)\/([^/]+)\/([^/?#]+)/i);
    if (!match) return null;
    return {
      companyId: decodeURIComponent(match[1]),
      groupId: decodeURIComponent(match[2]),
      vehicleId: decodeURIComponent(match[3]),
    };
  };
  const companyRecords = [
    {id:'all', name:'전체 업체'},
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
  const fallbackVehicles = [
    ['FBA32_224250271','B30S-7','리튬'],['FBA32_224250383','B30S-7','리튬'],
    ['FBA32-002038','B30S-7','리튬'],['FBA32-002039','B30S-7','리튬'],
    ['FBA32-002040','B30S-7','리튬'],['FBA32-002043','B30S-7','리튬'],
    ['FBA32-002044','B30S-7','리튬'],['FBA32-002045','B30S-7','리튬'],
    ['FBA32-002065','B30S-7','리튬'],['FBA32-002067','B30S-7','리튬'],
    ['FBA32-002068','B30S-7','리튬'],['FBA32-002069','B30S-7','리튬'],
    ['FBA32-002071','B30S-7','리튬'],['FBA32-002073','B30S-7','리튬'],
    ['FBA32-002074','B30S-7','리튬'],['FBA34_224030249','B35S-7','리튬'],
    ['FBA34_224250279','B35S-7','리튬'],['FBA34-000509','B35S-7','리튬'],
    ['FBA34-000518','B35S-7','리튬'],['FBA34-000520','B35S-7','리튬'],
    ['FBA34-000522','B35S-7','리튬'],['FHA30-000101','B30X-7 H2','수소'],
  ].map(([id, model, power]) => ({id, model, power, companyId:'1933', company:'(주)세종물류중부지점'}));
  const hierarchyGroups = ['기본그룹','테스트그룹'];
  const hierarchyFuels = ['엔진','납축','리튬','수소'];

  function vehicleGroup(item) {
    if (item.group) return item.group;
    const hash = [...String(item.id || '')].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return hash % 10 < 6 ? '기본그룹' : '테스트그룹';
  }

  function vehicleFuel(item) {
    const power = String(item.power || '').replace(/\s/g, '');
    if (hierarchyFuels.includes(power)) return power;
    const id = String(item.id || '').toUpperCase();
    if (id.startsWith('FHA')) return '수소';
    if (id.startsWith('FDB') || id.startsWith('FRA')) return '엔진';
    if (id.startsWith('FBA35') || id.startsWith('FBA36')) return '납축';
    if (id.startsWith('FBA')) return '리튬';
    return '엔진';
  }

  function fitHierarchySelectWidths(section) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;
    [
      ['[data-company]',160,290],['[data-group]',130,160],
      ['[data-fuel]',120,140],['[data-vehicle]',160,225],
    ].forEach(([selector,minWidth,maxWidth]) => {
      const select = section.querySelector(selector);
      if (!select) return;
      const style = getComputedStyle(select);
      context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const widest = [...select.options].reduce((width, option) => Math.max(width, context.measureText(option.textContent).width), 0);
      select.style.width = `${Math.min(maxWidth, Math.max(minWidth, Math.ceil(widest + 54)))}px`;
    });
  }

  const decorateUrl = value => {
    if (!value) return value;
    try {
      const next = new URL(value, location.href);
      if (next.origin !== location.origin || !next.pathname.startsWith('/fleet/')) return value;
      next.searchParams.set('layout', 'prototype3');
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
    }).filter(item => item.id);
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

  function chooseVehicle(vehicleId) {
    const normalized = normalizeVehicleId(vehicleId);
    const match = sourceVehicles(sourceSide()).find(item => normalizeVehicleId(item.id).includes(normalized));
    if (!match) return false;
    match.button.click();
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
    section.setAttribute('aria-label', '\uc5c5\uccb4, \uadf8\ub8f9, \ubd84\ub958 \ubc0f \ucc28\ub7c9 \uc120\ud0dd');
    section.innerHTML = `
      <div class="top-selection__inner">
        <label><span class="selector-kind-icon" title="\uc5c5\uccb4" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="1.5"></rect><path d="M8 7h2M14 7h2M8 11h2M14 11h2M9 21v-5h6v5"></path></svg></span><select data-company aria-label="\uc5c5\uccb4 \uc120\ud0dd"></select></label>
        <label><span class="selector-kind-icon" title="\uadf8\ub8f9" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"></circle><circle cx="17" cy="9" r="2.5"></circle><path d="M3.5 20v-1.5A5.5 5.5 0 0 1 9 13a5.5 5.5 0 0 1 5.5 5.5V20M14 14.5a4.5 4.5 0 0 1 6.5 4V20"></path></svg></span><select data-group aria-label="\uadf8\ub8f9 \uc120\ud0dd"></select></label>
        <label><span class="selector-kind-icon" title="\ubd84\ub958" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 5h7l9 9-7 7-9-9z"></path><circle cx="8.5" cy="9.5" r="1.4"></circle></svg></span><select data-fuel aria-label="\ubd84\ub958 \uc120\ud0dd"></select></label>
        <label><span class="selector-kind-icon" title="\ucc28\ub7c9" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"></path><circle cx="7" cy="18" r="2"></circle><circle cx="17" cy="18" r="2"></circle></svg></span><select data-vehicle aria-label="\ucc28\ub7c9 \uc120\ud0dd"></select></label>
        <span class="selection-context" data-context></span>
        <button class="line-button" data-toggle type="button" aria-expanded="false">\ucc28\ub7c9 \uc0c1\uc138\uac80\uc0c9</button>
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
      toggle.textContent = collapsed ? '\ucc28\ub7c9 \uc0c1\uc138\uac80\uc0c9' : '\ub2eb\uae30';
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
    const merged = [...(section._selectorVehicles || []), ...remote, ...local]
      .filter((item, index, array) => item.id && array.findIndex(other => normalizeVehicleId(other.id) === normalizeVehicleId(item.id)) === index);
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
    const detailScope = forcedVehicleDetail();
    const company = section.querySelector('[data-company]');
    const group = section.querySelector('[data-group]');
    const fuel = section.querySelector('[data-fuel]');
    const vehicle = section.querySelector('[data-vehicle]');
    const context = section.querySelector('[data-context]');
    const remoteVehicles = await loadEquipment();
    const currentCompany = companyRecords.find(item => item.name === companyName) || companyRecords[1];
    const localVehicles = vehicles.map(item => ({
      id:item.id, model:modelForVehicle(item.id), power:vehicleFuel(item),
      companyId:currentCompany.id, company:companyName,
    }));
    let mergedVehicles = [...remoteVehicles, ...localVehicles]
      .filter((item, index, array) => item.id && array.findIndex(other => normalizeVehicleId(other.id) === normalizeVehicleId(item.id)) === index)
      .map(item => ({...item, power:vehicleFuel(item), group:vehicleGroup(item)}));
    if (!mergedVehicles.length) mergedVehicles = fallbackVehicles.map(item => ({...item, group:vehicleGroup(item)}));

    if (detailScope && !mergedVehicles.some(item => normalizeVehicleId(item.id) === normalizeVehicleId(detailScope.vehicleId))) {
      mergedVehicles.unshift({
        id:detailScope.vehicleId, model:modelForVehicle(detailScope.vehicleId), power:vehicleFuel({id:detailScope.vehicleId}),
        group:vehicleGroup({id:detailScope.vehicleId}), companyId:detailScope.companyId, company:companyName,
      });
    }
    section._selectorVehicles = mergedVehicles;
    const signature = JSON.stringify([detailScope, companyName, vehicles.map(item => [item.id, item.active]), mergedVehicles.map(item => [item.id, item.model, item.companyId])]);
    if (section.dataset.signature === signature) return;
    section.dataset.signature = signature;

    const active = vehicles.find(item => item.active);
    if (detailScope) {
      section.dataset.selectedCompany = detailScope.companyId;
      section.dataset.selectedVehicle = detailScope.vehicleId;
      const forced = mergedVehicles.find(item => normalizeVehicleId(item.id) === normalizeVehicleId(detailScope.vehicleId));
      section.dataset.selectedGroup = forced?.group || 'all';
      section.dataset.selectedFuel = forced?.power || 'all';
      company.disabled = true;
      company.setAttribute('aria-readonly', 'true');
    } else {
      company.disabled = false;
      company.removeAttribute('aria-readonly');
      if (!section.dataset.selectedCompany) section.dataset.selectedCompany = 'all';
      if (!section.dataset.selectedGroup) section.dataset.selectedGroup = 'all';
      if (!section.dataset.selectedFuel) section.dataset.selectedFuel = 'all';
      if (!section.dataset.selectedVehicle && active) section.dataset.selectedVehicle = active.id;
    }

    const renderHierarchy = () => {
      let companyId = section.dataset.selectedCompany || 'all';
      let groupName = section.dataset.selectedGroup || 'all';
      let fuelType = section.dataset.selectedFuel || 'all';
      let vehicleId = section.dataset.selectedVehicle || '';
      if (!companyRecords.some(item => item.id === companyId)) companyId = detailScope?.companyId || 'all';

      setSelectOptions(company, companyRecords.map(item => {
        const count = item.id === 'all' ? mergedVehicles.length : mergedVehicles.filter(vehicleItem => String(vehicleItem.companyId) === String(item.id)).length;
        return {value:item.id, label:`${item.name} \u00b7 ${count}\ub300`, selected:item.id === companyId};
      }));
      company.value = companyId;
      const companyPool = mergedVehicles.filter(item => companyId === 'all' || String(item.companyId) === String(companyId));
      setSelectOptions(group, [
        {value:'all', label:`\uc804\uccb4 \uadf8\ub8f9 \u00b7 ${companyPool.length}\ub300`, selected:groupName === 'all'},
        ...hierarchyGroups.map(name => ({value:name, label:`${name} \u00b7 ${companyPool.filter(item => item.group === name).length}\ub300`, selected:name === groupName})),
      ]);
      group.value = groupName;
      const groupPool = companyPool.filter(item => groupName === 'all' || item.group === groupName);
      setSelectOptions(fuel, [
        {value:'all', label:`\uc804\uccb4 \ubd84\ub958 \u00b7 ${groupPool.length}\ub300`, selected:fuelType === 'all'},
        ...hierarchyFuels.map(type => ({value:type, label:`${type} \u00b7 ${groupPool.filter(item => item.power === type).length}\ub300`, selected:type === fuelType})),
      ]);
      fuel.value = fuelType;
      const filtered = groupPool.filter(item => fuelType === 'all' || item.power === fuelType);
      if (!filtered.some(item => normalizeVehicleId(item.id) === normalizeVehicleId(vehicleId))) {
        vehicleId = '';
        section.dataset.selectedVehicle = '';
      }
      setSelectOptions(vehicle, [
        {value:'', label:`\uc804\uccb4 \ucc28\ub7c9 \u00b7 ${filtered.length}\ub300`, selected:!vehicleId},
        ...filtered.map(item => ({value:item.id, label:[item.id,item.model].filter(Boolean).join(' \u00b7 '), selected:normalizeVehicleId(item.id) === normalizeVehicleId(vehicleId)})),
      ]);
      vehicle.value = vehicleId;
      const selectedCompany = companyRecords.find(item => item.id === companyId)?.name || companyName;
      context.textContent = vehicleId ? `\ucc28\ub7c9 \u00b7 ${vehicleId}` : fuelType !== 'all' ? `\ubd84\ub958 \u00b7 ${fuelType}` : groupName !== 'all' ? `\uadf8\ub8f9 \u00b7 ${groupName}` : companyId === 'all' ? '\uc804\uccb4\ucc28\ub7c9' : `\uc5c5\uccb4 \u00b7 ${selectedCompany}`;
      [company,group,fuel,vehicle].forEach(select => { select.title = select.selectedOptions[0]?.textContent || ''; });
      fitHierarchySelectWidths(section);
    };

    renderHierarchy();
    company.onchange = () => {
      section.dataset.selectedCompany = company.value;
      section.dataset.selectedGroup = 'all';
      section.dataset.selectedFuel = 'all';
      section.dataset.selectedVehicle = '';
      renderHierarchy();
      if (company.value === currentCompany.id) chooseCompanyScope();
    };
    group.onchange = () => {
      section.dataset.selectedGroup = group.value;
      section.dataset.selectedFuel = 'all';
      section.dataset.selectedVehicle = '';
      renderHierarchy();
    };
    fuel.onchange = () => {
      section.dataset.selectedFuel = fuel.value;
      section.dataset.selectedVehicle = '';
      renderHierarchy();
    };
    vehicle.onchange = () => {
      section.dataset.selectedVehicle = vehicle.value;
      renderHierarchy();
      if (vehicle.value) chooseVehicle(vehicle.value);
    };
  }

  const menuConfigs = [
    {match:'/dashboard/', title:'\ub300\uc2dc\ubcf4\ub4dc', items:[['\uadf8\ub8f9\ubcc4 \ub300\uc2dc\ubcf4\ub4dc','/dashboard/group'],['\uadf8\ub8f9\ubcc4 \uc704\uc82f \ub300\uc2dc\ubcf4\ub4dc','/dashboard/widget']]},
    {match:'/equip/', title:'\ucc28\ub7c9\uad00\ub9ac', items:[['\ucc28\ub7c9\uc815\ubcf4','/equip/list']]},
    {match:'/anlz/', title:'\uc6b4\ud589\uc774\ub825', items:[['\uc694\uc57d\uc815\ubcf4','/anlz/summary/'],['\uc0ac\uc6a9\uc2dc\uac04','/anlz/usage/'],['\uc6b4\uc601\ud6a8\uc728','/anlz/operate/'],['\ucda9\uaca9','/anlz/shock/'],['\uc5d4\uc9c4','/anlz/fuel/'],['\ub9ac\ud2ac\ubc30\ud130\ub9ac','/anlz/battery/li/'],['\uc218\uc18c\ubc30\ud130\ub9ac','/anlz/battery/h2/']]},
    {match:'/srvc/', title:'\uc11c\ube44\uc2a4', items:[['\uc804\uccb4','/srvc/list/'],['\uc815\ube44\uc774\ub825','/srvc/maintenance/'],['\uc18c\ubaa8\ud488\uad00\ub9ac','/srvc/supplies/'],['\ucc28\ub7c9 \uc5d0\ub7ec','/srvc/equipError/']]},
    {match:'/rpt/', title:'\ub9ac\ud3ec\ud2b8', items:[['\uadf8\ub8f9\ubcc4\ud604\ud669','/rpt/status'],['\uadf8\ub8f9\ubcc4\ube44\uad50','/rpt/compare'],['\uadf8\ub8f9\ubcc4\ud788\ud2b8\ub9f5','/rpt/heatmap']]},
    {match:'/maps/', title:'\uc9c0\ub3c4', items:[['\uc9c0\ub3c4','/maps/']]},
    {match:'/mgmt/', title:'\uad00\ub9ac\uae30\ub2a5', items:[['\uc0ac\uc6a9\uc790','/mgmt/user'],['\uc5c5\uccb4','/mgmt/company'],['\uadf8\ub8f9','/mgmt/group'],['Geofence','/mgmt/geofence'],['\ucc28\ub7c9','/mgmt/equipment'],['\uacc4\uc815\uc2e0\uccad\uad00\ub9ac','/mgmt/account'],['\ucc28\ub7c9\uc2e0\uccad\uad00\ub9ac','/mgmt/equipment-request']]},
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
        return {label, route, active: location.pathname.includes(route)};
      });
  }

  function routeScope() {
    const match = location.pathname.match(/\/(group|vehicle)\/([^/]+)\/([^/?#]+)/);
    return match ? `${match[1]}/${match[2]}/${match[3]}` : 'group/1933/1948';
  }

  function menuUrl(route) {
    const language = location.pathname.match(/^\/fleet\/(ko|en)\//)?.[1] || 'ko';
    const prefix = `/fleet/${language}/page`;
    let pathname;
    if (route.startsWith('/dashboard/')) pathname = `${prefix}${route}`;
    else if (route.startsWith('/maps/')) pathname = `${prefix}${route}`;
    else if (route.startsWith('/mgmt/')) pathname = `${prefix}${route}`;
    else pathname = `${prefix}${route.replace(/\/$/, '')}/${routeScope()}`;
    const next = new URL(pathname, location.origin);
    next.searchParams.set('layout', 'prototype3');
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
      nav.innerHTML = '<strong>대시보드</strong><div><button type="button" data-route="/dashboard/group">그룹별 대시보드</button><button type="button" data-route="/dashboard/widget">그룹별 위젯 대시보드</button></div>';
      anchor.insertAdjacentElement('afterend', nav);
    }
    nav.querySelectorAll('button').forEach(button => {
      button.classList.toggle('active', location.pathname.includes(button.dataset.route));
      button.tabIndex = -1;
      button.setAttribute('aria-disabled', 'true');
    });
    return nav;
  }

  function refreshSide(aside) {
    const config = currentMenuConfig();
    const menus = currentSubMenus();
    const signature = `${config.title}|${menus.map(item => `${item.label}:${item.active}`).join('|')}`;
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
      button.tabIndex = -1;
      button.setAttribute('aria-disabled', 'true');
      if (item.active) button.classList.add('active');
      const em = document.createElement('em');
      em.textContent = item.label;
      button.append(em);
      nav.append(button);
    });
  }

  function bindGlobalNavigation() {
    const defaultRoutes = {
      '\ub300\uc2dc\ubcf4\ub4dc':'/dashboard/widget',
      '\ucc28\ub7c9\uad00\ub9ac':'/equip/list',
      '\uc6b4\ud589\uc774\ub825':'/anlz/summary/',
      '\uc11c\ube44\uc2a4':'/srvc/equipError/',
      '\ub9ac\ud3ec\ud2b8':'/rpt/status/',
      '\uc9c0\ub3c4':'/maps/',
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
    compactServiceSummary();

    let selector = page.querySelector('.requirements-prototype-selector');
    if (selector && (!selector.querySelector('[data-group]') || !selector.querySelector('[data-fuel]'))) {
      const upgradedSelector = createSelector();
      selector.replaceWith(upgradedSelector);
      selector = upgradedSelector;
    }
    if (reviewScreen === 'dashboard') {
      document.body.classList.add('requirements-prototype-dashboard-topnav');
      if (!selector) {
        selector = createSelector();
        head.insertAdjacentElement('afterend', selector);
      }
      refreshSelector(selector);
      page.querySelectorAll('.requirements-prototype-side').forEach(side => side.remove());
      ensureDashboardTabs(page, selector);
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
  try {
    if (document.documentElement) observer.observe(document.documentElement, { childList: true, subtree: true });
  } catch (_error) {
    // Static review snapshots can briefly expose a non-observable root while the iframe is attaching.
  }
  addEventListener('popstate', queueRefresh);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', queueRefresh, { once: true });
  else queueRefresh();
})();
