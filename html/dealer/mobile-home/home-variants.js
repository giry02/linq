(() => {
  const data = window.LINQ_DEALER_MOBILE_DATA;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const fuelName = { LI:'리튬', LA:'납축', LM:'엔진', HI:'수소' };
  let selectedPeriod = 'month';

  async function loadCapturedSource(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`${response.status} ${path}`);
    const wrapper = await response.json();
    const binary = atob(wrapper.body);
    const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
    return JSON.parse(new TextDecoder('utf-8').decode(bytes));
  }

  function isCurrentError(item) { return item.resolveNm === '현재' || item.status === '현재'; }

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
        loadCapturedSource(data.captureSources.vehicleMenu), loadCapturedSource(data.captureSources.vehicleDaily),
        loadCapturedSource(data.captureSources.vehicleErrors), loadCapturedSource(data.captureSources.batteryErrors),
        loadCapturedSource(data.captureSources.supplies)
      ]);
      const menuVehicles = (menu.result || []).flatMap(group => (group.vehicles || []).map(vehicle => ({ ...vehicle, groupName:vehicle.groupName || group.groupName?.replace(/^.*? - /,'') || '기본그룹' })));
      const menuByEquipment = new Map(menuVehicles.map(vehicle => [vehicle.equipmentNumber, vehicle]));
      const dailyByEquipment = new Map((daily.result || []).map(vehicle => [vehicle.equipmentNumber, vehicle]));
      const vehicleRows = (vehicleErrors.result || []).filter(isCurrentError).slice(0,2).map(item => ({ equipmentNumber:item.equipmentNumber, model:item.equipmentName || menuByEquipment.get(item.equipmentNumber)?.equipmentName || '-', company:item.companyName || '-', title:item.errorItem || '차량 에러', errorCode:item.errorCode || '-', errorKind:'차량 에러', status:'현재', datetime:item.eventDatetimeTz || item.eventDatetime }));
      const batteryRows = (batteryErrors.result || []).filter(isCurrentError).slice(0,1).map(item => ({ equipmentNumber:item.equipmentNumber, model:item.codeName || menuByEquipment.get(item.equipmentNumber)?.equipmentName || '-', company:item.companyName || '-', title:item.errorItem || '배터리 에러', errorCode:item.errorCode || '-', errorKind:'배터리 에러', status:'현재', datetime:item.eventDatetime }));
      data.service.error = [...vehicleRows,...batteryRows].sort((a,b) => String(b.datetime).localeCompare(String(a.datetime)));
      data.service.supply = (supplies.result || []).slice(0,3).map(item => ({ equipmentNumber:item.equipmentNumber, model:item.equipmentName || menuByEquipment.get(item.equipmentNumber)?.equipmentName || '-', company:item.companyName || '-', title:item.scheduleName, detail:`${item.exchangeUseHour}H 사용 · 교체 기준 ${item.exchangeCycleHour}H`, usage:`${item.exchangeUseHour}H`, cycle:`${item.exchangeCycleHour}H`, percent:`${Number(item.per).toLocaleString('ko-KR',{maximumFractionDigits:2})}%`, status:Number(item.per)>=100?'교체 초과':'교체 권유', datetime:data.referenceDate }));
      const errorCounts = new Map();
      data.service.error.forEach(item => { const counts=errorCounts.get(item.equipmentNumber)||{vehicle:0,battery:0}; item.errorKind==='배터리 에러'?counts.battery++:counts.vehicle++; errorCounts.set(item.equipmentNumber,counts); });
      const supplyCounts = new Map();
      data.service.supply.forEach(item => supplyCounts.set(item.equipmentNumber,(supplyCounts.get(item.equipmentNumber)||0)+1));
      data.vehicles = menuVehicles.map(vehicle => {
        const dailyRow=dailyByEquipment.get(vehicle.equipmentNumber); const errors=errorCounts.get(vehicle.equipmentNumber)||{vehicle:0,battery:0}; const supplyCount=supplyCounts.get(vehicle.equipmentNumber)||0; const issues=[];
        if(errors.vehicle) issues.push(`차량 에러 ${errors.vehicle}건`); if(errors.battery) issues.push(`배터리 에러 ${errors.battery}건`); if(supplyCount) issues.push(`소모품 ${supplyCount}건`);
        return { equipmentNumber:vehicle.equipmentNumber, model:vehicle.equipmentName || vehicle.codeName || '-', company:vehicle.companyName || '-', groupName:vehicle.groupName, power:fuelName[vehicle.fuelTypeCode] || vehicle.fuelTypeCode || '-', connection:normalizeConnection(dailyRow), status:issues.length?'attention':'normal', issue:issues.join(' · ') || '정상' };
      });
      data.priority = [...data.service.error.map(item => ({...item,type:'error'})), ...data.service.supply.map(item => ({...item,type:'supply'}))].sort((a,b) => String(b.datetime).localeCompare(String(a.datetime)));
    } catch (error) { console.warn('캡처 데이터를 불러오지 못해 기본 데이터를 표시합니다.', error); }
  }

  function formatDate(value) {
    if (!value) return '-';
    const match=String(value).match(/(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
    return match ? `${match[2]}.${match[3]}${match[4]?` ${match[4]}:${match[5]}`:''}` : String(value);
  }

  function periodLabel() {
    if (selectedPeriod === 'day') return '2026.08.13';
    if (selectedPeriod === 'week') return '2026.08.07 ~ 2026.08.13';
    return data.sourcePeriod || '2026.08.01 ~ 2026.08.13';
  }

  function iconName(item) { return item.type === 'supply' ? 'refresh-cw' : item.errorKind === '배터리 에러' ? 'battery' : 'triangle-alert'; }

  function render() {
    const errors=(data.service?.error||[]).filter(item => item.status === '현재');
    const supplies=(data.service?.supply||[]).filter(item => !item.completed);
    const maintenance=data.service?.maintenance||[];
    const priority=[...errors.map(item=>({...item,type:'error'})),...supplies.map(item=>({...item,type:'supply'}))].sort((a,b)=>String(b.datetime).localeCompare(String(a.datetime)));
    const vehicles=data.vehicles||[];
    $$('[data-period-label]').forEach(node => { node.textContent=periodLabel(); });
    $$('[data-error-total]').forEach(node => { node.textContent=errors.length; });
    $$('[data-supply-total]').forEach(node => { node.textContent=supplies.length; });
    $$('[data-maintenance-total]').forEach(node => { node.textContent=maintenance.length; });
    $$('[data-priority-total]').forEach(node => { node.textContent=`${priority.length}건`; });
    $$('[data-notification-count]').forEach(node => { node.textContent=priority.length; });
    $$('[data-vehicle-total]').forEach(node => { node.textContent=vehicles.length; });
    $$('[data-vehicle-attention]').forEach(node => { node.textContent=vehicles.filter(item=>item.status==='attention').length; });
    $$('[data-vehicle-normal]').forEach(node => { node.textContent=vehicles.filter(item=>item.status==='normal').length; });

    const detailList=$('[data-detail-status-list]');
    if(detailList) detailList.innerHTML=priority.slice(0,5).map(item=>`<button class="detail-status-row ${item.type==='supply'?'is-supply':''}" type="button" data-open-current><i><svg data-lucide="${iconName(item)}"></svg></i><span><strong>${item.equipmentNumber} · ${item.title}</strong><small>${item.model} · ${item.company}</small></span><em>${formatDate(item.datetime)}</em></button>`).join('');
    const alertList=$('[data-alert-list]');
    if(alertList) alertList.innerHTML=priority.slice(0,4).map(item=>`<button class="variant-alert-row" type="button" data-open-current><span><strong>${item.type==='supply'?'소모품 교체 권유':item.errorKind} · ${item.equipmentNumber}</strong><small>${item.type==='supply'?(item.detail||item.title):`에러코드 ${item.errorCode} · ${item.title}`}</small></span><time>${formatDate(item.datetime)}</time></button>`).join('');
    const compactList=$('[data-compact-action-list]');
    if(compactList) compactList.innerHTML=priority.slice(0,4).map(item=>`<button class="compact-action-row ${item.type==='supply'?'is-supply':''}" type="button" data-open-current><i><svg data-lucide="${iconName(item)}"></svg></i><span><strong>${item.equipmentNumber}</strong><small>${item.title} · ${item.company}</small></span><em><b>${item.type==='supply'?'소모품':item.errorKind}</b>${formatDate(item.datetime)}</em></button>`).join('');
    if(window.lucide) window.lucide.createIcons();
    $$('[data-open-current]').forEach(button => button.addEventListener('click', () => { window.location.href='./index.html'; }));
  }

  $$('[data-period]').forEach(button => button.addEventListener('click', () => {
    selectedPeriod=button.dataset.period;
    $$('[data-period]').forEach(item => item.classList.toggle('is-active',item===button));
    $$('[data-period-label]').forEach(node => { node.textContent=periodLabel(); });
  }));
  hydrateCapturedData().finally(render);
})();
